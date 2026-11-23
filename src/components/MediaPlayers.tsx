import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { Presentation, VedantaClass } from '../types.ts';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function GlobalAudioBar() {
  const { currentTrack, closePlayer, lang, recordProgress } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentTrack) return;
    el.src = currentTrack.audioUrl;
    el.playbackRate = speed;
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const skip = (delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    const val = Number(e.target.value);
    el.currentTime = val;
    setCurrentTime(val);
  };

  return (
    <div
      role="region"
      aria-label="Audio Player"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[#C49A45]/35 bg-[#FCF8EE]/95 backdrop-blur-md text-[#493126] dark:bg-[#231B18]/95 dark:text-[#F4EBD7] dark:border-[#C49A45]/25"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (!el) return;
          setCurrentTime(el.currentTime);
          if (el.duration > 0) {
            const pct = Math.round((el.currentTime / el.duration) * 100);
            if (pct > 0 && pct % 25 === 0) {
              recordProgress('audio', currentTrack.id, pct, Math.round(el.currentTime));
            }
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => {
          setPlaying(false);
          recordProgress('audio', currentTrack.id, 100, Math.round(duration));
        }}
      />
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1 max-w-xs">
          <p className="text-sm font-semibold truncate">
            {lang === 'ta' ? currentTrack.titleTa : currentTrack.titleEn}
          </p>
          <p className="text-xs text-[#725648] dark:text-[#CBBBA4] truncate">
            {currentTrack.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => skip(-15)}
            aria-label="Rewind 15 seconds"
            className="p-2 rounded-md hover:bg-[#EFE4CC] dark:hover:bg-[#332722] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-[#762B35] text-[#FCF8EE] flex items-center justify-center hover:bg-[#5E2129] transition-colors"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={() => skip(15)}
            aria-label="Forward 15 seconds"
            className="p-2 rounded-md hover:bg-[#EFE4CC] dark:hover:bg-[#332722] transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
          <span className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4] w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 18}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio progress"
            className="w-full accent-[#762B35] cursor-pointer"
          />
          <span className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4] w-10">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            aria-label="Playback speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-xs font-mono-num bg-[#EFE4CC] dark:bg-[#2A201C] border border-[#C49A45]/30 rounded px-2 py-1.5"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>

          {currentTrack.allowDownload !== false && (
            <a
              href={`${currentTrack.audioUrl}?download=1`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722] transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
            </a>
          )}

          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close audio player"
            className="p-2 rounded-md hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function VideoLessonPlayer({ lesson }: { lesson: VedantaClass }) {
  const { lang, recordProgress } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(18);
  const [speed, setSpeed] = useState(1);

  const isNativeVideo =
    lesson.videoUrl &&
    (lesson.videoUrl.endsWith('.mp4') ||
      lesson.videoUrl.endsWith('.webm') ||
      lesson.videoUrl.startsWith('/api/uploads/'));

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const notesLines = (lang === 'ta' ? lesson.notesTa : lesson.notesEn)
    .split('\n')
    .filter(Boolean);
  const activeLineIndex =
    notesLines.length > 0
      ? Math.min(
          notesLines.length - 1,
          Math.floor((currentTime / Math.max(duration, 1)) * notesLines.length)
        )
      : 0;

  if (isNativeVideo) {
    return (
      <div className="rounded-xl overflow-hidden border border-[#C49A45]/30 bg-black">
        <video
          controls
          className="w-full aspect-video"
          src={lesson.videoUrl || undefined}
          onEnded={() => recordProgress('video', lesson.id, 100, 0)}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#C49A45]/35 bg-[#1F1714] text-[#F4EBD7]"
    >
      <audio
        ref={audioRef}
        src={lesson.audioUrl || `/api/media/audio/${lesson.slug}`}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 18);
        }}
        onEnded={() => {
          setPlaying(false);
          recordProgress('video', lesson.id, 100, Math.round(duration));
        }}
      />

      <div className="relative aspect-video overflow-hidden">
        <img
          src="/src/assets/images/hero_temple_library_1795408079888.jpg"
          alt={lesson.titleEn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1412] via-[#1A1412]/70 to-transparent" />

        <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#E6A946]">
            <span>{lang === 'ta' ? lesson.chapterTitleTa : lesson.chapterTitleEn}</span>
            <span className="font-mono-num">{lesson.durationMinutes} min</span>
          </div>

          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-[#FCF8EE] leading-snug">
              {lang === 'ta' ? lesson.titleTa : lesson.titleEn}
            </h3>
            {notesLines.length > 0 && (
              <div className="p-4 rounded-lg bg-[#2A201C]/90 border border-[#C49A45]/30">
                <p className="text-xs text-[#D4AA56] mb-1">
                  {lang === 'ta' ? 'வகுப்புக் குறிப்பு — திரை ஒத்திசைவு' : 'Synchronized Study Note'}
                </p>
                <p className="text-sm md:text-base leading-relaxed text-[#F4EBD7]">
                  {notesLines[activeLineIndex]}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 18}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = v;
                setCurrentTime(v);
              }}
              aria-label="Video lesson progress"
              className="w-full accent-[#D99B38] cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = audioRef.current;
                    if (!el) return;
                    if (playing) {
                      el.pause();
                      setPlaying(false);
                    } else {
                      el.play().then(() => setPlaying(true)).catch(() => {});
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#762B35] hover:bg-[#8E3541] text-white text-sm font-medium transition-colors"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{playing ? (lang === 'ta' ? 'நிறுத்து' : 'Pause') : (lang === 'ta' ? 'இயக்கு' : 'Play Lecture')}</span>
                </button>
                <span className="text-xs font-mono-num text-[#CBBBA4]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label="Video speed"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="text-xs font-mono-num bg-[#2A201C] border border-[#C49A45]/30 rounded px-2 py-1.5 text-[#F4EBD7]"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                  className="p-2 rounded bg-[#2A201C] hover:bg-[#3A2D28] text-[#F4EBD7]"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PresentationViewer({ presentation }: { presentation: Presentation }) {
  const { lang } = useApp();
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = Array.isArray(presentation.slidesJson) ? presentation.slidesJson : [];
  const current = slides[slideIdx] || slides[0];

  useEffect(() => {
    setSlideIdx(0);
  }, [presentation.id]);

  const downloadDeckOutline = () => {
    const lines = slides.map(
      (s, i) =>
        `Slide ${i + 1}: ${s.titleTa} / ${s.titleEn}\n` +
        (s.bulletsTa || []).map((b) => `  • ${b}`).join('\n') +
        '\n' +
        (s.bulletsEn || []).map((b) => `  - ${b}`).join('\n') +
        (s.quote ? `\n  Quote: ${s.quote}` : '')
    );
    const blob = new Blob([`${presentation.titleTa}\n${presentation.titleEn}\n\n${lines.join('\n\n')}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.slug}-slides.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!current) return null;

  return (
    <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#C49A45]/25 bg-[#EFE4CC]/70 dark:bg-[#231B18] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
            {presentation.topic} · Slide <span className="font-mono-num">{slideIdx + 1} / {slides.length}</span>
          </p>
          <h3 className="text-lg font-semibold">
            {lang === 'ta' ? presentation.titleTa : presentation.titleEn}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {presentation.allowDownload && (
            <>
              <button
                type="button"
                onClick={downloadDeckOutline}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40 hover:bg-[#F7F0DF] dark:hover:bg-[#332722]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'PPT குறிப்பு' : 'Download Slides'}</span>
              </button>
              <a
                href={presentation.pdfFileUrl || `/api/media/pdf/${presentation.slug}`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#762B35] text-white hover:bg-[#5E2129]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}</span>
              </a>
            </>
          )}
        </div>
      </div>

      <div className="p-8 md:p-12 min-h-[320px] flex flex-col justify-between kolam-pattern-bg">
        <div className="space-y-6">
          <h4 className="text-2xl md:text-3xl font-semibold text-[#762B35] dark:text-[#E6A946]">
            {lang === 'ta' ? current.titleTa : current.titleEn}
          </h4>
          <ul className="space-y-3 text-base md:text-lg leading-relaxed">
            {(lang === 'ta' ? current.bulletsTa : current.bulletsEn).map((b, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C49A45] shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {current.quote && (
            <blockquote className="pt-4 border-t border-[#C49A45]/25 text-base italic text-[#762B35] dark:text-[#D4AA56] font-tamil-serif">
              {current.quote}
            </blockquote>
          )}
        </div>

        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={slideIdx === 0}
            onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded border border-[#C49A45]/40 disabled:opacity-40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{lang === 'ta' ? 'முந்தைய' : 'Previous'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlideIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIdx ? 'w-6 bg-[#762B35] dark:bg-[#D99B38]' : 'w-2 bg-[#C49A45]/40'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={slideIdx >= slides.length - 1}
            onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded border border-[#C49A45]/40 disabled:opacity-40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722]"
          >
            <span>{lang === 'ta' ? 'அடுத்த' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SpeakTamilButton({ text, label }: { text: string; label?: string }) {
  const { showToast, lang } = useApp();
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToast(lang === 'ta' ? 'உங்கள் உலாவியில் குரல் வாசிப்பு இல்லை.' : 'Speech synthesis unavailable.');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ta-IN';
    utter.rate = 0.85;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#C49A45]/40 hover:bg-[#EFE4CC] dark:hover:bg-[#332722] transition-colors whitespace-nowrap"
    >
      <Volume2 className="w-3.5 h-3.5 text-[#762B35] dark:text-[#E6A946]" />
      <span>{speaking ? (lang === 'ta' ? 'ஒலிக்கிறது...' : 'Reciting...') : label || (lang === 'ta' ? 'உச்சரிப்பு கேள்' : 'Pronounce')}</span>
    </button>
  );
}
