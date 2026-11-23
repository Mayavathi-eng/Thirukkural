import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import * as dotenv from 'dotenv';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  activities,
  analyticsEvents,
  articles,
  classes,
  contactMessages,
  kuralChapters,
  kurals,
  meditations,
  presentations,
  quizAttempts,
  quizQuestions,
  quizzes,
  siteSettings,
  studyMaterials,
  userBookmarks,
  userProgress,
  vedantaCategories,
} from './src/db/schema.ts';
import { ensureSeeded } from './src/db/seed.ts';
import { getAllUsers, updateUserRole } from './src/db/users.ts';
import {
  AuthRequest,
  optionalAuth,
  requireAdmin,
  requireAuth,
  requireEditorOrAdmin,
} from './src/middleware/auth.ts';
import { generateSanctuaryWav, generateSimplePdfBuffer } from './src/server/mediaGenerator.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json({ limit: '4mb' }));

// Safe file upload storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const cleanBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${cleanBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

function sanitizeUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

async function trackEvent(eventType: string, resourceType: string, resourceId?: number) {
  try {
    await db.insert(analyticsEvents).values({
      eventType,
      resourceType,
      resourceId: resourceId ?? null,
    });
  } catch (err) {
    console.warn('Analytics event insert skipped:', err);
  }
}

// Serve uploaded files safely with strict path confinement
app.get('/api/uploads/:filename', (req: Request, res: Response) => {
  const filename = path.basename(String(req.params.filename || ''));
  if (!filename) return res.status(400).json({ error: 'Invalid filename' });
  const resolved = path.resolve(UPLOAD_DIR, filename);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) {
    return res.status(403).json({ error: 'Forbidden path' });
  }
  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ error: 'File not found' });
  }
  if (req.query.download === '1') {
    return res.download(resolved, filename);
  }
  return res.sendFile(resolved);
});

// Real playable & downloadable WAV audio streaming with Range support
app.get('/api/media/audio/:slug', (req: Request, res: Response) => {
  const slug = String(req.params.slug || 'default');
  const wav = generateSanctuaryWav(slug);
  const total = wav.length;
  const range = req.headers.range;

  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Accept-Ranges', 'bytes');
  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}.wav"`);
  }

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
      if (start >= total || start > end) {
        return res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
      }
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
      res.setHeader('Content-Length', end - start + 1);
      return res.send(wav.subarray(start, end + 1));
    }
  }

  res.setHeader('Content-Length', total);
  return res.send(wav);
});

// Real downloadable PDF study materials / kural sheets / presentation handouts
app.get('/api/media/pdf/:slug', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const slug = String(req.params.slug || '');
    let title = 'Tamil Wisdom Study Resource';
    let subtitle = 'Thirukkural & Vedanta Digital Learning Platform';
    const paragraphs: string[] = [];

    if (slug.startsWith('kural-')) {
      const kNum = Number(slug.replace('kural-', ''));
      const [k] = await db.select().from(kurals).where(eq(kurals.number, kNum)).limit(1);
      if (k) {
        title = `Thirukkural #${k.number} - ${k.chapterNameEn}`;
        subtitle = `Division: ${k.divisionEn} | Chapter ${k.chapterNumber}`;
        paragraphs.push(`Transliteration: ${k.transliteration}`);
        paragraphs.push(`English Translation: ${k.translationEn}`);
        paragraphs.push(`Explanation: ${k.explanationEn}`);
        paragraphs.push('Note: Full Tamil Unicode text is viewable directly on the web study card.');
      }
    } else if (slug.startsWith('ppt-')) {
      const [ppt] = await db.select().from(presentations).where(eq(presentations.slug, slug)).limit(1);
      if (ppt) {
        title = ppt.titleEn;
        subtitle = `Topic: ${ppt.topic}`;
        const slides = Array.isArray(ppt.slidesJson) ? (ppt.slidesJson as any[]) : [];
        slides.forEach((s, idx) => {
          paragraphs.push(`Slide ${idx + 1}: ${s.titleEn || ''}`);
          if (Array.isArray(s.bulletsEn)) {
            s.bulletsEn.forEach((b: string) => paragraphs.push(` - ${b}`));
          }
        });
      }
    } else {
      const [mat] = await db.select().from(studyMaterials).where(eq(studyMaterials.slug, slug)).limit(1);
      if (mat) {
        title = mat.titleEn;
        subtitle = `${mat.materialType} | Language: ${mat.language}`;
        paragraphs.push(mat.summaryEn);
      } else {
        const [cls] = await db.select().from(classes).where(eq(classes.slug, slug.replace(/^notes-/, ''))).limit(1);
        if (cls) {
          title = cls.titleEn;
          subtitle = cls.chapterTitleEn;
          paragraphs.push(cls.descriptionEn);
          paragraphs.push(cls.notesEn);
        } else {
          paragraphs.push('Free open-access study material from Tamil Wisdom Digital Library.');
          paragraphs.push('Learn Freely. Think Deeply. Live Wisely.');
        }
      }
    }

    const pdf = generateSimplePdfBuffer(title, subtitle, paragraphs);
    const safeName = slug.replace(/[^a-zA-Z0-9_-]/g, '_') || 'tamil-wisdom-guide';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    await trackEvent('download', 'pdf', undefined);
    return res.send(pdf);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return res.status(500).json({ error: 'Failed to prepare downloadable PDF.' });
  }
});

