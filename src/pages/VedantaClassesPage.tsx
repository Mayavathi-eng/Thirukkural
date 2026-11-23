import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Download,
  FileText,
  Headphones,
  HelpCircle,
  Presentation as PresentationIcon,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PresentationViewer, VideoLessonPlayer } from '../components/MediaPlayers.tsx';
import type { VedantaClass } from '../types.ts';

export function VedantaClassesPage({ categorySlug }: { categorySlug?: string }) {
  const { data, lang, navigate, playTrack, isBookmarked, toggleBookmark } = useApp();
  const [activeVideoLesson, setActiveVideoLesson] = useState<VedantaClass | null>(null);
  const [activePptId, setActivePptId] = useState<number | null>(null);

  if (!data) return null;

  if (!categorySlug) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#C49A45]/25 pb-10">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
              {lang === 'ta' ? 'சுவாமிஜியின் வேதாந்தக் கல்வி மையம்' : "Swamiji's Vedanta Learning Centre"}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              {lang === 'ta' ? 'ஏழு பெரும் வேதாந்தப் பிரிவுகள்' : 'Seven Pillars of Vedantic Study'}
            </h1>
            <p className="text-base text-[#725648] dark:text-[#CBBBA4] leading-relaxed max-w-2xl">
              {lang === 'ta'
                ? 'அடிப்படை அறிமுகம் முதல் பகவத்கீதை, உபநிஷத்துக்கள், பிரம்ம சூத்திரம் மற்றும் தியானம் வரை சுவாமிஜியின் முழுமையான வகுப்புகளை இலவசமாகக் கற்கலாம்.'
                : 'Explore Swamiji’s structured courses across seven disciplines—complete with audio lectures, synchronized video sessions, slide decks, class notes, related articles, and quizzes.'}
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-[#C49A45]/35 aspect-[4/3]">
              <img
                src="/src/assets/images/vedanta_scriptures_1795408079148.jpg"
                alt="Traditional Tamil and Sanskrit Vedanta manuscripts on carved teak bookrest"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.categories.map((cat, idx) => {
            const countInCat = data.classes.filter((c) => c.categorySlug === cat.slug).length;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/classes/${cat.slug}`)}
                className="text-left rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5 hover:border-[#762B35] transition-colors"
              >
                <div className="space-y-2.5">
                  <p className="text-xs font-mono-num text-[#762B35] dark:text-[#E6A946]">
                    0{idx + 1}. · {countInCat} {lang === 'ta' ? 'வகுப்புகள்' : 'classes'}
                  </p>
                  <h2 className="text-2xl font-bold">
                    {lang === 'ta' ? cat.titleTa : cat.titleEn}
                  </h2>
                  <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                    {lang === 'ta' ? cat.descriptionTa : cat.descriptionEn}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#762B35] dark:text-[#E6A946]">
                  <span>{lang === 'ta' ? 'பிரிவைத் திற' : 'Enter Category'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const category = data.categories.find((c) => c.slug === categorySlug);
  const categoryClasses = data.classes.filter((c) => c.categorySlug === categorySlug);
  const categoryPpts = data.presentations.filter((p) => p.categorySlug === categorySlug);
  const categoryMaterials = data.studyMaterials.filter((m) => m.categorySlug === categorySlug);
  const relatedArticles = data.articles.slice(0, 2);
  const relatedQuizzes = data.quizzes.slice(0, 2);
  const activePpt = data.presentations.find((p) => p.id === activePptId) || categoryPpts[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-4 border-b border-[#C49A45]/25 pb-6">
        <button
          type="button"
          onClick={() => navigate('/classes')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#762B35] dark:text-[#E6A946] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ta' ? 'அனைத்து வேதாந்தப் பிரிவுகளும்' : 'All 7 Vedanta Categories'}</span>
        </button>

        <h1 className="font-display text-3xl sm:text-5xl font-bold">
          {category ? (lang === 'ta' ? category.titleTa : category.titleEn) : categorySlug}
        </h1>
        {category && (
          <p className="text-base text-[#725648] dark:text-[#CBBBA4] max-w-3xl leading-relaxed">
            {lang === 'ta' ? category.descriptionTa : category.descriptionEn}
          </p>
        )}

        {/* Quick Category Switcher */}
        <div className="flex flex-wrap gap-2 pt-2">
          {data.categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setActiveVideoLesson(null);
                navigate(`/classes/${cat.slug}`);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                cat.slug === categorySlug
                  ? 'bg-[#762B35] text-white'
                  : 'bg-[#EFE4CC] dark:bg-[#231B18] hover:bg-[#E3D3B3]'
              }`}
            >
              {lang === 'ta' ? cat.titleTa.split('—')[0].trim() : cat.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* Active Video Player if selected */}
      {activeVideoLesson && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {lang === 'ta' ? 'காணொளி வகுப்புத் திரை' : 'Video Class Player'}
            </h2>
            <button
              type="button"
              onClick={() => setActiveVideoLesson(null)}
              className="text-xs font-medium text-[#762B35] dark:text-[#E6A946] hover:underline"
            >
              Close Video
            </button>
          </div>
          <VideoLessonPlayer lesson={activeVideoLesson} />
        </div>
      )}

      {/* Class Listings */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          {lang === 'ta' ? 'வகுப்புகள் மற்றும் பாடக் குறிப்புகள்' : 'Chapters & Individual Classes'}
        </h2>
        {categoryClasses.length === 0 ? (
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 text-sm text-[#725648] dark:text-[#CBBBA4]">
            No lessons published in this category yet. Administrators can add new lessons via the Admin CMS.
          </div>
        ) : (
          <div className="space-y-5">
            {categoryClasses.map((cls) => (
              <div
                key={cls.id}
                className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                      {lang === 'ta' ? cls.chapterTitleTa : cls.chapterTitleEn} ·{' '}
                      <span className="font-mono-num">{cls.durationMinutes} min</span>
                    </p>
                    <h3 className="text-2xl font-bold">
                      {lang === 'ta' ? cls.titleTa : cls.titleEn}
                    </h3>
                    <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                      {lang === 'ta' ? cls.descriptionTa : cls.descriptionEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark('class', cls.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/35 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked('class', cls.id) ? 'fill-[#762B35] text-[#762B35]' : ''
                      }`}
                    />
                    <span>{isBookmarked('class', cls.id) ? 'Saved' : 'Save Class'}</span>
                  </button>
                </div>

                {/* Class Notes */}
                <div className="p-4 rounded-lg bg-[#EFE4CC]/60 dark:bg-[#231B18] border border-[#C49A45]/20 text-sm whitespace-pre-line leading-relaxed">
                  <p className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] mb-1.5">
                    {lang === 'ta' ? 'வகுப்புக் குறிப்புகள் (Class Notes)' : 'Class Notes'}
                  </p>
                  {lang === 'ta' ? cls.notesTa : cls.notesEn}
                </div>

                {/* Multi-format Action Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      playTrack({
                        id: cls.id,
                        itemType: 'class',
                        titleTa: cls.titleTa,
                        titleEn: cls.titleEn,
                        subtitle: cls.chapterTitleEn,
                        audioUrl: cls.audioUrl || `/api/media/audio/${cls.slug}`,
                        allowDownload: cls.allowDownload,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'ஒலி வகுப்பு' : 'Audio Lesson'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVideoLesson(cls)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/45 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                  >
                    <Video className="w-3.5 h-3.5 text-[#762B35] dark:text-[#E6A946]" />
                    <span>{lang === 'ta' ? 'காணொளி வகுப்பு' : 'Watch Video'}</span>
                  </button>

                  {cls.pptUrl && (
                    <button
                      type="button"
                      onClick={() => navigate('/ppt-library')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/45 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                    >
                      <PresentationIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'ta' ? 'PPT காட்சி' : 'PPT Slides'}</span>
                    </button>
                  )}

                  {cls.allowDownload && (
                    <a
                      href={cls.pdfUrl || `/api/media/pdf/notes-${cls.slug}`}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/45 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'ta' ? 'PDF குறிப்பு' : 'PDF Notes'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Category PPT Presentation Preview if available */}
      {activePpt && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">
              {lang === 'ta' ? 'தொடர்புடைய PPT விளக்கக் காட்சி' : 'Related Presentation Deck'}
            </h2>
            {categoryPpts.length > 1 && (
              <div className="flex gap-2">
                {categoryPpts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePptId(p.id)}
                    className={`px-3 py-1 text-xs rounded ${
                      p.id === activePpt.id ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
                    }`}
                  >
                    {p.topic}
                  </button>
                ))}
              </div>
            )}
          </div>
          <PresentationViewer presentation={activePpt} />
        </section>
      )}

      {/* Study Materials, Related Articles & Quizzes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
            <span>{lang === 'ta' ? 'PDF படிப்புப் பொருட்கள்' : 'PDF Study Materials'}</span>
          </h3>
          {(categoryMaterials.length > 0 ? categoryMaterials : data.studyMaterials.slice(0, 2)).map((m) => (
            <div key={m.id} className="pt-2 border-t border-[#C49A45]/15 flex items-center justify-between gap-2 text-sm">
              <span>{lang === 'ta' ? m.titleTa : m.titleEn}</span>
              {m.allowDownload && m.fileUrl && (
                <a href={m.fileUrl} download className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] shrink-0">
                  PDF
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
            <span>{lang === 'ta' ? 'தொடர்புடைய கட்டுரைகள்' : 'Related Articles'}</span>
          </h3>
          {relatedArticles.map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => navigate('/articles')}
              className="w-full text-left pt-2 border-t border-[#C49A45]/15 text-sm hover:text-[#762B35] dark:hover:text-[#E6A946]"
            >
              {lang === 'ta' ? art.titleTa : art.titleEn}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
            <span>{lang === 'ta' ? 'தொடர்புடைய வினாடி-வினா' : 'Related Quizzes'}</span>
          </h3>
          {relatedQuizzes.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => navigate('/quiz-centre')}
              className="w-full text-left pt-2 border-t border-[#C49A45]/15 text-sm hover:text-[#762B35] dark:hover:text-[#E6A946]"
            >
              {lang === 'ta' ? q.titleTa : q.titleEn}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
