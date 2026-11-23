import React, { useMemo, useState } from 'react';
import { Download, FileText, Headphones, Play, Presentation as PresentationIcon, Video } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PresentationViewer, VideoLessonPlayer } from '../components/MediaPlayers.tsx';

export function AudioLibraryPage() {
  const { data, lang, playTrack, recentlyPlayed } = useApp();
  const [filterCat, setFilterCat] = useState('all');

  if (!data) return null;

  const tracks = useMemo(() => {
    const classTracks = data.classes
      .filter((c) => filterCat === 'all' || c.categorySlug === filterCat)
      .map((c) => ({
        id: c.id,
        itemType: 'audio' as const,
        titleTa: c.titleTa,
        titleEn: c.titleEn,
        subtitle: `${lang === 'ta' ? c.chapterTitleTa : c.chapterTitleEn} · ${c.durationMinutes} min`,
        audioUrl: c.audioUrl || `/api/media/audio/${c.slug}`,
        allowDownload: c.allowDownload,
      }));
    const medTracks =
      filterCat === 'all' || filterCat === 'guided-meditation'
        ? data.meditations.map((m) => ({
            id: 1000 + m.id,
            itemType: 'meditation' as const,
            titleTa: m.titleTa,
            titleEn: m.titleEn,
            subtitle: `${m.category} · ${m.durationMinutes} min`,
            audioUrl: m.audioUrl || `/api/media/audio/${m.slug}`,
            allowDownload: true,
          }))
        : [];
    return [...classTracks, ...medTracks];
  }, [data, filterCat, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'இலவச ஒலி நூலகம்' : 'Free Audio Streaming & Downloads'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'ஒலி நூலகம் (Audio Library)' : 'Audio Library'}
        </h1>
        <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
          {lang === 'ta'
            ? 'வேதாந்த வகுப்புகள், திருக்குறள் பாராயணம் மற்றும் தியான ஒலிப்பதிவுகளைக் கேட்டுப் பதிவிறக்கம் செய்யுங்கள்.'
            : 'Stream Swamiji’s Vedanta discourses and guided meditations with playback speed control, seek bar, and free downloads.'}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
            filterCat === 'all' ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
          }`}
        >
          {lang === 'ta' ? 'அனைத்தும்' : 'All Audio'}
        </button>
        {data.categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setFilterCat(cat.slug)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              filterCat === cat.slug ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
            }`}
          >
            {lang === 'ta' ? cat.titleTa.split('—')[0].trim() : cat.titleEn}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-3">
          {tracks.map((track, idx) => (
            <div
              key={`${track.itemType}-${track.id}`}
              className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4]">
                  {String(idx + 1).padStart(2, '0')} · {track.subtitle}
                </p>
                <h2 className="text-base font-semibold truncate">
                  {lang === 'ta' ? track.titleTa : track.titleEn}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => playTrack(track)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'இயக்கு' : 'Play'}</span>
                </button>
                {track.allowDownload && (
                  <a
                    href={`${track.audioUrl}?download=1`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#EFE4CC]/60 dark:bg-[#231B18] p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
              <span>{lang === 'ta' ? 'சமீபத்தில் கேட்டவை' : 'Recently Played'}</span>
            </h2>
            {recentlyPlayed.length === 0 ? (
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                {lang === 'ta'
                  ? 'நீங்கள் கேட்கும் ஒலி வகுப்புகள் இங்கே பட்டியலிடப்படும்.'
                  : 'Tracks you listen to will appear here for quick replay.'}
              </p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {recentlyPlayed.map((t) => (
                  <li key={`${t.itemType}-${t.id}`} className="border-b border-[#C49A45]/15 pb-2 last:border-0">
                    <button
                      type="button"
                      onClick={() => playTrack(t)}
                      className="text-left hover:text-[#762B35] dark:hover:text-[#E6A946] font-medium"
                    >
                      {lang === 'ta' ? t.titleTa : t.titleEn}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function VideoLibraryPage() {
  const { data, lang } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!data) return null;

  const activeLesson =
    data.classes.find((c) => c.id === selectedId) || data.classes[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'காணொளிப் பாடசாலை' : 'Free Video Classes'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'காணொளி நூலகம் (Video Library)' : 'Video Library'}
        </h1>
      </div>

      {activeLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <VideoLessonPlayer lesson={activeLesson} />
            <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">
                  {lang === 'ta' ? activeLesson.titleTa : activeLesson.titleEn}
                </h2>
                {activeLesson.allowDownload && (
                  <a
                    href={activeLesson.pdfUrl || `/api/media/pdf/notes-${activeLesson.slug}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ta' ? 'பாடக் குறிப்பு PDF' : 'Download Class Notes'}</span>
                  </a>
                )}
              </div>
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                {lang === 'ta' ? activeLesson.descriptionTa : activeLesson.descriptionEn}
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Video className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
              <span>{lang === 'ta' ? 'அத்தியாயப் பட்டியல்' : 'Chapter Playlist'}</span>
            </h3>
            <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] divide-y divide-[#C49A45]/15">
              {data.classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedId(cls.id)}
                  className={`w-full text-left p-4 space-y-1 transition-colors ${
                    cls.id === activeLesson.id
                      ? 'bg-[#762B35] text-white'
                      : 'hover:bg-[#EFE4CC]/70 dark:hover:bg-[#332722]'
                  }`}
                >
                  <p
                    className={`text-xs ${
                      cls.id === activeLesson.id ? 'text-white/80' : 'text-[#725648] dark:text-[#CBBBA4]'
                    }`}
                  >
                    {lang === 'ta' ? cls.chapterTitleTa : cls.chapterTitleEn} ·{' '}
                    <span className="font-mono-num">{cls.durationMinutes}m</span>
                  </p>
                  <p className="text-sm font-semibold">
                    {lang === 'ta' ? cls.titleTa : cls.titleEn}
                  </p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export function PptLibraryPage() {
  const { data, lang } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [topicFilter, setTopicFilter] = useState('all');

  if (!data) return null;

  const topics = Array.from(new Set(data.presentations.map((p) => p.topic)));
  const filtered = data.presentations.filter(
    (p) => topicFilter === 'all' || p.topic === topicFilter
  );
  const active = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'காட்சி விளக்கத் தொகுப்பு' : 'Interactive Slide Decks'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'PPT விளக்கக் காட்சி நூலகம்' : 'PPT Library'}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTopicFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
            topicFilter === 'all' ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
          }`}
        >
          {lang === 'ta' ? 'அனைத்துத் தலைப்புகளும்' : 'All Topics'}
        </button>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopicFilter(t)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
              topicFilter === t ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left p-5 rounded-xl border transition-colors space-y-1.5 ${
                active?.id === p.id
                  ? 'border-[#762B35] bg-[#762B35] text-white'
                  : 'border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35]'
              }`}
            >
              <p className={`text-xs ${active?.id === p.id ? 'text-white/80' : 'text-[#725648] dark:text-[#CBBBA4]'}`}>
                <PresentationIcon className="w-3.5 h-3.5 inline mr-1" />
                {p.topic} · <span className="font-mono-num">{p.slidesJson.length} slides</span>
              </p>
              <h2 className="text-base font-semibold">
                {lang === 'ta' ? p.titleTa : p.titleEn}
              </h2>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8">
          {active && <PresentationViewer presentation={active} />}
        </div>
      </div>
    </div>
  );
}

export function StudyMaterialsPage() {
  const { data, lang } = useApp();
  const [typeFilter, setTypeFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');

  if (!data) return null;

  const filtered = data.studyMaterials.filter(
    (m) =>
      (typeFilter === 'all' || m.materialType === typeFilter) &&
      (langFilter === 'all' || m.language === langFilter)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'இலவசப் பதிவிறக்க வளங்கள்' : 'Open Educational Resources'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'படிப்புப் பொருட்கள் (Study Materials)' : 'Study Materials & PDFs'}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'PDF Document', 'Class Notes', 'Reference Book'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
                typeFilter === t ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
              }`}
            >
              {t === 'all' ? (lang === 'ta' ? 'அனைத்து வகைகளும்' : 'All Formats') : t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'Tamil', 'English', 'Bilingual'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLangFilter(l)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                langFilter === l ? 'bg-[#C49A45] text-[#1A1412]' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
              }`}
            >
              {l === 'all' ? (lang === 'ta' ? 'எல்லா மொழிகளும்' : 'All Languages') : l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                <FileText className="w-3.5 h-3.5 inline mr-1 text-[#762B35] dark:text-[#E6A946]" />
                {mat.materialType} · {mat.language}
              </p>
              <h2 className="text-xl font-bold">
                {lang === 'ta' ? mat.titleTa : mat.titleEn}
              </h2>
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                {lang === 'ta' ? mat.summaryTa : mat.summaryEn}
              </p>
            </div>
            <div className="pt-2 border-t border-[#C49A45]/15 flex items-center justify-between">
              <span className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                {mat.allowDownload ? 'Free Download Permitted' : 'View Only'}
              </span>
              {mat.allowDownload && (
                <a
                  href={mat.fileUrl || `/api/media/pdf/${mat.slug}`}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