// Bootstrap endpoint for homepage & global data
app.get('/api/bootstrap', async (_req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const [
      chapters,
      featuredKurals,
      allKurals,
      categories,
      classList,
      pptList,
      materialList,
      articleList,
      quizList,
      activityList,
      meditationList,
      settingsRows,
    ] = await Promise.all([
      db.select().from(kuralChapters).orderBy(asc(kuralChapters.chapterNumber)),
      db.select().from(kurals).where(eq(kurals.featured, true)).orderBy(asc(kurals.number)),
      db.select().from(kurals).orderBy(asc(kurals.number)),
      db.select().from(vedantaCategories).orderBy(asc(vedantaCategories.sortOrder)),
      db.select().from(classes).orderBy(asc(classes.id)),
      db.select().from(presentations).orderBy(asc(presentations.id)),
      db.select().from(studyMaterials).orderBy(asc(studyMaterials.id)),
      db.select().from(articles).orderBy(desc(articles.featured), asc(articles.id)),
      db.select().from(quizzes).orderBy(asc(quizzes.id)),
      db.select().from(activities).orderBy(asc(activities.sortOrder)),
      db.select().from(meditations).orderBy(asc(meditations.id)),
      db.select().from(siteSettings),
    ]);

    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const dailyKural =
      allKurals.length > 0 ? allKurals[dayIndex % allKurals.length] : null;
    const dailyQuotePool = featuredKurals.length > 0 ? featuredKurals : allKurals;
    const dailyVedantaClass =
      classList.length > 0 ? classList[dayIndex % classList.length] : null;

    const settings: Record<string, unknown> = {};
    for (const s of settingsRows) settings[s.key] = s.valueJson;

    res.json({
      dailyKural,
      dailyQuotePool,
      dailyVedantaClass,
      chapters,
      kurals: allKurals,
      categories,
      classes: classList,
      presentations: pptList,
      studyMaterials: materialList,
      articles: articleList,
      quizzes: quizList,
      activities: activityList,
      meditations: meditationList,
      settings,
    });
  } catch (error) {
    console.error('Bootstrap query failed:', error);
    res.status(500).json({ error: 'Unable to load platform content right now.' });
  }
});

