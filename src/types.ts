export type Language = 'ta' | 'en';
export type ThemeMode = 'light' | 'dark';

export interface KuralChapter {
  id: number;
  chapterNumber: number;
  divisionEn: 'Arathuppaal' | 'Porutpaal' | 'Kaamathuppaal';
  divisionTa: string;
  sectionEn: string;
  sectionTa: string;
  nameEn: string;
  nameTa: string;
  startKural: number;
  endKural: number;
}

export interface Kural {
  id: number;
  number: number;
  chapterNumber: number;
  divisionEn: string;
  divisionTa: string;
  chapterNameEn: string;
  chapterNameTa: string;
  line1Ta: string;
  line2Ta: string;
  transliteration: string;
  wordByWordTa: string;
  simpleExplanationTa: string;
  commentaryTa: string;
  translationEn: string;
  explanationEn: string;
  audioUrl: string | null;
  studyPdfUrl: string | null;
  featured: boolean;
}

export interface VedantaCategory {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  sortOrder: number;
}

export interface VedantaClass {
  id: number;
  slug: string;
  categorySlug: string;
  chapterTitleEn: string;
  chapterTitleTa: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  notesTa: string;
  notesEn: string;
  audioUrl: string | null;
  videoUrl: string | null;
  pptUrl: string | null;
  pdfUrl: string | null;
  durationMinutes: number;
  allowDownload: boolean;
  featured: boolean;
}

export interface PresentationSlide {
  titleTa: string;
  titleEn: string;
  bulletsTa: string[];
  bulletsEn: string[];
  quote?: string;
}

export interface Presentation {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  topic: string;
  categorySlug: string;
  slidesJson: PresentationSlide[];
  pptFileUrl: string | null;
  pdfFileUrl: string | null;
  allowDownload: boolean;
  featured: boolean;
}

export interface StudyMaterial {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  materialType: string;
  language: string;
  categorySlug: string;
  summaryEn: string;
  summaryTa: string;
  fileUrl: string | null;
  allowDownload: boolean;
  featured: boolean;
}

export interface Article {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  excerptEn: string;
  excerptTa: string;
  bodyEn: string;
  bodyTa: string;
  category: string;
  author: string;
  readMinutes: number;
  featured: boolean;
}

export interface Quiz {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  category: string;
  difficulty: string;
  isDaily: boolean;
  descriptionEn: string;
  descriptionTa: string;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionType: string;
  promptEn: string;
  promptTa: string;
  optionsJson: string[];
  correctAnswer: string;
  explanationEn: string;
  explanationTa: string;
}

export interface LearningActivity {
  id: number;
  type: string;
  titleEn: string;
  titleTa: string;
  promptEn: string;
  promptTa: string;
  dataJson: any;
  sortOrder: number;
}

export interface Meditation {
  id: number;
  slug: string;
  titleEn: string;
  titleTa: string;
  category: string;
  durationMinutes: number;
  instructionsTa: string;
  instructionsEn: string;
  breathingPattern: string;
  audioUrl: string | null;
  videoUrl: string | null;
  featured: boolean;
}

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'learner' | 'editor' | 'admin';
  preferredLang: string;
}

export interface AudioTrack {
  id: number;
  itemType: 'audio' | 'kural' | 'meditation' | 'class';
  titleTa: string;
  titleEn: string;
  subtitle: string;
  audioUrl: string;
  allowDownload?: boolean;
}

export interface BootstrapData {
  dailyKural: Kural | null;
  dailyQuotePool: Kural[];
  dailyVedantaClass: VedantaClass | null;
  chapters: KuralChapter[];
  kurals: Kural[];
  categories: VedantaCategory[];
  classes: VedantaClass[];
  presentations: Presentation[];
  studyMaterials: StudyMaterial[];
  articles: Article[];
  quizzes: Quiz[];
  activities: LearningActivity[];
  meditations: Meditation[];
  settings: {
    homepage_banner?: {
      headingTa: string;
      subheadingEn: string;
      tamilTagline: string;
      freeLabelEn: string;
      freeLabelTa: string;
    };
  };
}
