import React, { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, Mail, Play, Search, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { Article } from '../types.ts';

export function ArticlesPage() {
  const { data, lang, isBookmarked, toggleBookmark } = useApp();
  const [catFilter, setCatFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  if (!data) return null;

  const categories = ['all', ...Array.from(new Set(data.articles.map((a) => a.category)))];
  const filtered = data.articles.filter((a) => {
    const matchCat = catFilter === 'all' || a.category === catFilter;
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      a.titleEn.toLowerCase().includes(q) ||
      a.titleTa.toLowerCase().includes(q) ||
      a.excerptEn.toLowerCase().includes(q) ||
      a.excerptTa.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  if (activeArticle) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <button
          type="button"
          onClick={() => setActiveArticle(null)}
          className="text-sm font-medium text-[#762B35] dark:text-[#E6A946] hover:underline"
        >
          ← {lang === 'ta' ? 'அனைத்துக் கட்டுரைகளுக்கும் திரும்பு' : 'Back to All Articles'}
        </button>

        <article className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-10 space-y-6">
          <div className="space-y-3 border-b border-[#C49A45]/20 pb-5">
            <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
              {activeArticle.category} · {activeArticle.author} ·{' '}
              <span className="font-mono-num">{activeArticle.readMinutes} min read</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              {lang === 'ta' ? activeArticle.titleTa : activeArticle.titleEn}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => toggleBookmark('article', activeArticle.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40"
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isBookmarked('article', activeArticle.id) ? 'fill-[#762B35] text-[#762B35]' : ''
                  }`}
                />
                <span>{isBookmarked('article', activeArticle.id) ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = encodeURIComponent(
                    `${activeArticle.titleTa}\n${activeArticle.titleEn}\n— தமிழ் ஞானம்`
                  );
                  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#C49A45]/40"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="prose-editorial max-w-prose space-y-4 text-base leading-relaxed whitespace-pre-line">
            {lang === 'ta' ? activeArticle.bodyTa : activeArticle.bodyEn}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'கட்டுரைகள் & ஆன்மீகச் சிந்தனைகள்' : 'Knowledge & Reflections'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'கட்டுரைகள் (Articles)' : 'Spiritual & Literary Articles'}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCatFilter(c)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
                catFilter === c ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
              }`}
            >
              {c === 'all' ? (lang === 'ta' ? 'அனைத்தும்' : 'All Topics') : c}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#725648]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ta' ? 'கட்டுரை தேடுக...' : 'Search articles...'}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((art) => (
          <article
            key={art.id}
            className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#725648] dark:text-[#CBBBA4]">
                <span>
                  {art.category} · <span className="font-mono-num">{art.readMinutes} min read</span>
                </span>
                <button type="button" onClick={() => toggleBookmark('article', art.id)} aria-label="Bookmark article">
                  <Bookmark
                    className={`w-4 h-4 ${
                      isBookmarked('article', art.id) ? 'fill-[#762B35] text-[#762B35]' : ''
                    }`}
                  />
                </button>
              </div>
              <h2 className="text-2xl font-bold leading-snug">
                {lang === 'ta' ? art.titleTa : art.titleEn}
              </h2>
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
                {lang === 'ta' ? art.excerptTa : art.excerptEn}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveArticle(art)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#762B35] dark:text-[#E6A946] hover:underline"
            >
              <span>{lang === 'ta' ? 'முழு கட்டுரையைப் படிக்க' : 'Read Full Article'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { lang, navigate } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      <div className="space-y-3 border-b border-[#C49A45]/25 pb-6 max-w-3xl">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'மரபும் ஞானப் பாரம்பரியமும்' : 'Heritage & Lineage'}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {lang === 'ta' ? 'திருவள்ளுவரும் சுவாமிஜியும்' : 'About Thiruvalluvar & Swamiji'}
        </h1>
        <p className="text-base text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
          {lang === 'ta'
            ? 'திருக்குறளின் உலகளாவிய அறநெறியையும், வேதாந்தத்தின் ஆன்மிகப் பேரொளியையும் அனைவருக்கும் இலவசமாக வழங்கும் டிஜிட்டல் அறிவுக் கோயில்.'
            : 'Tamil Wisdom unites the universal ethical vision of Sage Thiruvalluvar with Swamiji’s lucid Vedantic teachings in a completely free digital library.'}
        </p>
      </div>

      {/* Section 1: About Thiruvalluvar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-[#C49A45]/40 aspect-[3/4] bg-[#EFE4CC] dark:bg-[#231B18]">
            <img
              src="/src/assets/images/portrait_thiruvalluvar_1795408079715.jpg"
              alt="Classical portrait of Sage Thiruvalluvar holding stylus and palm-leaf manuscript"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#762B35] dark:text-[#E6A946]">
            {lang === 'ta' ? 'பகுதி 01 · தெய்வப் புலவர்' : 'Part 01 · Sage & Poet-Philosopher'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            {lang === 'ta' ? 'திருவள்ளுவர் (Thiruvalluvar)' : 'Sage Thiruvalluvar & The Thirukkural'}
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
            <p>
              {lang === 'ta'
                ? 'கி.மு. முதலாம் நூற்றாண்டு காலப்பகுதியில் வாழ்ந்ததாகப் போற்றப்படும் திருவள்ளுவர், மதம், இனம், நாடு கடந்த உலகப் பொதுமறையாகிய திருக்குறளை அருளியவர். மயிலாப்பூரில் நெசவுத் தொழில் செய்து எளிய வாழ்க்கை வாழ்ந்த இவர், மனித வாழ்வின் அனைத்துப் பரிமாணங்களையும் 1,330 ஈரடி வெண்பாக்களில் வடித்தார்.'
                : 'Revered across millennia as the author of the Thirukkural (dated around the classical Sangam/post-Sangam era), Thiruvalluvar lived a humble life as a weaver in Mylapore, Chennai, and composed a masterpiece that transcends sect, region, and era.'}
            </p>
            <p>
              {lang === 'ta'
                ? 'அறத்துப்பால் (38 அதிகாரம்), பொருட்பால் (70 அதிகாரம்), காமத்துப்பால் (25 அதிகாரம்) என 133 அதிகாரங்களையும் 1,330 குறள்களையும் கொண்ட திருக்குறள், உலகின் மிக அதிக மொழிகளில் மொழிபெயர்க்கப்பட்ட அறநூல்களில் ஒன்றாகும்.'
                : 'Structured with mathematical symmetry into 133 chapters of 10 couplets each—Arathuppaal (380 couplets on Virtue), Porutpaal (700 on Polity & Society), and Kaamathuppaal (250 on Love)—the Thirukkural stands among the most translated ethical classics in world literature.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/thirukkural')}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
          >
            {lang === 'ta' ? 'திருக்குறள் நூலகத்தை ஆராய்க' : 'Explore 133 Chapters'}
          </button>
        </div>
      </section>

      {/* Section 2: About Swamiji */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 border-t border-[#C49A45]/25">
        <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#762B35] dark:text-[#E6A946]">
            {lang === 'ta' ? 'பகுதி 02 · வேதாந்த ஆச்சாரியார்' : 'Part 02 · Vedanta Acharya'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            {lang === 'ta' ? 'சுவாமிஜியின் ஆன்மீகப் பயணம் & போதனைகள்' : "Swamiji's Spiritual Journey & Teachings"}
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
            <p>
              {lang === 'ta'
                ? 'பாரம்பரிய குருகுல மரபில் வேதாந்தம், உபநிஷத்துக்கள், பகவத்கீதை, பிரம்ம சூத்திரம் மற்றும் தமிழ் மெய்ஞ்ஞான இலக்கியங்களை ஆழமாகக் கற்ற சுவாமிஜி, கடந்த பல ஆண்டுகளாகச் சாமானிய மக்களுக்கும் மாணவர்களுக்கும் எளிய தமிழ் மற்றும் ஆங்கிலத்தில் ஆத்ம ஞானத்தைப் போதித்து வருகிறார்.'
                : 'Trained in the classical Gurukula tradition of Advaita Vedanta and Tamil philosophical literature, Swamiji has dedicated decades to making the Bhagavad Gita, Upanishads, Brahma Sutram, and Tamil Vedantic texts clear and practical for everyday seekers.'}
            </p>
            <p>
              {lang === 'ta'
                ? '“அறிவு விற்பனைப் பொருளல்ல; தகுதியுள்ள ஒவ்வொரு இதயத்தையும் இலவசமாகச் சென்றடைய வேண்டிய ஒளி” என்ற உயரிய கொள்கையோடு, சுவாமிஜியின் அனைத்து ஒலி-காணொளி வகுப்புகளும் விளக்கக் காட்சிகளும் இங்கு 100% இலவசமாக வழங்கப்படுகின்றன.'
                : 'Guided by the conviction that sacred wisdom must remain free and open to every sincere student, Swamiji’s complete collection of audio lectures, video discourses, slide presentations, and study notes is offered here without fees or barriers.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
          >
            {lang === 'ta' ? 'சுவாமிஜியின் வகுப்புகளுக்குச் செல்க' : "Browse Swamiji's Classes"}
          </button>
        </div>
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="rounded-xl overflow-hidden border border-[#C49A45]/40 aspect-[3/4] bg-[#EFE4CC] dark:bg-[#231B18]">
            <img
              src="/src/assets/images/portrait_swamiji_vedanta_1795408079616.jpg"
              alt="Traditional Vedanta teacher seated in contemplation beneath an ancient banyan tree"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export function SearchPage() {
  const { lang, navigate, playTrack } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const runSearch = async (qVal: string, catVal: string) => {
    if (!qVal.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(qVal.trim())}&category=${encodeURIComponent(catVal)}`
      );
      const json = await res.json();
      setResults(json);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) runSearch(query, category);
    }, 250);
    return () => clearTimeout(t);
  }, [query, category]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'ஒருங்கிணைந்த அறிவுத் தேடல்' : 'Universal Tamil & English Search'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'அனைத்தையும் தேடுக (Smart Search)' : 'Smart Search Engine'}
        </h1>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#725648]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ta'
                ? 'குறள் எண், தமிழ் சொல், பகவத்கீதை, உபநிஷத், வகுப்பு, PDF தேடுக...'
                : 'Search Kural number (e.g. 34), Tamil word (அறம்), Gita, Upanishad, audio, PDF...'
            }
            className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl border border-[#C49A45]/45 bg-[#FCF8EE] dark:bg-[#2A201C] focus:outline-none focus:border-[#762B35]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['all', 'All'],
            ['kurals', 'Thirukkural'],
            ['classes', 'Vedanta Classes'],
            ['presentations', 'PPT Decks'],
            ['materials', 'Study Materials'],
            ['articles', 'Articles'],
            ['quizzes', 'Quizzes'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${
                category === key ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {searching && <p className="text-sm text-[#725648]">Searching platform...</p>}

      {results && (
        <div className="space-y-8">
          {results.kurals?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Thirukkural Matches</h2>
              {results.kurals.map((k: any) => (
                <button
                  key={k.number}
                  type="button"
                  onClick={() => navigate(`/kural/${k.number}`)}
                  className="w-full text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35] space-y-1"
                >
                  <p className="text-xs font-mono-num text-[#762B35] dark:text-[#E6A946]">
                    Kural {k.number} · {k.chapterNameTa} ({k.chapterNameEn})
                  </p>
                  <p className="font-tamil-serif font-semibold">{k.line1Ta} {k.line2Ta}</p>
                  <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">{k.translationEn}</p>
                </button>
              ))}
            </div>
          )}

          {results.chapters?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Thirukkural Chapters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.chapters.map((ch: any) => (
                  <button
                    key={ch.chapterNumber}
                    type="button"
                    onClick={() => navigate(`/kural/${ch.startKural}`)}
                    className="text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] hover:border-[#762B35]"
                  >
                    <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                      Chapter {ch.chapterNumber} · {ch.divisionEn}
                    </p>
                    <p className="font-semibold">{ch.nameTa} · {ch.nameEn}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.classes?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Swamiji's Vedanta Classes</h2>
              {results.classes.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">{c.chapterTitleEn}</p>
                    <p className="font-semibold">{lang === 'ta' ? c.titleTa : c.titleEn}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        playTrack({
                          id: c.id,
                          itemType: 'class',
                          titleTa: c.titleTa,
                          titleEn: c.titleEn,
                          subtitle: c.chapterTitleEn,
                          audioUrl: c.audioUrl || `/api/media/audio/${c.slug}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-[#762B35] text-white"
                    >
                      <Play className="w-3 h-3" /> Listen
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/classes/${c.categorySlug}`)}
                      className="px-3 py-1.5 text-xs rounded border border-[#C49A45]/40"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(results.presentations?.length > 0 || results.materials?.length > 0 || results.articles?.length > 0 || results.quizzes?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.presentations?.map((p: any) => (
                <button
                  key={`ppt-${p.id}`}
                  type="button"
                  onClick={() => navigate('/ppt-library')}
                  className="text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C]"
                >
                  <p className="text-xs text-[#762B35] dark:text-[#E6A946]">PPT Presentation</p>
                  <p className="font-semibold">{lang === 'ta' ? p.titleTa : p.titleEn}</p>
                </button>
              ))}
              {results.materials?.map((m: any) => (
                <button
                  key={`mat-${m.id}`}
                  type="button"
                  onClick={() => navigate('/study-materials')}
                  className="text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C]"
                >
                  <p className="text-xs text-[#762B35] dark:text-[#E6A946]">Study Material ({m.language})</p>
                  <p className="font-semibold">{lang === 'ta' ? m.titleTa : m.titleEn}</p>
                </button>
              ))}
              {results.articles?.map((a: any) => (
                <button
                  key={`art-${a.id}`}
                  type="button"
                  onClick={() => navigate('/articles')}
                  className="text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C]"
                >
                  <p className="text-xs text-[#762B35] dark:text-[#E6A946]">Article · {a.category}</p>
                  <p className="font-semibold">{lang === 'ta' ? a.titleTa : a.titleEn}</p>
                </button>
              ))}
              {results.quizzes?.map((q: any) => (
                <button
                  key={`quiz-${q.id}`}
                  type="button"
                  onClick={() => navigate('/quiz-centre')}
                  className="text-left p-4 rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C]"
                >
                  <p className="text-xs text-[#762B35] dark:text-[#E6A946]">Quiz · {q.difficulty}</p>
                  <p className="font-semibold">{lang === 'ta' ? q.titleTa : q.titleEn}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SavedProgressPage() {
  const { data, bookmarks, progress, recentlyPlayed, navigate, playTrack, firebaseUser, signInWithGoogle, lang } = useApp();

  if (!data) return null;

  const favKurals = data.kurals.filter((k) =>
    bookmarks.some((b) => b.itemType === 'kural' && b.itemId === k.number)
  );
  const favClasses = data.classes.filter((c) =>
    bookmarks.some((b) => b.itemType === 'class' && b.itemId === c.id)
  );
  const favArticles = data.articles.filter((a) =>
    bookmarks.some((b) => b.itemType === 'article' && b.itemId === a.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C49A45]/25 pb-6">
        <div>
          <h1 className="font-display text-4xl font-bold">
            {lang === 'ta' ? 'என் கற்றல் முன்னேற்றம் & சேமிப்பு' : 'Saved Library & Learning Progress'}
          </h1>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4] mt-1">
            {firebaseUser
              ? `Synced to cloud account: ${firebaseUser.email}`
              : 'Saved locally on this device. Optional Google sign-in syncs your progress across devices.'}
          </p>
        </div>
        {!firebaseUser && (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
          >
            Sign In with Google to Sync
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
          <h2 className="text-xl font-bold">Favourite Kurals ({favKurals.length})</h2>
          {favKurals.length === 0 ? (
            <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">Bookmark any Kural while studying to collect your favourites here.</p>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {favKurals.map((k) => (
                <li key={k.number} className="border-b border-[#C49A45]/15 pb-2 last:border-0">
                  <button type="button" onClick={() => navigate(`/kural/${k.number}`)} className="text-left hover:underline font-medium">
                    #{k.number} · {k.line1Ta}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
          <h2 className="text-xl font-bold">Saved Classes &amp; Articles ({favClasses.length + favArticles.length})</h2>
          {favClasses.length + favArticles.length === 0 ? (
            <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">No classes or articles saved yet.</p>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {favClasses.map((c) => (
                <li key={`c-${c.id}`}>
                  <button type="button" onClick={() => navigate(`/classes/${c.categorySlug}`)} className="text-left hover:underline font-medium">
                    Class: {lang === 'ta' ? c.titleTa : c.titleEn}
                  </button>
                </li>
              ))}
              {favArticles.map((a) => (
                <li key={`a-${a.id}`}>
                  <button type="button" onClick={() => navigate('/articles')} className="text-left hover:underline font-medium">
                    Article: {lang === 'ta' ? a.titleTa : a.titleEn}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
          <h2 className="text-xl font-bold">Recently Played Audio ({recentlyPlayed.length})</h2>
          {recentlyPlayed.map((t) => (
            <button
              key={`${t.itemType}-${t.id}`}
              type="button"
              onClick={() => playTrack(t)}
              className="w-full text-left flex items-center justify-between text-sm py-1.5 hover:text-[#762B35]"
            >
              <span>{lang === 'ta' ? t.titleTa : t.titleEn}</span>
              <Play className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
          <h2 className="text-xl font-bold">Continue Learning ({progress.length})</h2>
          {progress.length === 0 ? (
            <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">Start reading a Kural or playing a class to track your journey.</p>
          ) : (
            <ul className="space-y-2 text-xs font-mono-num">
              {progress.slice(0, 8).map((p, idx) => (
                <li key={idx} className="flex items-center justify-between py-1 border-b border-[#C49A45]/15">
                  <span className="uppercase">{p.itemType} #{p.itemId}</span>
                  <span>{p.progressPercent}% complete</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { lang, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast(lang === 'ta' ? 'உங்கள் செய்தி அனுப்பப்பட்டது!' : 'Message received!');
    } catch {
      showToast('Unable to submit message right now.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'தொடர்பு கொள்க' : 'Connect With Us'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'தொடர்பு (Contact Us)' : 'Contact Us'}
        </h1>
        <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
          Questions about Thirukkural studies, Swamiji’s Vedanta discourses, or contributing verified educational resources? Write to us below.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl border border-emerald-600/40 bg-[#FCF8EE] dark:bg-[#2A201C] p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
          <h2 className="text-xl font-bold">Thank You for Reaching Out</h2>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
            Your note has been recorded for our editorial and teaching desk.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Subject</label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#C49A45]/40 bg-[#F7F0DF] dark:bg-[#231B18]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
          >
            <Mail className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      )}
    </div>
  );
}