// Thirukkural APIs
app.get('/api/kurals', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const division = req.query.division ? String(req.query.division) : '';
    const chapter = req.query.chapter ? Number(req.query.chapter) : 0;
    const q = req.query.q ? String(req.query.q).trim() : '';

    const conditions = [];
    if (division) conditions.push(eq(kurals.divisionEn, division));
    if (chapter > 0) conditions.push(eq(kurals.chapterNumber, chapter));
    if (q) {
      const numQ = Number(q);
      if (!Number.isNaN(numQ) && numQ >= 1 && numQ <= 1330) {
        conditions.push(eq(kurals.number, numQ));
      } else {
        conditions.push(
          or(
            ilike(kurals.line1Ta, `%${q}%`),
            ilike(kurals.line2Ta, `%${q}%`),
            ilike(kurals.simpleExplanationTa, `%${q}%`),
            ilike(kurals.translationEn, `%${q}%`),
            ilike(kurals.explanationEn, `%${q}%`),
            ilike(kurals.chapterNameEn, `%${q}%`),
            ilike(kurals.chapterNameTa, `%${q}%`)
          )
        );
      }
    }

    const rows =
      conditions.length > 0
        ? await db.select().from(kurals).where(and(...conditions)).orderBy(asc(kurals.number))
        : await db.select().from(kurals).orderBy(asc(kurals.number));

    res.json(rows);
  } catch (error) {
    console.error('Failed to query kurals:', error);
    res.status(500).json({ error: 'Failed to load Thirukkural library.' });
  }
});

app.get('/api/kurals/:number', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const num = Number(req.params.number);
    if (Number.isNaN(num) || num < 1 || num > 1330) {
      return res.status(400).json({ error: 'Kural number must be between 1 and 1330.' });
    }
    const [kural] = await db.select().from(kurals).where(eq(kurals.number, num)).limit(1);
    const chapterNumber = Math.ceil(num / 10);
    const [chapter] = await db
      .select()
      .from(kuralChapters)
      .where(eq(kuralChapters.chapterNumber, chapterNumber))
      .limit(1);

    await trackEvent('view', 'kural', num);
    res.json({ kural: kural || null, chapter: chapter || null, number: num });
  } catch (error) {
    console.error('Failed to fetch kural:', error);
    res.status(500).json({ error: 'Failed to load Kural details.' });
  }
});

// Quizzes with Questions
app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid quiz ID' });
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, id))
      .orderBy(asc(quizQuestions.id));
    res.json({ quiz, questions });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    res.status(500).json({ error: 'Failed to load quiz.' });
  }
});

app.post('/api/quizzes/:id/attempt', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureSeeded();
    const quizId = Number(req.params.id);
    const { score, totalQuestions, mode } = req.body || {};
    if (Number.isNaN(quizId) || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({ error: 'Invalid attempt payload' });
    }
    const [saved] = await db
      .insert(quizAttempts)
      .values({
        userId: req.dbUser?.id ?? null,
        quizId,
        mode: typeof mode === 'string' ? mode : 'practice',
        score,
        totalQuestions,
      })
      .returning();
    await trackEvent('quiz_complete', 'quiz', quizId);
    res.json(saved);
  } catch (error) {
    console.error('Failed to record quiz attempt:', error);
    res.status(500).json({ error: 'Failed to save quiz attempt.' });
  }
});

