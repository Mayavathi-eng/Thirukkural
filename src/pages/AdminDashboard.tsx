import React, { useEffect, useState } from 'react';
import { BarChart3, Lock, Plus, Shield, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

type AdminTab = 'overview' | 'kurals' | 'classes' | 'media' | 'editorial' | 'settings';

export function AdminDashboard() {
  const { firebaseUser, dbUser, signInWithGoogle, getIdToken, data, refreshData, showToast } = useApp();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Kural form
  const [kNum, setKNum] = useState('1');
  const [kLine1, setKLine1] = useState('');
  const [kLine2, setKLine2] = useState('');
  const [kTranslit, setKTranslit] = useState('');
  const [kWord, setKWord] = useState('');
  const [kSimpleTa, setKSimpleTa] = useState('');
  const [kCommTa, setKCommTa] = useState('');
  const [kTransEn, setKTransEn] = useState('');
  const [kExpEn, setKExpEn] = useState('');

  // Class form
  const [clsCategory, setClsCategory] = useState('bhagavad-gita');
  const [clsTitleEn, setClsTitleEn] = useState('');
  const [clsTitleTa, setClsTitleTa] = useState('');
  const [clsChapEn, setClsChapEn] = useState('');
  const [clsChapTa, setClsChapTa] = useState('');
  const [clsDescEn, setClsDescEn] = useState('');
  const [clsDescTa, setClsDescTa] = useState('');
  const [clsNotesTa, setClsNotesTa] = useState('');
  const [clsNotesEn, setClsNotesEn] = useState('');
  const [clsAudioUrl, setClsAudioUrl] = useState('');
  const [clsVideoUrl, setClsVideoUrl] = useState('');
  const [clsPdfUrl, setClsPdfUrl] = useState('');
  const [clsAllowDl, setClsAllowDl] = useState(true);

  // Category form
  const [catSlug, setCatSlug] = useState('');
  const [catTitleEn, setCatTitleEn] = useState('');
  const [catTitleTa, setCatTitleTa] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catDescTa, setCatDescTa] = useState('');

  // Material / PPT / Meditation
  const [matTitleEn, setMatTitleEn] = useState('');
  const [matTitleTa, setMatTitleTa] = useState('');
  const [matType, setMatType] = useState('PDF Document');
  const [matLang, setMatLang] = useState('Bilingual');
  const [matSummaryEn, setMatSummaryEn] = useState('');
  const [matFileUrl, setMatFileUrl] = useState('');
  const [matAllowDl, setMatAllowDl] = useState(true);

  // Article & Quiz
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artTitleTa, setArtTitleTa] = useState('');
  const [artCat, setArtCat] = useState('Vedanta');
  const [artBodyEn, setArtBodyEn] = useState('');
  const [artBodyTa, setArtBodyTa] = useState('');

  const [quizTitleEn, setQuizTitleEn] = useState('');
  const [quizTitleTa, setQuizTitleTa] = useState('');
  const [quizCat, setQuizCat] = useState('Thirukkural');
  const [quizDiff, setQuizDiff] = useState('Beginner');
  const [qPromptEn, setQPromptEn] = useState('');
  const [qPromptTa, setQPromptTa] = useState('');
  const [qOptions, setQOptions] = useState('Option A, Option B, Option C');
  const [qCorrect, setQCorrect] = useState('Option A');

  // Homepage Banner Settings
  const [bannerHeading, setBannerHeading] = useState(
    data?.settings.homepage_banner?.headingTa || 'திருக்குறள் & வேதாந்த ஞானம்'
  );
  const [bannerSubheading, setBannerSubheading] = useState(
    data?.settings.homepage_banner?.subheadingEn ||
      'Discover the Wisdom of Thiruvalluvar and the Timeless Teachings of Vedanta.'
  );
  const [bannerTagline, setBannerTagline] = useState(
    data?.settings.homepage_banner?.tamilTagline || 'அறிவைப் பகிர்வோம் – ஞானத்தை வளர்ப்போம்.'
  );

  const loadOverview = async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOverview(await res.json());
      }
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'editor')) {
      loadOverview();
    }
  }, [dbUser]);

  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-[#EFE4CC] dark:bg-[#2A201C] flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-[#762B35] dark:text-[#E6A946]" />
        </div>
        <h1 className="font-display text-3xl font-bold">Admin &amp; Content Editor Portal</h1>
        <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
          Sign in with an authorized Google administrator or content editor account to manage Kurals, classes, media uploads, quizzes, and site banners.
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (dbUser && dbUser.role !== 'admin' && dbUser.role !== 'editor') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-10 h-10 text-[#762B35] mx-auto" />
        <h1 className="font-display text-3xl font-bold">Editor Access Required</h1>
        <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
          Signed in as <strong>{dbUser.email}</strong> (role: <span className="font-mono-num">{dbUser.role}</span>). Ask an administrator to grant Editor or Admin permissions.
        </p>
      </div>
    );
  }

  const uploadFile = async (file: File, onDone: (url: string) => void) => {
    const token = await getIdToken();
    if (!token) return;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (res.ok) {
      const json = await res.json();
      onDone(json.url);
      showToast(`Uploaded ${json.filename}`);
    } else {
      showToast('File upload failed.');
    }
  };

  const authedPost = async (url: string, body: unknown, successMsg: string) => {
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showToast(successMsg);
      await refreshData();
      await loadOverview();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C49A45]/25 pb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#762B35] dark:text-[#E6A946]">
            Role: {dbUser?.role} · {dbUser?.email}
          </p>
          <h1 className="font-display text-4xl font-bold">Admin CMS Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['overview', 'Analytics & Inbox'],
              ['kurals', 'Kurals & Chapters'],
              ['classes', 'Classes & Categories'],
              ['media', 'Upload Media & PDFs'],
              ['editorial', 'Articles & Quizzes'],
              ['settings', 'Banner & Roles'],
            ] as Array<[AdminTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg ${
                tab === id ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          {loadingOverview && <p className="text-sm">Loading analytics...</p>}
          {overview && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(overview.counts).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-4">
                    <p className="text-xs uppercase text-[#725648] dark:text-[#CBBBA4]">{key}</p>
                    <p className="font-mono-num text-2xl font-bold text-[#762B35] dark:text-[#E6A946] mt-1">
                      {String(val)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
                  <h2 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#762B35]" /> Activity Event Breakdown
                  </h2>
                  {overview.eventBreakdown?.length === 0 ? (
                    <p className="text-xs text-[#725648]">Events populate automatically as learners view Kurals, play audio, download PDFs, and finish quizzes.</p>
                  ) : (
                    <ul className="space-y-2 text-sm font-mono-num">
                      {overview.eventBreakdown.map((ev: any) => (
                        <li key={ev.eventType} className="flex justify-between border-b border-[#C49A45]/15 pb-1">
                          <span>{ev.eventType}</span>
                          <span>{ev.total}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
                  <h2 className="font-semibold">Recent Contact Messages ({overview.messages?.length || 0})</h2>
                  <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
                    {overview.messages?.map((m: any) => (
                      <div key={m.id} className="p-3 rounded bg-[#EFE4CC]/60 dark:bg-[#231B18] space-y-1">
                        <p className="font-semibold">{m.subject} · {m.name}</p>
                        <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">{m.email}</p>
                        <p className="text-xs">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'kurals' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            authedPost(
              '/api/admin/kurals',
              {
                number: Number(kNum),
                line1Ta: kLine1,
                line2Ta: kLine2,
                transliteration: kTranslit,
                wordByWordTa: kWord,
                simpleExplanationTa: kSimpleTa,
                commentaryTa: kCommTa,
                translationEn: kTransEn,
                explanationEn: kExpEn,
              },
              `Kural #${kNum} saved.`
            );
          }}
          className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
        >
          <h2 className="text-xl font-bold">Add or Update Thirukkural (1–1330)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Kural Number (1–1330)</label>
              <input type="number" min={1} max={1330} required value={kNum} onChange={(e) => setKNum(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Line 1 (Tamil)</label>
              <input required value={kLine1} onChange={(e) => setKLine1(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Line 2 (Tamil)</label>
              <input required value={kLine2} onChange={(e) => setKLine2(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Transliteration" value={kTranslit} onChange={(e) => setKTranslit(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input placeholder="English Translation" value={kTransEn} onChange={(e) => setKTransEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          </div>
          <textarea rows={2} placeholder="Word-by-word Tamil meaning (பதவுரை)" value={kWord} onChange={(e) => setKWord(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          <textarea rows={2} placeholder="Simple Tamil explanation" value={kSimpleTa} onChange={(e) => setKSimpleTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          <textarea rows={2} placeholder="Detailed Tamil commentary" value={kCommTa} onChange={(e) => setKCommTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          <textarea rows={2} placeholder="English explanation" value={kExpEn} onChange={(e) => setKExpEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          <button type="submit" className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Save Kural</button>
        </form>
      )}

      {tab === 'classes' && (
        <div className="space-y-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              authedPost(
                '/api/admin/classes',
                {
                  categorySlug: clsCategory,
                  titleEn: clsTitleEn,
                  titleTa: clsTitleTa,
                  chapterTitleEn: clsChapEn,
                  chapterTitleTa: clsChapTa,
                  descriptionEn: clsDescEn,
                  descriptionTa: clsDescTa,
                  notesTa: clsNotesTa,
                  notesEn: clsNotesEn,
                  audioUrl: clsAudioUrl,
                  videoUrl: clsVideoUrl,
                  pdfUrl: clsPdfUrl,
                  allowDownload: clsAllowDl,
                },
                'Vedanta class published!'
              );
            }}
            className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
          >
            <h2 className="text-xl font-bold">Publish Swamiji Class</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select value={clsCategory} onChange={(e) => setClsCategory(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]">
                {data?.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.titleEn}</option>
                ))}
              </select>
              <input required placeholder="Class Title (English)" value={clsTitleEn} onChange={(e) => setClsTitleEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input required placeholder="Class Title (Tamil)" value={clsTitleTa} onChange={(e) => setClsTitleTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input placeholder="Chapter Label (English)" value={clsChapEn} onChange={(e) => setClsChapEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input placeholder="Chapter Label (Tamil)" value={clsChapTa} onChange={(e) => setClsChapTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <label className="inline-flex items-center gap-2 text-xs font-medium px-2">
                <input type="checkbox" checked={clsAllowDl} onChange={(e) => setClsAllowDl(e.target.checked)} />
                Allow Free Download
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <textarea rows={2} placeholder="Description (English)" value={clsDescEn} onChange={(e) => setClsDescEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <textarea rows={2} placeholder="Description (Tamil)" value={clsDescTa} onChange={(e) => setClsDescTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <textarea rows={2} placeholder="Class Notes (Tamil)" value={clsNotesTa} onChange={(e) => setClsNotesTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <textarea rows={2} placeholder="Class Notes (English)" value={clsNotesEn} onChange={(e) => setClsNotesEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Upload Audio (MP3/WAV)</label>
                <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], setClsAudioUrl)} />
                {clsAudioUrl && <p className="text-emerald-700 mt-1 truncate">{clsAudioUrl}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Upload Video (MP4/WebM)</label>
                <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], setClsVideoUrl)} />
                {clsVideoUrl && <p className="text-emerald-700 mt-1 truncate">{clsVideoUrl}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Upload PDF Notes</label>
                <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], setClsPdfUrl)} />
                {clsPdfUrl && <p className="text-emerald-700 mt-1 truncate">{clsPdfUrl}</p>}
              </div>
            </div>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">
              <Plus className="w-4 h-4" /> Publish Class
            </button>
          </form>

          {/* Existing Classes List with Delete */}
          <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3">
            <h3 className="font-semibold">Published Classes ({data?.classes.length || 0})</h3>
            {data?.classes.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#C49A45]/15 text-sm">
                <span>{c.titleEn} · <span className="text-xs text-[#725648]">{c.categorySlug}</span></span>
                <button
                  type="button"
                  onClick={async () => {
                    const token = await getIdToken();
                    if (!token) return;
                    await fetch(`/api/admin/classes/${c.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    refreshData();
                    showToast('Class removed');
                  }}
                  className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              authedPost(
                '/api/admin/categories',
                { slug: catSlug, titleEn: catTitleEn, titleTa: catTitleTa, descriptionEn: catDescEn, descriptionTa: catDescTa },
                'Vedanta category saved!'
              );
            }}
            className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-3"
          >
            <h3 className="font-semibold">Create / Update Vedanta Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input required placeholder="Slug (e.g. ashtavakra-gita)" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input required placeholder="Title English" value={catTitleEn} onChange={(e) => setCatTitleEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input required placeholder="Title Tamil" value={catTitleTa} onChange={(e) => setCatTitleTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Description English" value={catDescEn} onChange={(e) => setCatDescEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <input placeholder="Description Tamil" value={catDescTa} onChange={(e) => setCatDescTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            </div>
            <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Save Category</button>
          </form>
        </div>
      )}

      {tab === 'media' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            authedPost(
              '/api/admin/materials',
              {
                titleEn: matTitleEn,
                titleTa: matTitleTa,
                materialType: matType,
                language: matLang,
                summaryEn: matSummaryEn,
                summaryTa: matSummaryEn,
                fileUrl: matFileUrl,
                allowDownload: matAllowDl,
              },
              'Study material published!'
            );
          }}
          className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
        >
          <h2 className="text-xl font-bold">Upload PDF Study Material / PPT Handout</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Title (English)" value={matTitleEn} onChange={(e) => setMatTitleEn(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="Title (Tamil)" value={matTitleTa} onChange={(e) => setMatTitleTa(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <select value={matType} onChange={(e) => setMatType(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]">
              <option>PDF Document</option>
              <option>Class Notes</option>
              <option>Reference Book</option>
            </select>
            <select value={matLang} onChange={(e) => setMatLang(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]">
              <option>Bilingual</option>
              <option>Tamil</option>
              <option>English</option>
            </select>
          </div>
          <textarea rows={2} placeholder="Summary" value={matSummaryEn} onChange={(e) => setMatSummaryEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded border border-[#C49A45]/45">
              <Upload className="w-4 h-4" />
              <span>Upload PDF / PPTX File</span>
              <input type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], setMatFileUrl)} />
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={matAllowDl} onChange={(e) => setMatAllowDl(e.target.checked)} />
              Permit Free Download
            </label>
            {matFileUrl && <span className="text-emerald-700 font-mono-num">{matFileUrl}</span>}
          </div>
          <button type="submit" className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Save Study Material</button>
        </form>
      )}

      {tab === 'editorial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              authedPost(
                '/api/admin/articles',
                {
                  titleEn: artTitleEn,
                  titleTa: artTitleTa,
                  category: artCat,
                  excerptEn: artBodyEn.slice(0, 140),
                  excerptTa: artBodyTa.slice(0, 140),
                  bodyEn: artBodyEn,
                  bodyTa: artBodyTa,
                },
                'Article published!'
              );
            }}
            className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
          >
            <h2 className="text-xl font-bold">Publish Spiritual Article</h2>
            <input required placeholder="Article Title (English)" value={artTitleEn} onChange={(e) => setArtTitleEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="Article Title (Tamil)" value={artTitleTa} onChange={(e) => setArtTitleTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input placeholder="Category (e.g. Thirukkural, Vedanta)" value={artCat} onChange={(e) => setArtCat(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <textarea required rows={3} placeholder="Full Body (English)" value={artBodyEn} onChange={(e) => setArtBodyEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <textarea required rows={3} placeholder="Full Body (Tamil)" value={artBodyTa} onChange={(e) => setArtBodyTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <button type="submit" className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Publish Article</button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              authedPost(
                '/api/admin/quizzes',
                {
                  titleEn: quizTitleEn,
                  titleTa: quizTitleTa,
                  category: quizCat,
                  difficulty: quizDiff,
                  descriptionEn: 'Interactive quiz authored in Admin CMS.',
                  descriptionTa: 'நிர்வாகப் பலகத்தில் உருவாக்கப்பட்ட வினாடி-வினா.',
                  questions: [
                    {
                      questionType: 'mcq',
                      promptEn: qPromptEn,
                      promptTa: qPromptTa,
                      optionsJson: qOptions.split(',').map((s) => s.trim()).filter(Boolean),
                      correctAnswer: qCorrect.trim(),
                      explanationEn: 'Verified answer.',
                      explanationTa: 'சரியான விடை.',
                    },
                  ],
                },
                'Quiz created!'
              );
            }}
            className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
          >
            <h2 className="text-xl font-bold">Create New Quiz</h2>
            <input required placeholder="Quiz Title (English)" value={quizTitleEn} onChange={(e) => setQuizTitleEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="Quiz Title (Tamil)" value={quizTitleTa} onChange={(e) => setQuizTitleTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Category" value={quizCat} onChange={(e) => setQuizCat(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
              <select value={quizDiff} onChange={(e) => setQuizDiff(e.target.value)} className="px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <input required placeholder="First Question Prompt (English)" value={qPromptEn} onChange={(e) => setQPromptEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="First Question Prompt (Tamil)" value={qPromptTa} onChange={(e) => setQPromptTa(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="Options (comma-separated)" value={qOptions} onChange={(e) => setQOptions(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input required placeholder="Exact Correct Option" value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <button type="submit" className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Create Quiz</button>
          </form>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              authedPost(
                '/api/admin/settings',
                {
                  key: 'homepage_banner',
                  valueJson: {
                    headingTa: bannerHeading,
                    subheadingEn: bannerSubheading,
                    tamilTagline: bannerTagline,
                    freeLabelEn: '100% FREE LEARNING – KNOWLEDGE FOR EVERYONE.',
                    freeLabelTa: 'கல்வி இலவசம் – ஞானம் அனைவருக்கும்.',
                  },
                },
                'Homepage banner updated!'
              );
            }}
            className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4"
          >
            <h2 className="text-xl font-bold">Update Homepage Banner</h2>
            <input value={bannerHeading} onChange={(e) => setBannerHeading(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input value={bannerSubheading} onChange={(e) => setBannerSubheading(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <input value={bannerTagline} onChange={(e) => setBannerTagline(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]" />
            <button type="submit" className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white">Save Banner</button>
          </form>

          {dbUser?.role === 'admin' && overview?.users && (
            <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
              <h2 className="text-xl font-bold">Role-Based Access Control (Admin &amp; Editors)</h2>
              <div className="space-y-2 text-sm">
                {overview.users.map((u: any) => (
                  <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[#C49A45]/15">
                    <span>{u.email} ({u.displayName || 'User'})</span>
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        const token = await getIdToken();
                        if (!token) return;
                        await fetch(`/api/admin/users/${u.id}/role`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ role: e.target.value }),
                        });
                        showToast('Role updated');
                        loadOverview();
                      }}
                      className="px-2.5 py-1 text-xs rounded border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]"
                    >
                      <option value="learner">learner</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
