import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import type { AudioTrack, BootstrapData, DbUser, Language, ThemeMode } from '../types.ts';

interface BookmarkItem {
  itemType: 'kural' | 'class' | 'article';
  itemId: number;
}

interface ProgressItem {
  itemType: string;
  itemId: number;
  progressPercent: number;
  lastPositionSeconds: number;
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  data: BootstrapData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  route: string;
  navigate: (path: string) => void;
  firebaseUser: User | null;
  dbUser: DbUser | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  bookmarks: BookmarkItem[];
  isBookmarked: (itemType: 'kural' | 'class' | 'article', itemId: number) => boolean;
  toggleBookmark: (itemType: 'kural' | 'class' | 'article', itemId: number) => Promise<void>;
  progress: ProgressItem[];
  recordProgress: (
    itemType: 'audio' | 'video' | 'kural' | 'class' | 'meditation',
    itemId: number,
    progressPercent: number,
    lastPositionSeconds?: number
  ) => Promise<void>;
  currentTrack: AudioTrack | null;
  playTrack: (track: AudioTrack) => void;
  closePlayer: () => void;
  recentlyPlayed: AudioTrack[];
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LOCAL_BOOKMARKS_KEY = 'tamil_wisdom_bookmarks_v1';
const LOCAL_RECENT_KEY = 'tamil_wisdom_recent_audio_v1';
const LOCAL_PROGRESS_KEY = 'tamil_wisdom_progress_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tamil_wisdom_lang');
      return saved === 'en' ? 'en' : 'ta';
    } catch {
      return 'ta';
    }
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('tamil_wisdom_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [progress, setProgress] = useState<ProgressItem[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<AudioTrack[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('tamil_wisdom_theme', theme);
    } catch {
      // ignore storage failure
    }
  }, [theme]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('tamil_wisdom_lang', next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ta' ? 'en' : 'ta');
  }, [lang, setLang]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const navigate = useCallback((path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = normalized;
    setRoute(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') || '/';
      setRoute(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) throw new Error('Unable to fetch learning library');
      const json: BootstrapData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to load learning resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const syncUserProfile = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setDbUser(profile.user);
        if (Array.isArray(profile.bookmarks) && profile.bookmarks.length > 0) {
          setBookmarks(
            profile.bookmarks.map((b: any) => ({
              itemType: b.itemType,
              itemId: b.itemId,
            }))
          );
        }
        if (Array.isArray(profile.progress) && profile.progress.length > 0) {
          setProgress(profile.progress);
        }
      }
    } catch (err) {
      console.warn('Could not sync profile:', err);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setDbUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [syncUserProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        await syncUserProfile(result.user);
        showToast(lang === 'ta' ? 'வரவேற்கிறோம்! உள்நுழைவு வெற்றிகரம்.' : 'Signed in successfully.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Sign-in cancelled or blocked.');
    }
  }, [lang, showToast, syncUserProfile]);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    setDbUser(null);
    showToast(lang === 'ta' ? 'வெளியேறினீர்கள்.' : 'Signed out.');
  }, [lang, showToast]);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }, []);

  const isBookmarked = useCallback(
    (itemType: 'kural' | 'class' | 'article', itemId: number) =>
      bookmarks.some((b) => b.itemType === itemType && b.itemId === itemId),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (itemType: 'kural' | 'class' | 'article', itemId: number) => {
      const exists = bookmarks.some((b) => b.itemType === itemType && b.itemId === itemId);
      const next = exists
        ? bookmarks.filter((b) => !(b.itemType === itemType && b.itemId === itemId))
        : [...bookmarks, { itemType, itemId }];
      setBookmarks(next);
      try {
        localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/bookmarks/toggle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ itemType, itemId }),
          });
        } catch {
          // ignore network failure
        }
      }
      showToast(
        exists
          ? lang === 'ta'
            ? 'புத்தகக்குறி நீக்கப்பட்டது'
            : 'Removed from saved library'
          : lang === 'ta'
            ? 'விருப்பப் பட்டியலில் சேமிக்கப்பட்டது'
            : 'Saved to your learning library'
      );
    },
    [bookmarks, firebaseUser, lang, showToast]
  );

  const recordProgress = useCallback(
    async (
      itemType: 'audio' | 'video' | 'kural' | 'class' | 'meditation',
      itemId: number,
      progressPercent: number,
      lastPositionSeconds = 0
    ) => {
      setProgress((prev) => {
        const filtered = prev.filter(
          (p) => !(p.itemType === itemType && p.itemId === itemId)
        );
        const updated = [
          { itemType, itemId, progressPercent, lastPositionSeconds },
          ...filtered,
        ].slice(0, 30);
        try {
          localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              itemType,
              itemId,
              progressPercent,
              lastPositionSeconds,
            }),
          });
        } catch {
          // ignore
        }
      }
    },
    [firebaseUser]
  );

  const playTrack = useCallback(
    (track: AudioTrack) => {
      setCurrentTrack(track);
      setRecentlyPlayed((prev) => {
        const next = [track, ...prev.filter((t) => !(t.id === track.id && t.itemType === track.itemType))].slice(0, 10);
        try {
          localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'play',
          resourceType: track.itemType,
          resourceId: track.id,
        }),
      }).catch(() => {});
    },
    []
  );

  const closePlayer = useCallback(() => {
    setCurrentTrack(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        theme,
        toggleTheme,
        data,
        loading,
        error,
        refreshData,
        route,
        navigate,
        firebaseUser,
        dbUser,
        authLoading,
        signInWithGoogle,
        signOut,
        getIdToken,
        bookmarks,
        isBookmarked,
        toggleBookmark,
        progress,
        recordProgress,
        currentTrack,
        playTrack,
        closePlayer,
        recentlyPlayed,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