// Universal Smart Search across entire platform
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || 'all');
    if (!q) {
      return res.json({
        kurals: [],
        chapters: [],
        classes: [],
        presentations: [],
        materials: [],
        articles: [],
        quizzes: [],
      });
    }

    const numQ = Number(q);
    const isKuralNum = !Number.isNaN(numQ) && numQ >= 1 && numQ <= 1330;

    const [kuralHits, chapterHits, classHits, pptHits, matHits, artHits, quizHits] =
      await Promise.all([
        category === 'all' || category === 'kurals'
          ? db
              .select()
              .from(kurals)
              .where(
                isKuralNum
                  ? eq(kurals.number, numQ)
                  : or(
                      ilike(kurals.line1Ta, `%${q}%`),
                      ilike(kurals.line2Ta, `%${q}%`),
                      ilike(kurals.simpleExplanationTa, `%${q}%`),
                      ilike(kurals.translationEn, `%${q}%`),
                      ilike(kurals.explanationEn, `%${q}%`),
                      ilike(kurals.chapterNameEn, `%${q}%`),
                      ilike(kurals.chapterNameTa, `%${q}%`)
                    )
              )
              .limit(20)
          : Promise.resolve([]),
        category === 'all' || category === 'kurals'
          ? db
              .select()
              .from(kuralChapters)
              .where(
                or(
                  ilike(kuralChapters.nameEn, `%${q}%`),
                  ilike(kuralChapters.nameTa, `%${q}%`),
                  ilike(kuralChapters.divisionEn, `%${q}%`),
                  ilike(kuralChapters.divisionTa, `%${q}%`)
                )
              )
              .limit(15)
          : Promise.resolve([]),
        category === 'all' || category === 'classes'
          ? db
              .select()
              .from(classes)
              .where(
                or(
                  ilike(classes.titleEn, `%${q}%`),
                  ilike(classes.titleTa, `%${q}%`),
                  ilike(classes.descriptionEn, `%${q}%`),
                  ilike(classes.descriptionTa, `%${q}%`),
                  ilike(classes.categorySlug, `%${q}%`)
                )
              )
              .limit(15)
          : Promise.resolve([]),
        category === 'all' || category === 'presentations'
          ? db
              .select()
              .from(presentations)
              .where(
                or(
                  ilike(presentations.titleEn, `%${q}%`),
                  ilike(presentations.titleTa, `%${q}%`),
                  ilike(presentations.topic, `%${q}%`)
                )
              )
              .limit(10)
          : Promise.resolve([]),
        category === 'all' || category === 'materials'
          ? db
              .select()
              .from(studyMaterials)
              .where(
                or(
                  ilike(studyMaterials.titleEn, `%${q}%`),
                  ilike(studyMaterials.titleTa, `%${q}%`),
                  ilike(studyMaterials.summaryEn, `%${q}%`)
                )
              )
              .limit(10)
          : Promise.resolve([]),
        category === 'all' || category === 'articles'
          ? db
              .select()
              .from(articles)
              .where(
                or(
                  ilike(articles.titleEn, `%${q}%`),
                  ilike(articles.titleTa, `%${q}%`),
                  ilike(articles.excerptEn, `%${q}%`),
                  ilike(articles.category, `%${q}%`)
                )
              )
              .limit(10)
          : Promise.resolve([]),
        category === 'all' || category === 'quizzes'
          ? db
              .select()
              .from(quizzes)
              .where(
                or(
                  ilike(quizzes.titleEn, `%${q}%`),
                  ilike(quizzes.titleTa, `%${q}%`),
                  ilike(quizzes.category, `%${q}%`)
                )
              )
              .limit(10)
          : Promise.resolve([]),
      ]);

    res.json({
      kurals: kuralHits,
      chapters: chapterHits,
      classes: classHits,
      presentations: pptHits,
      materials: matHits,
      articles: artHits,
      quizzes: quizHits,
    });
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'Search encountered an issue.' });
  }
});

// Contact form
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    await ensureSeeded();
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const [saved] = await db
      .insert(contactMessages)
      .values({
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 160),
        subject: String(subject).slice(0, 200),
        message: String(message).slice(0, 3000),
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Failed to save contact message:', error);
    res.status(500).json({ error: 'Failed to submit message.' });
  }
});

// Analytics event tracking
app.post('/api/analytics/event', async (req: Request, res: Response) => {
  const { eventType, resourceType, resourceId } = req.body || {};
  if (typeof eventType === 'string' && typeof resourceType === 'string') {
    await trackEvent(eventType, resourceType, typeof resourceId === 'number' ? resourceId : undefined);
  }
  res.json({ ok: true });
});

// Authenticated User Account, Bookmarks & Learning Progress
app.get('/api/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ensureSeeded();
    const userId = req.dbUser!.id;
    const [bookmarks, progress, attempts] = await Promise.all([
      db.select().from(userBookmarks).where(eq(userBookmarks.userId, userId)),
      db.select().from(userProgress).where(eq(userProgress.userId, userId)).orderBy(desc(userProgress.updatedAt)),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.createdAt)),
    ]);
    res.json({ user: req.dbUser, bookmarks, progress, attempts });
  } catch (error) {
    console.error('Failed to load profile:', error);
    res.status(500).json({ error: 'Failed to load your learning profile.' });
  }
});

