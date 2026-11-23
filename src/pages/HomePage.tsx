import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  Headphones,
  HelpCircle,
  Play,
  Presentation as PresentationIcon,
  Sparkles,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SpeakTamilButton } from '../components/MediaPlayers.tsx';

export function HomePage() {
  const { data, lang, navigate, playTrack } = useApp();

  if (!data) return null;

  const banner = data.settings.homepage_banner || {
    headingTa: 'திருக்குறள் & வேதாந்த ஞானம்',
    subheadingEn: 'Discover the Wisdom of Thiruvalluvar and the Timeless Teachings of Vedanta.',
    tamilTagline: 'அறிவைப் பகிர்வோம் – ஞானத்தை வளர்ப்போம்.',
    freeLabelEn: '100% FREE LEARNING – KNOWLEDGE FOR EVERYONE.',
    freeLabelTa: 'கல்வி இலவசம் – ஞானம் அனைவருக்கும்.',
  };

  const dailyKural = data.dailyKural || data.kurals[0];
  const dailyClass = data.dailyVedantaClass || data.classes[0];
  const featuredClasses = data.classes.filter((c) => c.featured).slice(0, 3);
  const latestAudio = data.classes.slice(0, 3);
  const latestVideos = data.classes.slice(0, 3);
  const featuredPpts = data.presentations.slice(0, 3);
  const featuredMaterials = data.studyMaterials.slice(0, 3);
  const dailyQuiz = data.quizzes.find((q) => q.isDaily) || data.quizzes[0];
  const featuredArticles = data.articles.slice(0, 3);
  const featuredMeditation = data.meditations[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative border-b border-[#C49A45]/25 kolam-pattern-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-widest uppercase text-[#762B35] dark:text-[#E6A946]">
                  {lang === 'ta' ? banner.freeLabelTa : banner.freeLabelEn}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#493126] dark:text-[#F4EBD7]">
                  {banner.headingTa}
                </h1>
                <p className="text-lg sm:text-xl text-[#725648] dark:text-[#CBBBA4] max-w-2xl leading-relaxed">
                  {banner.subheadingEn}
                </p>
                <p className="font-tamil-serif text-base sm:text-lg font-medium text-[#762B35] dark:text-[#D4AA56]">
                  “{banner.tamilTagline}”
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/thirukkural')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-[#762B35] text-[#FCF8EE] hover:bg-[#5E2129] transition-colors whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === 'ta' ? 'திருக்குறள் நூலகம்' : 'Explore Thirukkural'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/classes')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg border border-[#762B35] text-[#762B35] dark:text-[#E6A946] dark:border-[#E6A946] hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{lang === 'ta' ? 'வேதாந்தம் கற்க' : 'Learn Vedanta'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/audio-library')}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border border-[#C49A45]/45 hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
                >
                  <Headphones className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
                  <span>{lang === 'ta' ? 'வகுப்புகளைக் கேளுங்கள்' : 'Listen to Classes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/quiz-centre')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-[#762B35] dark:text-[#E6A946] hover:underline whitespace-nowrap shrink-0"
                >
                  <span>{lang === 'ta' ? 'இலவசக் கற்றலைத் தொடங்குக' : 'Start Free Learning'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-[#C49A45]/35 bg-[#EFE4CC] dark:bg-[#2A201C] h-full min-h-[280px]">
                <img
                  src="/src/assets/images/hero_temple_library_1795408079888.jpg"
                  alt="Traditional Tamil temple library with palm-leaf manuscripts and brass lamp"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412]/85 via-[#1A1412]/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 text-[#FCF8EE] space-y-1">
                  <p className="text-xs tracking-wider uppercase text-[#E6A946]">
                    கேள் • கல் • சிந்தி • உணர் • வாழ்
                  </p>
                  <p className="text-sm font-medium">
                    133 Thirukkural Chapters · 7 Vedanta Discourses · Free Open Access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Quick Heritage Strip */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => navigate('/thirukkural')}
              className="text-left p-5 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35] transition-colors"
            >
              <p className="font-mono-num text-2xl font-bold text-[#762B35] dark:text-[#E6A946]">1,330</p>
              <p className="text-sm font-semibold mt-1">{lang === 'ta' ? 'திருக்குறள் குறட்பாக்கள்' : 'Thirukkural Couplets'}</p>
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4] mt-0.5">133 Chapters · 3 Divisions</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/classes')}
              className="text-left p-5 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35] transition-colors"
            >
              <p className="font-mono-num text-2xl font-bold text-[#762B35] dark:text-[#E6A946]">7</p>
              <p className="text-sm font-semibold mt-1">{lang === 'ta' ? 'வேதாந்த வகுப்புப் பிரிவுகள்' : 'Vedanta Disciplines'}</p>
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4] mt-0.5">Gita · Upanishads · Brahma Sutram</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/study-materials')}
              className="text-left p-5 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35] transition-colors"
            >
              <p className="font-mono-num text-2xl font-bold text-[#762B35] dark:text-[#E6A946]">4</p>
              <p className="text-sm font-semibold mt-1">{lang === 'ta' ? 'ஊடக கற்றல் வடிவங்கள்' : 'Multimedia Formats'}</p>
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4] mt-0.5">Audio · Video · PPT · PDF</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/quiz-centre')}
              className="text-left p-5 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35] transition-colors"
            >
              <p className="font-mono-num text-2xl font-bold text-[#762B35] dark:text-[#E6A946]">100%</p>
              <p className="text-sm font-semibold mt-1">{lang === 'ta' ? 'முற்றிலும் இலவசம்' : 'Free Forever Access'}</p>
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4] mt-0.5">Quizzes · Activities · Meditation</p>
            </button>
          </div>
        </div>
      </section>

      {/* Daily Thirukkural & Daily Vedantic Wisdom */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dailyKural && (
            <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#725648] dark:text-[#CBBBA4]">
                  <span className="font-semibold text-[#762B35] dark:text-[#E6A946]">
                    {lang === 'ta' ? 'இன்றைய திருக்குறள்' : 'Daily Thirukkural'}
                  </span>
                  <span className="font-mono-num">
                    Kural {dailyKural.number} · {lang === 'ta' ? dailyKural.chapterNameTa : dailyKural.chapterNameEn}
                  </span>
                </div>

                <div className="py-4 border-y border-[#C49A45]/20 space-y-1.5">
                  <p className="font-tamil-serif text-xl sm:text-2xl font-semibold leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
                    {dailyKural.line1Ta}
                  </p>
                  <p className="font-tamil-serif text-xl sm:text-2xl font-semibold leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
                    {dailyKural.line2Ta}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-[#725648] dark:text-[#CBBBA4]">
                  {lang === 'ta' ? dailyKural.simpleExplanationTa : dailyKural.translationEn}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SpeakTamilButton text={`${dailyKural.line1Ta} ${dailyKural.line2Ta}`} />
                  <button
                    type="button"
                    onClick={() =>
                      playTrack({
                        id: dailyKural.number,
                        itemType: 'kural',
                        titleTa: `திருக்குறள் ${dailyKural.number}`,
                        titleEn: `Thirukkural #${dailyKural.number}`,
                        subtitle: dailyKural.chapterNameEn,
                        audioUrl: dailyKural.audioUrl || `/api/media/audio/kural-${dailyKural.number}`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'ஒலி' : 'Audio'}</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/kural/${dailyKural.number}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline"
                >
                  <span>{lang === 'ta' ? 'முழு விளக்கம்' : 'Read Full Commentary'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {dailyClass && (
            <div className="rounded-xl border border-[#C49A45]/35 bg-[#EFE4CC]/65 dark:bg-[#231B18] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#725648] dark:text-[#CBBBA4]">
                  <span className="font-semibold text-[#762B35] dark:text-[#E6A946]">
                    {lang === 'ta' ? 'இன்றைய வேதாந்த ஞானம்' : 'Daily Vedantic Wisdom'}
                  </span>
                  <span className="font-mono-num">{dailyClass.durationMinutes} min</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                  {lang === 'ta' ? dailyClass.titleTa : dailyClass.titleEn}
                </h2>

                <p className="text-sm leading-relaxed text-[#725648] dark:text-[#CBBBA4]">
                  {lang === 'ta' ? dailyClass.descriptionTa : dailyClass.descriptionEn}
                </p>

                <div className="p-4 rounded-lg bg-[#FCF8EE] dark:bg-[#2A201C] border border-[#C49A45]/25 text-xs leading-relaxed whitespace-pre-line">
                  {lang === 'ta' ? dailyClass.notesTa : dailyClass.notesEn}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    playTrack({
                      id: dailyClass.id,
                      itemType: 'class',
                      titleTa: dailyClass.titleTa,
                      titleEn: dailyClass.titleEn,
                      subtitle: lang === 'ta' ? dailyClass.chapterTitleTa : dailyClass.chapterTitleEn,
                      audioUrl: dailyClass.audioUrl || `/api/media/audio/${dailyClass.slug}`,
                      allowDownload: dailyClass.allowDownload,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'வகுப்பைக் கேளுங்கள்' : 'Listen to Discourse'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/classes/${dailyClass.categorySlug}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline"
                >
                  <span>{lang === 'ta' ? 'வகுப்புப் பிரிவிற்குச் செல்க' : 'Open Class Category'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Swamiji Classes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#C49A45]/25 pb-4">
          <div>
            <h2 className="font-display text-3xl font-bold">
              {lang === 'ta' ? 'சுவாமிஜியின் சிறப்பு வேதாந்த வகுப்புகள்' : "Featured Swamiji's Vedanta Classes"}
            </h2>
            <p className="text-sm text-[#725648] dark:text-[#CBBBA4] mt-1">
              {lang === 'ta'
                ? 'அறிமுகம் முதல் பிரம்ம சூத்திரம் வரை ஏழு முக்கிய பிரிவுகளில் இலவசப் பாடங்கள்.'
                : 'Structured discourses across seven foundational disciplines of Indian philosophy.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline inline-flex items-center gap-1"
          >
            <span>{lang === 'ta' ? 'அனைத்து 7 பிரிவுகளும்' : 'All 7 Categories'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredClasses.map((cls) => (
            <div
              key={cls.id}
              className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                  {lang === 'ta' ? cls.chapterTitleTa : cls.chapterTitleEn} · <span className="font-mono-num">{cls.durationMinutes} min</span>
                </p>
                <h3 className="text-xl font-semibold leading-snug">
                  {lang === 'ta' ? cls.titleTa : cls.titleEn}
                </h3>
                <p className="text-sm text-[#725648] dark:text-[#CBBBA4] line-clamp-3">
                  {lang === 'ta' ? cls.descriptionTa : cls.descriptionEn}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-[#C49A45]/20">
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'கேட்க' : 'Listen'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/classes/${cls.categorySlug}`)}
                  className="text-xs font-medium text-[#725648] dark:text-[#CBBBA4] hover:text-[#762B35]"
                >
                  {lang === 'ta' ? 'பாடத்தைத் திற' : 'Open Lesson →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Multimedia Hub Highlights: Audio, Video, PPT, Study Materials */}
      <section className="bg-[#EFE4CC]/60 dark:bg-[#231B18] border-y border-[#C49A45]/25 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Audio Lectures */}
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
                <span>{lang === 'ta' ? 'ஒலி சொற்பொழிவுகள்' : 'Latest Audio Lectures'}</span>
              </h3>
            </div>
            <ul className="space-y-3 text-sm">
              {latestAudio.map((a) => (
                <li key={a.id} className="pb-2.5 border-b border-[#C49A45]/15 last:border-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() =>
                      playTrack({
                        id: a.id,
                        itemType: 'audio',
                        titleTa: a.titleTa,
                        titleEn: a.titleEn,
                        subtitle: a.chapterTitleEn,
                        audioUrl: a.audioUrl || `/api/media/audio/${a.slug}`,
                      })
                    }
                    className="text-left hover:text-[#762B35] dark:hover:text-[#E6A946] font-medium line-clamp-2"
                  >
                    {lang === 'ta' ? a.titleTa : a.titleEn}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => navigate('/audio-library')} className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline">
              {lang === 'ta' ? 'ஒலி நூலகம் →' : 'Open Audio Library →'}
            </button>
          </div>

          {/* Video Classes */}
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
              <span>{lang === 'ta' ? 'காணொளி வகுப்புகள்' : 'Latest Video Classes'}</span>
            </h3>
            <ul className="space-y-3 text-sm">
              {latestVideos.map((v) => (
                <li key={v.id} className="pb-2.5 border-b border-[#C49A45]/15 last:border-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => navigate('/video-library')}
                    className="text-left hover:text-[#762B35] dark:hover:text-[#E6A946] font-medium line-clamp-2"
                  >
                    {lang === 'ta' ? v.titleTa : v.titleEn}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => navigate('/video-library')} className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline">
              {lang === 'ta' ? 'காணொளி நூலகம் →' : 'Open Video Library →'}
            </button>
          </div>

          {/* Featured PPTs */}
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PresentationIcon className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
              <span>{lang === 'ta' ? 'PPT விளக்கக் காட்சிகள்' : 'Featured PPT Decks'}</span>
            </h3>
            <ul className="space-y-3 text-sm">
              {featuredPpts.map((p) => (
                <li key={p.id} className="pb-2.5 border-b border-[#C49A45]/15 last:border-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => navigate('/ppt-library')}
                    className="text-left hover:text-[#762B35] dark:hover:text-[#E6A946] font-medium line-clamp-2"
                  >
                    {lang === 'ta' ? p.titleTa : p.titleEn}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => navigate('/ppt-library')} className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline">
              {lang === 'ta' ? 'PPT நூலகம் →' : 'Open PPT Library →'}
            </button>
          </div>

          {/* Free Study Materials */}
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
              <span>{lang === 'ta' ? 'இலவசப் படிப்புக் குறிப்புகள்' : 'Free Study Materials'}</span>
            </h3>
            <ul className="space-y-3 text-sm">
              {featuredMaterials.map((m) => (
                <li key={m.id} className="pb-2.5 border-b border-[#C49A45]/15 last:border-0 last:pb-0 flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/study-materials')}
                    className="text-left hover:text-[#762B35] dark:hover:text-[#E6A946] font-medium line-clamp-2"
                  >
                    {lang === 'ta' ? m.titleTa : m.titleEn}
                  </button>
                  {m.allowDownload && m.fileUrl && (
                    <a href={m.fileUrl} download aria-label={`Download ${m.titleEn}`} className="p-1 text-[#762B35] dark:text-[#E6A946] shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => navigate('/study-materials')} className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline">
              {lang === 'ta' ? 'படிப்புப் பொருட்கள் →' : 'All Study Materials →'}
            </button>
          </div>
        </div>
      </section>

      {/* Today's Quiz, Spiritual Articles & Guided Meditation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Today's Quiz & Activities */}
        <div className="lg:col-span-4 rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#762B35] dark:text-[#E6A946]">
              <HelpCircle className="w-4 h-4" />
              <span>{lang === 'ta' ? 'இன்றைய வினாடி-வினா' : "Today's Quiz"}</span>
            </div>
            {dailyQuiz && (
              <>
                <h3 className="text-2xl font-bold leading-snug">
                  {lang === 'ta' ? dailyQuiz.titleTa : dailyQuiz.titleEn}
                </h3>
                <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
                  {lang === 'ta' ? dailyQuiz.descriptionTa : dailyQuiz.descriptionEn}
                </p>
                <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                  {dailyQuiz.category} · {dailyQuiz.difficulty}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/quiz-centre')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
            >
              {lang === 'ta' ? 'வினாடி-வினா தொடங்கு' : 'Take Daily Quiz'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
            >
              {lang === 'ta' ? 'செயல்பாடுகள்' : 'Learning Activities'}
            </button>
          </div>
        </div>

        {/* Spiritual Articles */}
        <div className="lg:col-span-4 rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#762B35] dark:text-[#E6A946]">
                {lang === 'ta' ? 'ஆன்மீகக் கட்டுரைகள்' : 'Spiritual Articles'}
              </span>
              <button type="button" onClick={() => navigate('/articles')} className="hover:underline text-[#725648] dark:text-[#CBBBA4]">
                {lang === 'ta' ? 'அனைத்தும்' : 'View All'}
              </button>
            </div>
            <div className="space-y-3">
              {featuredArticles.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => navigate('/articles')}
                  className="w-full text-left pb-3 border-b border-[#C49A45]/20 last:border-0 last:pb-0 group"
                >
                  <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                    {art.category} · <span className="font-mono-num">{art.readMinutes} min read</span>
                  </p>
                  <p className="text-sm font-semibold mt-0.5 group-hover:text-[#762B35] dark:group-hover:text-[#E6A946]">
                    {lang === 'ta' ? art.titleTa : art.titleEn}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline text-left"
          >
            {lang === 'ta' ? 'கட்டுரைகளைப் படிக்க →' : 'Read All Articles →'}
          </button>
        </div>

        {/* Guided Meditation */}
        <div className="lg:col-span-4 rounded-xl border border-[#C49A45]/35 overflow-hidden bg-[#231B18] text-[#FCF8EE] relative flex flex-col justify-end min-h-[260px]">
          <img
            src="/src/assets/images/meditation_sanctuary_1795408079754.jpg"
            alt="Serene South Indian meditation hall with kolam and lotus bowl"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412] via-[#1A1412]/55 to-transparent" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E6A946]">
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ta' ? 'வழிகாட்டப்பட்ட தியானம்' : 'Guided Meditation'}</span>
            </div>
            <h3 className="text-xl font-bold">
              {featuredMeditation
                ? lang === 'ta'
                  ? featuredMeditation.titleTa
                  : featuredMeditation.titleEn
                : 'Guided Breath & Silent Awareness'}
            </h3>
            <p className="text-xs text-[#E5D7BF]">
              {featuredMeditation?.durationMinutes || 10} min · Breathing Pacer · Peaceful Audio
            </p>
            <button
              type="button"
              onClick={() => navigate('/meditation')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#D99B38] text-[#1A1412] hover:bg-[#E6A946]"
            >
              <span>{lang === 'ta' ? 'தியான அமர்வைத் தொடங்கு' : 'Begin Meditation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
