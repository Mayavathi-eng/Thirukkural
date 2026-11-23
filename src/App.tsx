/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Footer, Header } from './components/HeaderFooter.tsx';
import { UtilityBar } from './components/UtilityBar.tsx';
import { GlobalAudioBar } from './components/MediaPlayers.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { IndividualKuralPage, ThirukkuralLibraryPage } from './pages/ThirukkuralPages.tsx';
import { VedantaClassesPage } from './pages/VedantaClassesPage.tsx';
import {
  AudioLibraryPage,
  PptLibraryPage,
  StudyMaterialsPage,
  VideoLibraryPage,
} from './pages/MultimediaPages.tsx';
import { ActivitiesPage, MeditationPage, QuizCentrePage } from './pages/InteractivePages.tsx';
import {
  AboutPage,
  ArticlesPage,
  ContactPage,
  SavedProgressPage,
  SearchPage,
} from './pages/EditorialPages.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

function MainShell() {
  const { route, loading, error, refreshData, toast, currentTrack } = useApp();

  const renderPage = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center space-y-3">
          <p className="font-display text-2xl font-semibold text-[#762B35] dark:text-[#E6A946]">
            தமிழ் ஞானம் | TAMIL WISDOM
          </p>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
            Preparing Thirukkural &amp; Vedanta digital library...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold">Unable to Load Library</h2>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">{error}</p>
          <button
            type="button"
            onClick={refreshData}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (route === '/' || route === '') return <HomePage />;
    if (route === '/about') return <AboutPage />;
    if (route === '/thirukkural') return <ThirukkuralLibraryPage />;
    if (route === '/thirukkural/arathuppaal')
      return <ThirukkuralLibraryPage divisionFilter="Arathuppaal" />;
    if (route === '/thirukkural/porutpaal')
      return <ThirukkuralLibraryPage divisionFilter="Porutpaal" />;
    if (route === '/thirukkural/kaamathuppaal')
      return <ThirukkuralLibraryPage divisionFilter="Kaamathuppaal" />;
    if (route.startsWith('/kural/')) {
      const n = Number(route.replace('/kural/', ''));
      return <IndividualKuralPage kuralNumber={Number.isNaN(n) ? 1 : n} />;
    }
    if (route === '/classes') return <VedantaClassesPage />;
    if (route.startsWith('/classes/')) {
      const slug = route.replace('/classes/', '');
      return <VedantaClassesPage categorySlug={slug} />;
    }
    if (route === '/audio-library') return <AudioLibraryPage />;
    if (route === '/video-library') return <VideoLibraryPage />;
    if (route === '/ppt-library') return <PptLibraryPage />;
    if (route === '/study-materials') return <StudyMaterialsPage />;
    if (route === '/quiz-centre') return <QuizCentrePage />;
    if (route === '/articles') return <ArticlesPage />;
    if (route === '/activities') return <ActivitiesPage />;
    if (route === '/meditation') return <MeditationPage />;
    if (route === '/search') return <SearchPage />;
    if (route === '/saved') return <SavedProgressPage />;
    if (route === '/contact') return <ContactPage />;
    if (route === '/admin') return <AdminDashboard />;

    return <HomePage />;
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F7F0DF] text-[#493126] dark:bg-[#1A1412] dark:text-[#F4EBD7] ${
        currentTrack ? 'pb-20' : ''
      }`}
    >
      <Header />
      <UtilityBar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <GlobalAudioBar />

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 right-4 z-50 px-4 py-2.5 rounded-lg border border-[#C49A45]/40 bg-[#493126] text-[#FCF8EE] dark:bg-[#FCF8EE] dark:text-[#1A1412] text-xs font-medium shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