app.post('/api/bookmarks/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const { itemType, itemId } = req.body || {};
    if (!['kural', 'class', 'article'].includes(itemType) || typeof itemId !== 'number') {
      return res.status(400).json({ error: 'Invalid bookmark parameters' });
    }
    const existing = await db
      .select()
      .from(userBookmarks)
      .where(
        and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.itemType, itemType),
          eq(userBookmarks.itemId, itemId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(userBookmarks).where(eq(userBookmarks.id, existing[0].id));
      return res.json({ bookmarked: false });
    }
    await db.insert(userBookmarks).values({ userId, itemType, itemId });
    return res.json({ bookmarked: true });
  } catch (error) {
    console.error('Bookmark toggle failed:', error);
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

app.post('/api/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const { itemType, itemId, progressPercent, lastPositionSeconds } = req.body || {};
    if (
      !['audio', 'video', 'kural', 'class', 'meditation'].includes(itemType) ||
      typeof itemId !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid progress payload' });
    }
    const pct = Math.max(0, Math.min(100, Number(progressPercent || 0)));
    const sec = Math.max(0, Number(lastPositionSeconds || 0));

    const [saved] = await db
      .insert(userProgress)
      .values({
        userId,
        itemType,
        itemId,
        progressPercent: pct,
        lastPositionSeconds: sec,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.itemType, userProgress.itemId],
        set: {
          progressPercent: pct,
          lastPositionSeconds: sec,
          updatedAt: new Date(),
        },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Progress update failed:', error);
    res.status(500).json({ error: 'Failed to update learning progress.' });
  }
});

// ================= ADMIN & EDITOR CMS ROUTES =================

