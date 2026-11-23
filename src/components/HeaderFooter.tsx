import React, { useState } from 'react';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function Header() {
  const { lang, navigate, route } = useApp();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => {
    setOpenMenu(null);
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#C49A45]/25 bg-[#F7F0DF]/95 backdrop-blur-md dark:bg-[#1A1412]/95 dark:border-[#C49A45]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Wordmark */}
        <button
          type="button"
          onClick={() => go('/')}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#762B35] dark:text-[#E6A946] whitespace-nowrap shrink-0 text-left"
        >
          தமிழ் ஞானம்
        </button>

        {/* Zone 2: Concise single-line navigation links with clean dropdowns */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#493126] dark:text-[#F4EBD7]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'kural' ? null : 'kural')}
              className={`inline-flex items-center gap-1 py-1 hover:text-[#762B35] dark:hover:text-[#E6A946] transition-colors whitespace-nowrap shrink-0 ${
                route.startsWith('/thirukkural') || route.startsWith('/kural')
                  ? 'text-[#762B35] dark:text-[#E6A946] underline underline-offset-4'
                  : ''
              }`}
            >
              <span>{lang === 'ta' ? 'திருக்குறள்' : 'Thirukkural'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openMenu === 'kural' && (
              <div
                onMouseLeave={() => setOpenMenu(null)}
                className="absolute left-0 mt-2 w-60 rounded-lg border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] shadow-lg py-2 z-50"
              >
                <button type="button" onClick={() => go('/thirukkural')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'திருக்குறள் நூலகம் (1330)' : 'All 1,330 Kurals & 133 Chapters'}
                </button>
                <button type="button" onClick={() => go('/thirukkural/arathuppaal')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'அறத்துப்பால் (380)' : 'Arathuppaal (Virtue · 380)'}
                </button>
                <button type="button" onClick={() => go('/thirukkural/porutpaal')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'பொருட்பால் (700)' : 'Porutpaal (Wealth & Polity · 700)'}
                </button>
                <button type="button" onClick={() => go('/thirukkural/kaamathuppaal')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'காமத்துப்பால் (250)' : 'Kaamathuppaal (Love · 250)'}
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'vedanta' ? null : 'vedanta')}
              className={`inline-flex items-center gap-1 py-1 hover:text-[#762B35] dark:hover:text-[#E6A946] transition-colors whitespace-nowrap shrink-0 ${
                route.startsWith('/classes')
                  ? 'text-[#762B35] dark:text-[#E6A946] underline underline-offset-4'
                  : ''
              }`}
            >
              <span>{lang === 'ta' ? 'வேதாந்தம்' : 'Vedanta'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openMenu === 'vedanta' && (
              <div
                onMouseLeave={() => setOpenMenu(null)}
                className="absolute left-0 mt-2 w-64 rounded-lg border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] shadow-lg py-2 z-50"
              >
                <button type="button" onClick={() => go('/classes')} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'சுவாமிஜியின் வகுப்புகள் (அனைத்தும்)' : "Swamiji's Classes (All 7)"}
                </button>
                <div className="my-1 border-t border-[#C49A45]/20" />
                <button type="button" onClick={() => go('/classes/introduction')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'அறிமுகம்' : 'Introduction'}
                </button>
                <button type="button" onClick={() => go('/classes/bhagavad-gita')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'பகவத்கீதை' : 'Bhagavad Gita'}
                </button>
                <button type="button" onClick={() => go('/classes/upanishads')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'உபநிஷத்துக்கள்' : 'Upanishads'}
                </button>
                <button type="button" onClick={() => go('/classes/vedantic-texts')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'வேதாந்த நூல்கள்' : 'Vedantic Texts'}
                </button>
                <button type="button" onClick={() => go('/classes/brahma-sutram')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'ப்ரம்ம சூத்ரம்' : 'Brahma Sutram'}
                </button>
                <button type="button" onClick={() => go('/classes/general-talks')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'வேதாந்த சொற்பொழிவுகள்' : 'General Talks'}
                </button>
                <button type="button" onClick={() => go('/classes/guided-meditation')} className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'தியான வகுப்புகள்' : 'Guided Meditation'}
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'media' ? null : 'media')}
              className={`inline-flex items-center gap-1 py-1 hover:text-[#762B35] dark:hover:text-[#E6A946] transition-colors whitespace-nowrap shrink-0 ${
                ['/audio-library', '/video-library', '/ppt-library', '/study-materials'].includes(route)
                  ? 'text-[#762B35] dark:text-[#E6A946] underline underline-offset-4'
                  : ''
              }`}
            >
              <span>{lang === 'ta' ? 'நூலகம்' : 'Library'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openMenu === 'media' && (
              <div
                onMouseLeave={() => setOpenMenu(null)}
                className="absolute left-0 mt-2 w-56 rounded-lg border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] shadow-lg py-2 z-50"
              >
                <button type="button" onClick={() => go('/audio-library')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'ஒலி நூலகம் (Audio)' : 'Audio Library'}
                </button>
                <button type="button" onClick={() => go('/video-library')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'காணொளி நூலகம் (Video)' : 'Video Library'}
                </button>
                <button type="button" onClick={() => go('/ppt-library')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'PPT விளக்கக் காட்சிகள்' : 'PPT Library'}
                </button>
                <button type="button" onClick={() => go('/study-materials')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'படிப்புக் குறிப்புகள் (PDF)' : 'Study Materials'}
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'practice' ? null : 'practice')}
              className={`inline-flex items-center gap-1 py-1 hover:text-[#762B35] dark:hover:text-[#E6A946] transition-colors whitespace-nowrap shrink-0 ${
                ['/quiz-centre', '/activities', '/meditation', '/articles'].includes(route)
                  ? 'text-[#762B35] dark:text-[#E6A946] underline underline-offset-4'
                  : ''
              }`}
            >
              <span>{lang === 'ta' ? 'பயிற்சி' : 'Practice'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openMenu === 'practice' && (
              <div
                onMouseLeave={() => setOpenMenu(null)}
                className="absolute left-0 mt-2 w-56 rounded-lg border border-[#C49A45]/30 bg-[#FCF8EE] dark:bg-[#2A201C] shadow-lg py-2 z-50"
              >
                <button type="button" onClick={() => go('/quiz-centre')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'வினாடி-வினா மையம்' : 'Quiz Centre'}
                </button>
                <button type="button" onClick={() => go('/activities')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'கற்றல் செயல்பாடுகள்' : 'Learning Activities'}
                </button>
                <button type="button" onClick={() => go('/meditation')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'வழிகாட்டப்பட்ட தியானம்' : 'Guided Meditation'}
                </button>
                <button type="button" onClick={() => go('/articles')} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE4CC] dark:hover:bg-[#352924]">
                  {lang === 'ta' ? 'கட்டுரைகள்' : 'Articles'}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => go('/about')}
            className={`py-1 hover:text-[#762B35] dark:hover:text-[#E6A946] transition-colors whitespace-nowrap shrink-0 ${
              route === '/about' ? 'text-[#762B35] dark:text-[#E6A946] underline underline-offset-4' : ''
            }`}
          >
            {lang === 'ta' ? 'எம்மைப் பற்றி' : 'About Us'}
          </button>
        </nav>

        {/* Zone 3: Primary Action (Smart Search) + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => go('/search')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#762B35] text-[#FCF8EE] hover:bg-[#5E2129] transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'தேடல்' : 'Search'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-md border border-[#C49A45]/30"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#C49A45]/25 bg-[#FCF8EE] dark:bg-[#231B18] px-4 py-4 max-h-[75vh] overflow-y-auto grid grid-cols-2 gap-2 text-sm">
          <button type="button" onClick={() => go('/')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Home</button>
          <button type="button" onClick={() => go('/thirukkural')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Thirukkural</button>
          <button type="button" onClick={() => go('/classes')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Swamiji's Classes</button>
          <button type="button" onClick={() => go('/audio-library')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Audio Library</button>
          <button type="button" onClick={() => go('/video-library')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Video Library</button>
          <button type="button" onClick={() => go('/ppt-library')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">PPT Library</button>
          <button type="button" onClick={() => go('/study-materials')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Study Materials</button>
          <button type="button" onClick={() => go('/quiz-centre')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Quiz Centre</button>
          <button type="button" onClick={() => go('/articles')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Articles</button>
          <button type="button" onClick={() => go('/activities')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Activities</button>
          <button type="button" onClick={() => go('/meditation')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Meditation</button>
          <button type="button" onClick={() => go('/about')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">About Us</button>
          <button type="button" onClick={() => go('/saved')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">My Progress</button>
          <button type="button" onClick={() => go('/contact')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Contact Us</button>
          <button type="button" onClick={() => go('/admin')} className="text-left px-3 py-2 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">Admin CMS</button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { lang, navigate } = useApp();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer className="border-t border-[#C49A45]/30 bg-[#EFE4CC] dark:bg-[#231B18] text-[#493126] dark:text-[#F4EBD7] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-display text-2xl font-bold text-[#762B35] dark:text-[#E6A946]">
              தமிழ் ஞானம் | TAMIL WISDOM
            </h3>
            <p className="text-sm text-[#725648] dark:text-[#CBBBA4] leading-relaxed">
              {lang === 'ta'
                ? 'திருக்குறளும் வேதாந்தமும் அனைவருக்கும் இலவசம். அறிவைப் பகிர்வோம் – ஞானத்தை வளர்ப்போம்.'
                : 'Ancient Wisdom. Timeless Knowledge. Free Learning for Everyone.'}
            </p>
            <p className="text-xs font-tamil-serif text-[#762B35] dark:text-[#D4AA56]">
              கேள் • கல் • சிந்தி • உணர் • வாழ்
            </p>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="font-semibold text-[#762B35] dark:text-[#E6A946]">
              {lang === 'ta' ? 'நூலகங்கள்' : 'Sacred Libraries'}
            </h4>
            <ul className="space-y-1.5 text-[#725648] dark:text-[#CBBBA4]">
              <li><button type="button" onClick={() => navigate('/thirukkural')} className="hover:underline">Thirukkural Library (1,330)</button></li>
              <li><button type="button" onClick={() => navigate('/thirukkural/arathuppaal')} className="hover:underline">Arathuppaal · அறத்துப்பால்</button></li>
              <li><button type="button" onClick={() => navigate('/thirukkural/porutpaal')} className="hover:underline">Porutpaal · பொருட்பால்</button></li>
              <li><button type="button" onClick={() => navigate('/thirukkural/kaamathuppaal')} className="hover:underline">Kaamathuppaal · காமத்துப்பால்</button></li>
              <li><button type="button" onClick={() => navigate('/classes')} className="hover:underline">Swamiji's Vedanta Classes</button></li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="font-semibold text-[#762B35] dark:text-[#E6A946]">
              {lang === 'ta' ? 'கற்றல் வளங்கள்' : 'Learning Resources'}
            </h4>
            <ul className="space-y-1.5 text-[#725648] dark:text-[#CBBBA4]">
              <li><button type="button" onClick={() => navigate('/audio-library')} className="hover:underline">Audio &amp; Video Library</button></li>
              <li><button type="button" onClick={() => navigate('/ppt-library')} className="hover:underline">PPT Presentations</button></li>
              <li><button type="button" onClick={() => navigate('/study-materials')} className="hover:underline">Free PDF Study Materials</button></li>
              <li><button type="button" onClick={() => navigate('/quiz-centre')} className="hover:underline">Quiz Centre &amp; Activities</button></li>
              <li><button type="button" onClick={() => navigate('/articles')} className="hover:underline">Spiritual Articles</button></li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="font-semibold text-[#762B35] dark:text-[#E6A946]">
              {lang === 'ta' ? 'தகவல் & நிர்வாகம்' : 'Platform & Info'}
            </h4>
            <ul className="space-y-1.5 text-[#725648] dark:text-[#CBBBA4]">
              <li><button type="button" onClick={() => navigate('/about')} className="hover:underline">About Thiruvalluvar &amp; Swamiji</button></li>
              <li><button type="button" onClick={() => navigate('/meditation')} className="hover:underline">Guided Meditation</button></li>
              <li><button type="button" onClick={() => navigate('/saved')} className="hover:underline">Saved &amp; Progress</button></li>
              <li><button type="button" onClick={() => navigate('/contact')} className="hover:underline">Contact Us</button></li>
              <li><button type="button" onClick={() => setPrivacyOpen(true)} className="hover:underline">Privacy Policy</button></li>
              <li><button type="button" onClick={() => navigate('/admin')} className="hover:underline">Admin Dashboard</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#C49A45]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#725648] dark:text-[#CBBBA4]">
          <p>
            © {new Date().getFullYear()} தமிழ் ஞானம் | TAMIL WISDOM · 100% Free Open Educational Sanctuary.
          </p>
          <p>Learn Freely. Think Deeply. Live Wisely.</p>
        </div>
      </div>

      {privacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-xl border border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold">Privacy Policy &amp; Free Learning Charter</h4>
              <button type="button" onClick={() => setPrivacyOpen(false)} className="p-1.5 rounded hover:bg-[#EFE4CC] dark:hover:bg-[#332722]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[#725648] dark:text-[#CBBBA4]">
              All Thirukkural couplets, Swamiji’s Vedanta discourses, audio lectures, videos, slides, PDFs, quizzes, and meditation sessions on Tamil Wisdom are 100% free and open without subscriptions or paywalls. Optional Google sign-in is used solely to synchronize your personal bookmarks, quiz history, and listening progress across devices.
            </p>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[#762B35] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
