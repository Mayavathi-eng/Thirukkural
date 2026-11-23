import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('learner'), // 'learner' | 'editor' | 'admin'
  preferredLang: text('preferred_lang').notNull().default('ta'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const kuralChapters = pgTable('kural_chapters', {
  id: serial('id').primaryKey(),
  chapterNumber: integer('chapter_number').notNull().unique(),
  divisionEn: text('division_en').notNull(), // Arathuppaal | Porutpaal | Kaamathuppaal
  divisionTa: text('division_ta').notNull(), // அறத்துப்பால் | பொருட்பால் | காமத்துப்பால்
  sectionEn: text('section_en').notNull(),
  sectionTa: text('section_ta').notNull(),
  nameEn: text('name_en').notNull(),
  nameTa: text('name_ta').notNull(),
  startKural: integer('start_kural').notNull(),
  endKural: integer('end_kural').notNull(),
});

export const kurals = pgTable('kurals', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull().unique(),
  chapterNumber: integer('chapter_number').notNull(),
  divisionEn: text('division_en').notNull(),
  divisionTa: text('division_ta').notNull(),
  chapterNameEn: text('chapter_name_en').notNull(),
  chapterNameTa: text('chapter_name_ta').notNull(),
  line1Ta: text('line1_ta').notNull(),
  line2Ta: text('line2_ta').notNull(),
  transliteration: text('transliteration').notNull(),
  wordByWordTa: text('word_by_word_ta').notNull(),
  simpleExplanationTa: text('simple_explanation_ta').notNull(),
  commentaryTa: text('commentary_ta').notNull(),
  translationEn: text('translation_en').notNull(),
  explanationEn: text('explanation_en').notNull(),
  audioUrl: text('audio_url'),
  studyPdfUrl: text('study_pdf_url'),
  featured: boolean('featured').notNull().default(false),
});

export const vedantaCategories = pgTable('vedanta_categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionTa: text('description_ta').notNull(),
  sortOrder: integer('sort_order').notNull().default(1),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  categorySlug: text('category_slug').notNull(),
  chapterTitleEn: text('chapter_title_en').notNull(),
  chapterTitleTa: text('chapter_title_ta').notNull(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionTa: text('description_ta').notNull(),
  notesTa: text('notes_ta').notNull(),
  notesEn: text('notes_en').notNull(),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  pptUrl: text('ppt_url'),
  pdfUrl: text('pdf_url'),
  durationMinutes: integer('duration_minutes').notNull().default(25),
  allowDownload: boolean('allow_download').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const presentations = pgTable('presentations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  topic: text('topic').notNull(),
  categorySlug: text('category_slug').notNull(),
  slidesJson: jsonb('slides_json').notNull(),
  pptFileUrl: text('ppt_file_url'),
  pdfFileUrl: text('pdf_file_url'),
  allowDownload: boolean('allow_download').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studyMaterials = pgTable('study_materials', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  materialType: text('material_type').notNull(), // 'PDF Document' | 'Class Notes' | 'Reference Book'
  language: text('language').notNull(), // 'Tamil' | 'English' | 'Bilingual'
  categorySlug: text('category_slug').notNull(),
  summaryEn: text('summary_en').notNull(),
  summaryTa: text('summary_ta').notNull(),
  fileUrl: text('file_url'),
  allowDownload: boolean('allow_download').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  excerptTa: text('excerpt_ta').notNull(),
  bodyEn: text('body_en').notNull(),
  bodyTa: text('body_ta').notNull(),
  category: text('category').notNull(),
  author: text('author').notNull(),
  readMinutes: integer('read_minutes').notNull().default(5),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull().default('Beginner'), // Beginner | Intermediate | Advanced
  isDaily: boolean('is_daily').notNull().default(false),
  descriptionEn: text('description_en').notNull(),
  descriptionTa: text('description_ta').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  questionType: text('question_type').notNull().default('mcq'), // mcq | true_false | fill_blank | match
  promptEn: text('prompt_en').notNull(),
  promptTa: text('prompt_ta').notNull(),
  optionsJson: jsonb('options_json').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  explanationEn: text('explanation_en').notNull(),
  explanationTa: text('explanation_ta').notNull(),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  mode: text('mode').notNull().default('practice'),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // kural_completion | match_meaning | vedanta_match | fill_blank | memory | reflection
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  promptEn: text('prompt_en').notNull(),
  promptTa: text('prompt_ta').notNull(),
  dataJson: jsonb('data_json').notNull(),
  sortOrder: integer('sort_order').notNull().default(1),
});

export const meditations = pgTable('meditations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleEn: text('title_en').notNull(),
  titleTa: text('title_ta').notNull(),
  category: text('category').notNull(), // Guided Audio | Breathing Exercise | Relaxation | Beginner Lesson | Video Session
  durationMinutes: integer('duration_minutes').notNull().default(10),
  instructionsTa: text('instructions_ta').notNull(),
  instructionsEn: text('instructions_en').notNull(),
  breathingPattern: text('breathing_pattern').notNull().default('4-4-6'),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  featured: boolean('featured').notNull().default(false),
});

export const userBookmarks = pgTable(
  'user_bookmarks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    itemType: text('item_type').notNull(), // kural | class | article
    itemId: integer('item_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_bookmarks_unique_idx').on(table.userId, table.itemType, table.itemId),
  ]
);

export const userProgress = pgTable(
  'user_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    itemType: text('item_type').notNull(), // audio | video | kural | class | meditation
    itemId: integer('item_id').notNull(),
    progressPercent: integer('progress_percent').notNull().default(0),
    lastPositionSeconds: integer('last_position_seconds').notNull().default(0),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    uniqueIndex('user_progress_unique_idx').on(table.userId, table.itemType, table.itemId),
  ]
);

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  valueJson: jsonb('value_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(), // view | play | download | quiz_complete
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(userBookmarks),
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
}));