app.get('/api/admin/overview', requireEditorOrAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    await ensureSeeded();
    const [
      [{ value: kuralCount }],
      [{ value: chapterCount }],
      [{ value: classCount }],
      [{ value: articleCount }],
      [{ value: materialCount }],
      [{ value: pptCount }],
      [{ value: quizCount }],
      [{ value: attemptCount }],
      [{ value: eventCount }],
      messages,
      directory,
    ] = await Promise.all([
      db.select({ value: count() }).from(kurals),
      db.select({ value: count() }).from(kuralChapters),
      db.select({ value: count() }).from(classes),
      db.select({ value: count() }).from(articles),
      db.select({ value: count() }).from(studyMaterials),
      db.select({ value: count() }).from(presentations),
      db.select({ value: count() }).from(quizzes),
      db.select({ value: count() }).from(quizAttempts),
      db.select({ value: count() }).from(analyticsEvents),
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(20),
      getAllUsers(),
    ]);

    const recentEvents = await db
      .select({
        eventType: analyticsEvents.eventType,
        total: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType);

    res.json({
      counts: {
        kurals: kuralCount,
        chapters: chapterCount,
        classes: classCount,
        articles: articleCount,
        materials: materialCount,
        presentations: pptCount,
        quizzes: quizCount,
        quizAttempts: attemptCount,
        analyticsEvents: eventCount,
      },
      eventBreakdown: recentEvents,
      messages,
      users: directory,
    });
  } catch (error) {
    console.error('Admin overview failed:', error);
    res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

app.post(
  '/api/admin/upload',
  requireEditorOrAdmin,
  upload.single('file'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    return res.json({
      url: `/api/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }
);

app.post('/api/admin/kurals', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const number = Number(b.number);
    if (Number.isNaN(number) || number < 1 || number > 1330) {
      return res.status(400).json({ error: 'Kural number must be between 1 and 1330.' });
    }
    const chapterNumber = Math.ceil(number / 10);
    const [ch] = await db
      .select()
      .from(kuralChapters)
      .where(eq(kuralChapters.chapterNumber, chapterNumber))
      .limit(1);

    const [saved] = await db
      .insert(kurals)
      .values({
        number,
        chapterNumber,
        divisionEn: ch?.divisionEn || b.divisionEn || 'Arathuppaal',
        divisionTa: ch?.divisionTa || b.divisionTa || 'அறத்துப்பால்',
        chapterNameEn: ch?.nameEn || b.chapterNameEn || 'Chapter',
        chapterNameTa: ch?.nameTa || b.chapterNameTa || 'அதிகாரம்',
        line1Ta: String(b.line1Ta || ''),
        line2Ta: String(b.line2Ta || ''),
        transliteration: String(b.transliteration || ''),
        wordByWordTa: String(b.wordByWordTa || ''),
        simpleExplanationTa: String(b.simpleExplanationTa || ''),
        commentaryTa: String(b.commentaryTa || ''),
        translationEn: String(b.translationEn || ''),
        explanationEn: String(b.explanationEn || ''),
        audioUrl: sanitizeUrl(b.audioUrl) || `/api/media/audio/kural-${number}`,
        studyPdfUrl: sanitizeUrl(b.studyPdfUrl) || `/api/media/pdf/kural-${number}`,
        featured: Boolean(b.featured),
      })
      .onConflictDoUpdate({
        target: kurals.number,
        set: {
          line1Ta: String(b.line1Ta || ''),
          line2Ta: String(b.line2Ta || ''),
          transliteration: String(b.transliteration || ''),
          wordByWordTa: String(b.wordByWordTa || ''),
          simpleExplanationTa: String(b.simpleExplanationTa || ''),
          commentaryTa: String(b.commentaryTa || ''),
          translationEn: String(b.translationEn || ''),
          explanationEn: String(b.explanationEn || ''),
          featured: Boolean(b.featured),
        },
      })
      .returning();

    res.json(saved);
  } catch (error) {
    console.error('Admin kural save failed:', error);
    res.status(500).json({ error: 'Failed to save Kural.' });
  }
});

app.post('/api/admin/chapters', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const chapterNumber = Number(b.chapterNumber);
    if (Number.isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 133) {
      return res.status(400).json({ error: 'Chapter number must be 1–133.' });
    }
    const [saved] = await db
      .update(kuralChapters)
      .set({
        nameEn: String(b.nameEn || ''),
        nameTa: String(b.nameTa || ''),
        sectionEn: String(b.sectionEn || ''),
        sectionTa: String(b.sectionTa || ''),
      })
      .where(eq(kuralChapters.chapterNumber, chapterNumber))
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin chapter update failed:', error);
    res.status(500).json({ error: 'Failed to update chapter.' });
  }
});

app.post('/api/admin/categories', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    if (!b.slug || !b.titleEn || !b.titleTa) {
      return res.status(400).json({ error: 'Slug, English title, and Tamil title are required.' });
    }
    const [saved] = await db
      .insert(vedantaCategories)
      .values({
        slug: String(b.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        titleEn: String(b.titleEn),
        titleTa: String(b.titleTa),
        descriptionEn: String(b.descriptionEn || ''),
        descriptionTa: String(b.descriptionTa || ''),
        sortOrder: Number(b.sortOrder || 8),
      })
      .onConflictDoUpdate({
        target: vedantaCategories.slug,
        set: {
          titleEn: String(b.titleEn),
          titleTa: String(b.titleTa),
          descriptionEn: String(b.descriptionEn || ''),
          descriptionTa: String(b.descriptionTa || ''),
        },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin category save failed:', error);
    res.status(500).json({ error: 'Failed to save category.' });
  }
});

app.post('/api/admin/classes', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    if (!b.titleEn || !b.titleTa || !b.categorySlug) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }
    const slug =
      String(b.slug || b.titleEn)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `class-${Date.now()}`;

    const [saved] = await db
      .insert(classes)
      .values({
        slug,
        categorySlug: String(b.categorySlug),
        chapterTitleEn: String(b.chapterTitleEn || 'Module'),
        chapterTitleTa: String(b.chapterTitleTa || 'பகுதி'),
        titleEn: String(b.titleEn),
        titleTa: String(b.titleTa),
        descriptionEn: String(b.descriptionEn || ''),
        descriptionTa: String(b.descriptionTa || ''),
        notesTa: String(b.notesTa || ''),
        notesEn: String(b.notesEn || ''),
        audioUrl: sanitizeUrl(b.audioUrl) || `/api/media/audio/${slug}`,
        videoUrl: sanitizeUrl(b.videoUrl) || `/api/media/video/${slug}`,
        pptUrl: sanitizeUrl(b.pptUrl),
        pdfUrl: sanitizeUrl(b.pdfUrl) || `/api/media/pdf/notes-${slug}`,
        durationMinutes: Number(b.durationMinutes || 30),
        allowDownload: b.allowDownload !== false,
        featured: Boolean(b.featured),
      })
      .onConflictDoUpdate({
        target: classes.slug,
        set: {
          titleEn: String(b.titleEn),
          titleTa: String(b.titleTa),
          descriptionEn: String(b.descriptionEn || ''),
          descriptionTa: String(b.descriptionTa || ''),
          notesTa: String(b.notesTa || ''),
          notesEn: String(b.notesEn || ''),
          audioUrl: sanitizeUrl(b.audioUrl) || `/api/media/audio/${slug}`,
          videoUrl: sanitizeUrl(b.videoUrl) || `/api/media/video/${slug}`,
          pptUrl: sanitizeUrl(b.pptUrl),
          pdfUrl: sanitizeUrl(b.pdfUrl) || `/api/media/pdf/notes-${slug}`,
          allowDownload: b.allowDownload !== false,
        },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin class save failed:', error);
    res.status(500).json({ error: 'Failed to save class.' });
  }
});

app.delete('/api/admin/classes/:id', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(classes).where(eq(classes.id, Number(req.params.id)));
    res.json({ deleted: true });
  } catch (error) {
    console.error('Admin delete class failed:', error);
    res.status(500).json({ error: 'Failed to delete class.' });
  }
});

app.post('/api/admin/presentations', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const slug =
      String(b.slug || b.titleEn || `ppt-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const slides = Array.isArray(b.slidesJson)
      ? b.slidesJson
      : [
          {
            titleTa: String(b.titleTa || ''),
            titleEn: String(b.titleEn || ''),
            bulletsTa: [String(b.summaryTa || 'வேதாந்த விளக்கக் குறிப்பு')],
            bulletsEn: [String(b.summaryEn || 'Presentation overview slide')],
            quote: String(b.quote || ''),
          },
        ];

    const [saved] = await db
      .insert(presentations)
      .values({
        slug,
        titleEn: String(b.titleEn || 'Presentation'),
        titleTa: String(b.titleTa || 'விளக்கக் காட்சி'),
        topic: String(b.topic || 'Vedanta'),
        categorySlug: String(b.categorySlug || 'general-talks'),
        slidesJson: slides,
        pptFileUrl: sanitizeUrl(b.pptFileUrl) || `/api/media/pdf/${slug}`,
        pdfFileUrl: sanitizeUrl(b.pdfFileUrl) || `/api/media/pdf/${slug}`,
        allowDownload: b.allowDownload !== false,
        featured: Boolean(b.featured),
      })
      .onConflictDoUpdate({
        target: presentations.slug,
        set: {
          titleEn: String(b.titleEn || 'Presentation'),
          titleTa: String(b.titleTa || 'விளக்கக் காட்சி'),
          slidesJson: slides,
          pptFileUrl: sanitizeUrl(b.pptFileUrl) || `/api/media/pdf/${slug}`,
          allowDownload: b.allowDownload !== false,
        },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin presentation save failed:', error);
    res.status(500).json({ error: 'Failed to save presentation.' });
  }
});

app.post('/api/admin/materials', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const slug =
      String(b.slug || b.titleEn || `mat-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const [saved] = await db
      .insert(studyMaterials)
      .values({
        slug,
        titleEn: String(b.titleEn || 'Study Material'),
        titleTa: String(b.titleTa || 'கல்விக் குறிப்பு'),
        materialType: String(b.materialType || 'PDF Document'),
        language: String(b.language || 'Bilingual'),
        categorySlug: String(b.categorySlug || 'general-talks'),
        summaryEn: String(b.summaryEn || ''),
        summaryTa: String(b.summaryTa || ''),
        fileUrl: sanitizeUrl(b.fileUrl) || `/api/media/pdf/${slug}`,
        allowDownload: b.allowDownload !== false,
        featured: Boolean(b.featured),
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin material save failed:', error);
    res.status(500).json({ error: 'Failed to save study material.' });
  }
});

app.post('/api/admin/articles', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const slug =
      String(b.slug || b.titleEn || `art-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const [saved] = await db
      .insert(articles)
      .values({
        slug,
        titleEn: String(b.titleEn || ''),
        titleTa: String(b.titleTa || ''),
        excerptEn: String(b.excerptEn || ''),
        excerptTa: String(b.excerptTa || ''),
        bodyEn: String(b.bodyEn || ''),
        bodyTa: String(b.bodyTa || ''),
        category: String(b.category || 'Vedanta'),
        author: String(b.author || 'Swamiji Editorial Desk'),
        readMinutes: Number(b.readMinutes || 5),
        featured: Boolean(b.featured),
      })
      .onConflictDoUpdate({
        target: articles.slug,
        set: {
          titleEn: String(b.titleEn || ''),
          titleTa: String(b.titleTa || ''),
          bodyEn: String(b.bodyEn || ''),
          bodyTa: String(b.bodyTa || ''),
        },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin article save failed:', error);
    res.status(500).json({ error: 'Failed to save article.' });
  }
});

app.post('/api/admin/quizzes', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const slug =
      String(b.slug || b.titleEn || `quiz-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const [quiz] = await db
      .insert(quizzes)
      .values({
        slug,
        titleEn: String(b.titleEn || ''),
        titleTa: String(b.titleTa || ''),
        category: String(b.category || 'Thirukkural'),
        difficulty: String(b.difficulty || 'Beginner'),
        isDaily: Boolean(b.isDaily),
        descriptionEn: String(b.descriptionEn || ''),
        descriptionTa: String(b.descriptionTa || ''),
      })
      .returning();

    if (Array.isArray(b.questions) && b.questions.length > 0) {
      await db.insert(quizQuestions).values(
        b.questions.map((q: any) => ({
          quizId: quiz.id,
          questionType: String(q.questionType || 'mcq'),
          promptEn: String(q.promptEn || ''),
          promptTa: String(q.promptTa || ''),
          optionsJson: Array.isArray(q.optionsJson) ? q.optionsJson : ['Option A', 'Option B'],
          correctAnswer: String(q.correctAnswer || ''),
          explanationEn: String(q.explanationEn || ''),
          explanationTa: String(q.explanationTa || ''),
        }))
      );
    }
    res.json(quiz);
  } catch (error) {
    console.error('Admin quiz save failed:', error);
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
});

app.post('/api/admin/meditations', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body || {};
    const slug =
      String(b.slug || b.titleEn || `med-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const [saved] = await db
      .insert(meditations)
      .values({
        slug,
        titleEn: String(b.titleEn || ''),
        titleTa: String(b.titleTa || ''),
        category: String(b.category || 'Guided Audio'),
        durationMinutes: Number(b.durationMinutes || 10),
        instructionsTa: String(b.instructionsTa || ''),
        instructionsEn: String(b.instructionsEn || ''),
        breathingPattern: String(b.breathingPattern || '4-4-6'),
        audioUrl: sanitizeUrl(b.audioUrl) || `/api/media/audio/${slug}`,
        videoUrl: sanitizeUrl(b.videoUrl) || `/api/media/video/${slug}`,
        featured: Boolean(b.featured),
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin meditation save failed:', error);
    res.status(500).json({ error: 'Failed to save meditation.' });
  }
});

app.post('/api/admin/settings', requireEditorOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key, valueJson } = req.body || {};
    if (!key || !valueJson) return res.status(400).json({ error: 'Invalid settings payload' });
    const [saved] = await db
      .insert(siteSettings)
      .values({ key: String(key), valueJson })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { valueJson, updatedAt: new Date() },
      })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Admin settings update failed:', error);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

app.patch('/api/admin/users/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body || {};
    if (!['learner', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const updated = await updateUserRole(userId, role);
    res.json(updated);
  } catch (error) {
    console.error('Admin role update failed:', error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tamil Wisdom server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
