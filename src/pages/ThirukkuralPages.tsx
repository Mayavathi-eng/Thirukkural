import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Download,
  Play,
  Search,
  Share2,
  Shuffle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SpeakTamilButton } from '../components/MediaPlayers.tsx';
import type { Kural, KuralChapter } from '../types.ts';

export function ThirukkuralLibraryPage({
  divisionFilter,
}: {
  divisionFilter?: 'Arathuppaal' | 'Porutpaal' | 'Kaamathuppaal';
}) {
  const { data, lang, navigate, isBookmarked, toggleBookmark, playTrack } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  useEffect(() => {
    setSelectedChapter(null);
  }, [divisionFilter]);

  const chapters = useMemo(() => {
    if (!data) return [];
    return divisionFilter
      ? data.chapters.filter((c) => c.divisionEn === divisionFilter)
      : data.chapters;
  }, [data, divisionFilter]);

  const filteredKurals = useMemo(() => {
    if (!data) return [];
    let list = data.kurals;
    if (divisionFilter) {
      list = list.filter((k) => k.divisionEn === divisionFilter);
    }
    if (selectedChapter) {
      list = list.filter((k) => k.chapterNumber === selectedChapter);
    }
    if (showFavouritesOnly) {
      list = list.filter((k) => isBookmarked('kural', k.number));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const asNum = Number(q);
      if (!Number.isNaN(asNum) && asNum >= 1 && asNum <= 1330) {
        list = list.filter((k) => k.number === asNum);
      } else {
        list = list.filter(
          (k) =>
            k.line1Ta.toLowerCase().includes(q) ||
            k.line2Ta.toLowerCase().includes(q) ||
            k.simpleExplanationTa.toLowerCase().includes(q) ||
            k.translationEn.toLowerCase().includes(q) ||
            k.explanationEn.toLowerCase().includes(q) ||
            k.chapterNameEn.toLowerCase().includes(q) ||
            k.chapterNameTa.toLowerCase().includes(q)
        );
      }
    }
    return list;
  }, [data, divisionFilter, selectedChapter, showFavouritesOnly, searchQuery, isBookmarked]);

  if (!data) return null;

  const openRandomKural = () => {
    if (data.kurals.length === 0) return;
    const pick = data.kurals[Math.floor(Math.random() * data.kurals.length)];
    navigate(`/kural/${pick.number}`);
  };

  const handleNumberJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(searchQuery.trim());
    if (!Number.isNaN(num) && num >= 1 && num <= 1330) {
      navigate(`/kural/${num}`);
    }
  };

  const divisionTitle = divisionFilter
    ? divisionFilter === 'Arathuppaal'
      ? lang === 'ta'
        ? 'அறத்துப்பால் — 38 அதிகாரங்கள் (380 குறள்கள்)'
        : 'Arathuppaal · Virtue (Chapters 1–38 · 380 Kurals)'
      : divisionFilter === 'Porutpaal'
        ? lang === 'ta'
          ? 'பொருட்பால் — 70 அதிகாரங்கள் (700 குறள்கள்)'
          : 'Porutpaal · Polity & Wealth (Chapters 39–108 · 700 Kurals)'
        : lang === 'ta'
          ? 'காமத்துப்பால் — 25 அதிகாரங்கள் (250 குறள்கள்)'
          : 'Kaamathuppaal · Love (Chapters 109–133 · 250 Kurals)'
    : lang === 'ta'
      ? 'திருக்குறள் எண்ம நூலகம் (133 அதிகாரங்கள் · 1,330 குறட்பாக்கள்)'
      : 'Thirukkural Digital Library (133 Chapters · 1,330 Kurals)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header & Division Tabs */}
      <div className="space-y-4 border-b border-[#C49A45]/25 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
              {lang === 'ta' ? 'உலகப் பொதுமறை · திருவள்ளுவர்' : 'Universal Ethics · Sage Thiruvalluvar'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{divisionTitle}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data.dailyKural && (
              <button
                type="button"
                onClick={() => navigate(`/kural/${data.dailyKural!.number}`)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
              >
                {lang === 'ta' ? `இன்றைய குறள் (#${data.dailyKural.number})` : `Daily Kural (#${data.dailyKural.number})`}
              </button>
            )}
            <button
              type="button"
              onClick={openRandomKural}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C]"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'சீரற்ற குறள்' : 'Random Kural'}</span>
            </button>
            <a
              href="/api/media/pdf/thirukkural-student-handbook"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'PDF கையேடு' : 'Study PDF'}</span>
            </a>
          </div>
        </div>

        {/* Division Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/thirukkural')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              !divisionFilter
                ? 'bg-[#762B35] text-white'
                : 'bg-[#EFE4CC] dark:bg-[#231B18] hover:bg-[#E3D3B3]'
            }`}
          >
            {lang === 'ta' ? 'அனைத்துப் பால்கள் (133)' : 'All Divisions (133 Chapters)'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/thirukkural/arathuppaal')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              divisionFilter === 'Arathuppaal'
                ? 'bg-[#762B35] text-white'
                : 'bg-[#EFE4CC] dark:bg-[#231B18] hover:bg-[#E3D3B3]'
            }`}
          >
            {lang === 'ta' ? 'அறத்துப்பால் (380)' : 'Arathuppaal (380)'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/thirukkural/porutpaal')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              divisionFilter === 'Porutpaal'
                ? 'bg-[#762B35] text-white'
                : 'bg-[#EFE4CC] dark:bg-[#231B18] hover:bg-[#E3D3B3]'
            }`}
          >
            {lang === 'ta' ? 'பொருட்பால் (700)' : 'Porutpaal (700)'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/thirukkural/kaamathuppaal')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              divisionFilter === 'Kaamathuppaal'
                ? 'bg-[#762B35] text-white'
                : 'bg-[#EFE4CC] dark:bg-[#231B18] hover:bg-[#E3D3B3]'
            }`}
          >
            {lang === 'ta' ? 'காமத்துப்பால் (250)' : 'Kaamathuppaal (250)'}
          </button>
        </div>
      </div>

      {/* Search & Favourite Bar */}
      <form onSubmit={handleNumberJump} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#725648]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ta'
                ? 'குறள் எண் (1-1330), தமிழ் சொல் அல்லது ஆங்கிலச் சொல் தேடுக...'
                : 'Search by Kural number (1-1330), Tamil word, or English keyword...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C] focus:outline-none focus:border-[#762B35]"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            showFavouritesOnly
              ? 'bg-[#762B35] text-white border-[#762B35]'
              : 'border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'விருப்பக் குறள்கள்' : 'Favourite Kurals'}</span>
        </button>
        {selectedChapter && (
          <button
            type="button"
            onClick={() => setSelectedChapter(null)}
            className="px-3 py-2.5 text-xs font-medium rounded-lg bg-[#EFE4CC] dark:bg-[#231B18]"
          >
            {lang === 'ta' ? 'அதிகார வடிகட்டியை நீக்கு' : 'Clear Chapter Filter'}
          </button>
        )}
      </form>

      {/* Main Split: 133-Chapter Directory & Authentic Couplets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">
              {lang === 'ta' ? 'அதிகாரங்கள் (Adhikarams)' : 'Chapters Directory'}
            </h2>
            <span className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4]">
              {chapters.length} chapters
            </span>
          </div>
          <div className="max-h-[540px] overflow-y-auto rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] divide-y divide-[#C49A45]/15">
            {chapters.map((ch: KuralChapter) => {
              const hasPopulated = data.kurals.some((k) => k.chapterNumber === ch.chapterNumber);
              return (
                <button
                  key={ch.chapterNumber}
                  type="button"
                  onClick={() => {
                    if (hasPopulated) {
                      setSelectedChapter(
                        selectedChapter === ch.chapterNumber ? null : ch.chapterNumber
                      );
                    } else {
                      navigate(`/kural/${ch.startKural}`);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 text-sm transition-colors ${
                    selectedChapter === ch.chapterNumber
                      ? 'bg-[#762B35] text-white'
                      : 'hover:bg-[#EFE4CC]/70 dark:hover:bg-[#352924]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      <span className="font-mono-num mr-2">{ch.chapterNumber}.</span>
                      {lang === 'ta' ? ch.nameTa : ch.nameEn}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        selectedChapter === ch.chapterNumber
                          ? 'text-white/80'
                          : 'text-[#725648] dark:text-[#CBBBA4]'
                      }`}
                    >
                      {lang === 'ta' ? ch.sectionTa : ch.sectionEn} · Kurals{' '}
                      <span className="font-mono-num">
                        {ch.startKural}–{ch.endKural}
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">
              {lang === 'ta' ? 'குறட்பாக்கள்' : 'Verified Couplets'}
            </h2>
            <span className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4]">
              {filteredKurals.length} {lang === 'ta' ? 'குறள்கள்' : 'entries shown'}
            </span>
          </div>

          {filteredKurals.length === 0 ? (
            <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-8 text-center space-y-3">
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
                {lang === 'ta'
                  ? 'தேடலுக்குப் பொருந்தும் குறள் கிடைக்கவில்லை. 1 முதல் 1330 வரை உள்ள குறள் எண்ணைத் தட்டச்சு செய்து பார்க்கலாம்.'
                  : 'No matching couplets in this filter. You can jump directly to any Kural number (1–1330).'}
              </p>
              {Number(searchQuery.trim()) >= 1 && Number(searchQuery.trim()) <= 1330 && (
                <button
                  type="button"
                  onClick={() => navigate(`/kural/${Number(searchQuery.trim())}`)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
                >
                  Open Kural #{Number(searchQuery.trim())}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKurals.map((k: Kural) => (
                <article
                  key={k.number}
                  className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#725648] dark:text-[#CBBBA4]">
                    <span>
                      <span className="font-mono-num font-semibold text-[#762B35] dark:text-[#E6A946]">
                        Kural {k.number}
                      </span>{' '}
                      · {lang === 'ta' ? k.divisionTa : k.divisionEn} ·{' '}
                      {lang === 'ta' ? k.chapterNameTa : k.chapterNameEn}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleBookmark('kural', k.number)}
                        aria-label={`Bookmark Kural ${k.number}`}
                        className="p-1.5 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked('kural', k.number)
                              ? 'fill-[#762B35] text-[#762B35] dark:fill-[#E6A946] dark:text-[#E6A946]'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-tamil-serif text-xl font-semibold leading-relaxed">
                      {k.line1Ta}
                    </p>
                    <p className="font-tamil-serif text-xl font-semibold leading-relaxed">
                      {k.line2Ta}
                    </p>
                  </div>

                  <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                    {lang === 'ta' ? k.simpleExplanationTa : k.translationEn}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#C49A45]/15">
                    <div className="flex items-center gap-2">
                      <SpeakTamilButton text={`${k.line1Ta} ${k.line2Ta}`} />
                      <button
                        type="button"
                        onClick={() =>
                          playTrack({
                            id: k.number,
                            itemType: 'kural',
                            titleTa: `திருக்குறள் ${k.number}`,
                            titleEn: `Thirukkural #${k.number}`,
                            subtitle: k.chapterNameEn,
                            audioUrl: k.audioUrl || `/api/media/audio/kural-${k.number}`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{lang === 'ta' ? 'ஒலி' : 'Listen'}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/kural/${k.number}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline"
                    >
                      <span>{lang === 'ta' ? 'பதவுரை & விளக்கம்' : 'Word-by-Word & Commentary'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IndividualKuralPage({ kuralNumber }: { kuralNumber: number }) {
  const { data, lang, navigate, isBookmarked, toggleBookmark, playTrack, showToast, recordProgress } = useApp();
  const [copied, setCopied] = useState(false);

  const num = Math.max(1, Math.min(1330, kuralNumber || 1));
  const kural = data?.kurals.find((k) => k.number === num) || null;
  const chapterNum = Math.ceil(num / 10);
  const chapter = data?.chapters.find((c) => c.chapterNumber === chapterNum) || null;

  useEffect(() => {
    if (kural) {
      recordProgress('kural', kural.number, 100, 0);
    }
  }, [kural?.number]);

  const handleCopy = () => {
    if (!kural) return;
    const text = `திருக்குறள் ${kural.number}\n${kural.line1Ta}\n${kural.line2Ta}\n\n${kural.simpleExplanationTa}\n\n"${kural.translationEn}"`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(lang === 'ta' ? 'குறள் நகலெடுக்கப்பட்டது!' : 'Kural copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWhatsAppShare = () => {
    if (!kural) return;
    const text = encodeURIComponent(
      `*திருக்குறள் ${kural.number} (${kural.chapterNameTa})*\n${kural.line1Ta}\n${kural.line2Ta}\n\n${kural.simpleExplanationTa}\n\n${kural.translationEn}\n— தமிழ் ஞானம் | Tamil Wisdom`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/thirukkural')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#762B35] dark:text-[#E6A946] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ta' ? 'திருக்குறள் நூலகத்திற்குத் திரும்பு' : 'Back to Thirukkural Library'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={num <= 1}
            onClick={() => navigate(`/kural/${num - 1}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40 disabled:opacity-40 hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'முந்தைய' : 'Prev'}</span>
          </button>
          <span className="font-mono-num text-xs px-2">#{num} / 1330</span>
          <button
            type="button"
            disabled={num >= 1330}
            onClick={() => navigate(`/kural/${num + 1}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40 disabled:opacity-40 hover:bg-[#EFE4CC] dark:hover:bg-[#2A201C]"
          >
            <span>{lang === 'ta' ? 'அடுத்த' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {kural ? (
        <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C49A45]/20 pb-5">
            <div className="space-y-1">
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                {lang === 'ta' ? kural.divisionTa : kural.divisionEn} ·{' '}
                {lang === 'ta' ? `அதிகாரம் ${kural.chapterNumber}` : `Chapter ${kural.chapterNumber}`} ·{' '}
                {lang === 'ta' ? kural.chapterNameTa : kural.chapterNameEn}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#762B35] dark:text-[#E6A946]">
                {lang === 'ta' ? `திருக்குறள் ${kural.number}` : `Thirukkural #${kural.number}`}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark('kural', kural.number)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isBookmarked('kural', kural.number) ? 'fill-[#762B35] text-[#762B35]' : ''
                  }`}
                />
                <span>{isBookmarked('kural', kural.number) ? 'Saved' : 'Bookmark'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{lang === 'ta' ? 'நகல்' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <a
                href={kural.studyPdfUrl || `/api/media/pdf/kural-${kural.number}`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-[#762B35] text-white hover:bg-[#5E2129]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            </div>
          </div>

          {/* Original Couplet */}
          <div className="p-6 rounded-xl bg-[#EFE4CC]/60 dark:bg-[#231B18] border border-[#C49A45]/25 space-y-3">
            <p className="font-tamil-serif text-2xl sm:text-3xl font-bold leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
              {kural.line1Ta}
            </p>
            <p className="font-tamil-serif text-2xl sm:text-3xl font-bold leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
              {kural.line2Ta}
            </p>
            <p className="text-sm italic text-[#725648] dark:text-[#CBBBA4] pt-2">
              {kural.transliteration}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <SpeakTamilButton
                text={`${kural.line1Ta} ${kural.line2Ta}`}
                label={lang === 'ta' ? 'தமிழ் உச்சரிப்பு கேள்' : 'Hear Tamil Pronunciation'}
              />
              <button
                type="button"
                onClick={() =>
                  playTrack({
                    id: kural.number,
                    itemType: 'kural',
                    titleTa: `திருக்குறள் ${kural.number}`,
                    titleEn: `Thirukkural #${kural.number}`,
                    subtitle: kural.chapterNameEn,
                    audioUrl: kural.audioUrl || `/api/media/audio/kural-${kural.number}`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#FCF8EE] dark:hover:bg-[#332722]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'தியான ஒலிப்பதிவு' : 'Play Contemplative Audio'}</span>
              </button>
            </div>
          </div>

          {/* Structured Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946]">
                {lang === 'ta' ? 'பதவுரை (Word-by-Word Meaning)' : 'Word-by-Word Tamil Meaning'}
              </h2>
              <p className="text-sm leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
                {kural.wordByWordTa}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946]">
                {lang === 'ta' ? 'எளிய தமிழ் விளக்கம்' : 'Simple Tamil Explanation'}
              </h2>
              <p className="text-sm leading-relaxed text-[#493126] dark:text-[#F4EBD7]">
                {kural.simpleExplanationTa}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2 pt-4 border-t border-[#C49A45]/20">
              <h2 className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946]">
                {lang === 'ta' ? 'விரிவான தமிழ் உரை' : 'Detailed Tamil Commentary'}
              </h2>
              <p className="text-sm leading-relaxed text-[#725648] dark:text-[#CBBBA4]">
                {kural.commentaryTa}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#C49A45]/20">
              <h2 className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946]">
                English Translation
              </h2>
              <p className="text-base font-medium leading-relaxed">“{kural.translationEn}”</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#C49A45]/20">
              <h2 className="text-sm font-semibold text-[#762B35] dark:text-[#E6A946]">
                English Explanation
              </h2>
              <p className="text-sm leading-relaxed text-[#725648] dark:text-[#CBBBA4]">
                {kural.explanationEn}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-8 space-y-4">
          <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
            {chapter ? `${chapter.divisionTa} · Chapter ${chapter.chapterNumber}: ${chapter.nameTa} (${chapter.nameEn})` : `Kural #${num}`}
          </p>
          <h1 className="font-display text-3xl font-bold">Kural #{num} — Manuscript Verification Queue</h1>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
            In keeping with our strict authenticity charter, we never generate or paraphrase unverified Thirukkural couplets. This archival slot in Chapter {chapterNum} ({chapter?.nameEn}) is ready for an authorized editor to publish the verified Tamil couplet and classical commentary from the Admin Dashboard.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/thirukkural')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
            >
              Browse Verified Kurals
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40"
            >
              Publish in Admin CMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
