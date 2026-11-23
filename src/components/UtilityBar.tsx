import React from 'react';
import { Bookmark, Globe, LogIn, LogOut, Moon, Shield, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function UtilityBar() {
  const {
    lang,
    toggleLang,
    theme,
    toggleTheme,
    firebaseUser,
    dbUser,
    signInWithGoogle,
    signOut,
    navigate,
    bookmarks,
  } = useApp();

  return (
    <div className="border-b border-[#C49A45]/20 bg-[#EFE4CC]/75 dark:bg-[#231B18] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta'
            ? '100% இலவசக் கற்றல் · கல்வி இலவசம் – ஞானம் அனைவருக்கும்'
            : '100% FREE LEARNING – KNOWLEDGE FOR EVERYONE · No Subscriptions or Fees'}
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/saved')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#C49A45]/30 hover:bg-[#FCF8EE] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#762B35] dark:text-[#E6A946]" />
            <span>
              {lang === 'ta' ? 'சேமித்தவை' : 'Saved'} (<span className="font-mono-num">{bookmarks.length}</span>)
            </span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            aria-label="Toggle Tamil or English language"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#C49A45]/30 hover:bg-[#FCF8EE] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#762B35] dark:text-[#E6A946]" />
            <span>{lang === 'ta' ? 'தமிழ் / EN' : 'EN / தமிழ்'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Light or Dark mode"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#C49A45]/30 hover:bg-[#FCF8EE] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#E6A946]" />}
            <span>{theme === 'light' ? (lang === 'ta' ? 'இருள்' : 'Dark') : (lang === 'ta' ? 'ஒளி' : 'Light')}</span>
          </button>

          {firebaseUser ? (
            <div className="flex items-center gap-2">
              {(dbUser?.role === 'admin' || dbUser?.role === 'editor') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#762B35] text-white hover:bg-[#5E2129] whitespace-nowrap shrink-0"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin CMS</span>
                </button>
              )}
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#C49A45]/30 hover:bg-[#FCF8EE] dark:hover:bg-[#2A201C] whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{firebaseUser.displayName || firebaseUser.email}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#762B35]/35 text-[#762B35] dark:text-[#E6A946] hover:bg-[#FCF8EE] dark:hover:bg-[#2A201C] transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'கூகுள் உள்நுழைவு' : 'Sign In (Optional)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
