import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, Pause, Play, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SpeakTamilButton } from '../components/MediaPlayers.tsx';
import type { Quiz, QuizQuestion } from '../types.ts';

interface LocalAttempt {
  quizTitle: string;
  score: number;
  total: number;
  mode: string;
  date: string;
}

export function QuizCentrePage() {
  const { data, lang, getIdToken, showToast } = useApp();
  const [catFilter, setCatFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState<'practice' | 'daily'>('practice');
  const [history, setHistory] = useState<LocalAttempt[]>(() => {
    try {
      const raw = localStorage.getItem('tamil_wisdom_quiz_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  if (!data) return null;

  const categories = ['all', 'Thirukkural', 'Bhagavad Gita', 'Upanishads', 'Vedanta', 'Tamil Literature', 'Spiritual Knowledge'];
  const filteredQuizzes = data.quizzes.filter(
    (q) =>
      (catFilter === 'all' || q.category === catFilter) &&
      (diffFilter === 'all' || q.difficulty === diffFilter)
  );

  const startQuiz = async (quiz: Quiz, selectedMode: 'practice' | 'daily') => {
    setLoadingQuiz(true);
    setMode(selectedMode);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`);
      const json = await res.json();
      setActiveQuiz(json.quiz);
      setQuestions(json.questions || []);
      setQIdx(0);
      setSelectedOption(null);
      setVerified(false);
      setScore(0);
      setFinished(false);
    } catch {
      showToast('Failed to load quiz questions.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleVerify = () => {
    if (!selectedOption || verified) return;
    const currentQ = questions[qIdx];
    if (selectedOption === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
    setVerified(true);
  };

  const handleNext = async () => {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setSelectedOption(null);
      setVerified(false);
    } else {
      setFinished(true);
      if (activeQuiz) {
        const entry: LocalAttempt = {
          quizTitle: lang === 'ta' ? activeQuiz.titleTa : activeQuiz.titleEn,
          score,
          total: questions.length,
          mode,
          date: new Date().toLocaleDateString(),
        };
        const updated = [entry, ...history].slice(0, 12);
        setHistory(updated);
        try {
          localStorage.setItem('tamil_wisdom_quiz_history', JSON.stringify(updated));
        } catch {
          // ignore
        }

        const token = await getIdToken();
        fetch(`/api/quizzes/${activeQuiz.id}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ score, totalQuestions: questions.length, mode }),
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'அறிவுத் திறனாய்வு மையம்' : 'Interactive Knowledge Assessment'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'வினாடி-வினா மையம் (Quiz Centre)' : 'Quiz & Knowledge Test Centre'}
        </h1>
      </div>

      {!activeQuiz ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                    catFilter === c ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
                  }`}
                >
                  {c === 'all' ? (lang === 'ta' ? 'அனைத்தும்' : 'All Categories') : c}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiffFilter(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    diffFilter === d ? 'bg-[#C49A45] text-[#1A1412]' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
                  }`}
                >
                  {d === 'all' ? (lang === 'ta' ? 'அனைத்து நிலைகளும்' : 'All Levels') : d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                      {q.category} · {q.difficulty} {q.isDaily ? '· Daily Quiz' : ''}
                    </p>
                    <h2 className="text-xl font-bold">
                      {lang === 'ta' ? q.titleTa : q.titleEn}
                    </h2>
                    <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
                      {lang === 'ta' ? q.descriptionTa : q.descriptionEn}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={loadingQuiz}
                      onClick={() => startQuiz(q, q.isDaily ? 'daily' : 'practice')}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                    >
                      {lang === 'ta' ? 'பயிற்சியைத் தொடங்கு' : 'Start Practice Quiz'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-[#C49A45]/30 bg-[#EFE4CC]/60 dark:bg-[#231B18] p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#762B35] dark:text-[#E6A946]" />
                <span>{lang === 'ta' ? 'வினாடி-வினா வரலாறு' : 'Quiz History'}</span>
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                  No completed attempts yet. Complete any quiz to see your score history.
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {history.map((h, i) => (
                    <li key={i} className="pb-2.5 border-b border-[#C49A45]/20 last:border-0 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{h.quizTitle}</p>
                        <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">{h.date} · {h.mode}</p>
                      </div>
                      <span className="font-mono-num font-semibold text-[#762B35] dark:text-[#E6A946] shrink-0">
                        {h.score}/{h.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : finished ? (
        <div className="max-w-2xl mx-auto rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-8 text-center space-y-6">
          <h2 className="font-display text-3xl font-bold">
            {lang === 'ta' ? 'வினாடி-வினா நிறைவு!' : 'Quiz Completed'}
          </h2>
          <p className="font-mono-num text-5xl font-bold text-[#762B35] dark:text-[#E6A946]">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
            {score === questions.length
              ? 'Excellent mastery! Keep reflecting deeply on these teachings.'
              : 'Wonderful effort! Review the explanations and practice anytime.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => startQuiz(activeQuiz, mode)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
            >
              Retry Quiz
            </button>
            <button
              type="button"
              onClick={() => setActiveQuiz(null)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#C49A45]/40"
            >
              All Quizzes
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#725648] dark:text-[#CBBBA4] border-b border-[#C49A45]/20 pb-3">
            <span>
              {lang === 'ta' ? activeQuiz.titleTa : activeQuiz.titleEn} ·{' '}
              <span className="uppercase">{questions[qIdx]?.questionType.replace('_', ' ')}</span>
            </span>
            <span className="font-mono-num">
              Question {qIdx + 1} / {questions.length} · Score {score}
            </span>
          </div>

          {questions[qIdx] && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold leading-snug">
                {lang === 'ta' ? questions[qIdx].promptTa : questions[qIdx].promptEn}
              </h2>

              <div className="space-y-2.5">
                {questions[qIdx].optionsJson.map((opt) => {
                  const isCorrect = opt === questions[qIdx].correctAnswer;
                  const isSelected = selectedOption === opt;
                  let style =
                    'border-[#C49A45]/35 bg-[#F7F0DF]/60 dark:bg-[#231B18] hover:border-[#762B35]';
                  if (verified) {
                    if (isCorrect) {
                      style = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-rose-600 bg-rose-50 dark:bg-rose-950/40';
                    }
                  } else if (isSelected) {
                    style = 'border-[#762B35] bg-[#EFE4CC] dark:bg-[#352924]';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={verified}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm font-medium flex items-center justify-between gap-3 transition-colors ${style}`}
                    >
                      <span>{opt}</span>
                      {verified && isCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      )}
                      {verified && isSelected && !isCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {verified && (
                <div className="p-4 rounded-lg bg-[#EFE4CC]/75 dark:bg-[#231B18] border border-[#C49A45]/30 text-sm space-y-1">
                  <p className="font-semibold text-[#762B35] dark:text-[#E6A946]">
                    {lang === 'ta' ? 'விளக்கம்' : 'Explanation'}
                  </p>
                  <p>{lang === 'ta' ? questions[qIdx].explanationTa : questions[qIdx].explanationEn}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveQuiz(null)}
                  className="text-xs font-medium text-[#725648] dark:text-[#CBBBA4] hover:underline"
                >
                  Exit Quiz
                </button>
                {!verified ? (
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={handleVerify}
                    className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white disabled:opacity-40"
                  >
                    {lang === 'ta' ? 'விடையைச் சரிபார்' : 'Check Answer'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white"
                  >
                    {qIdx + 1 < questions.length
                      ? lang === 'ta'
                        ? 'அடுத்த கேள்வி →'
                        : 'Next Question →'
                      : lang === 'ta'
                        ? 'மதிப்பெண் காண்க'
                        : 'Finish & See Score'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActivitiesPage() {
  const { data, lang, showToast } = useApp();
  const [completionAnswers, setCompletionAnswers] = useState<Record<number, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Record<string, boolean>>({});
  const [reflectionText, setReflectionText] = useState('');
  const [savedReflections, setSavedReflections] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('tamil_wisdom_reflections');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Memory Card Game state
  const memoryAct = data?.activities.find((a) => a.type === 'memory');
  const cards = useMemo(() => {
    if (!memoryAct?.dataJson?.pairs) return [];
    const list: Array<{ uid: string; pairId: string; text: string }> = [];
    for (const p of memoryAct.dataJson.pairs) {
      list.push({ uid: `${p.id}-a`, pairId: p.id, text: p.a });
      list.push({ uid: `${p.id}-b`, pairId: p.id, text: p.b });
    }
    return list.sort((x, y) => x.uid.localeCompare(y.uid));
  }, [memoryAct]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [memorySolved, setMemorySolved] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  if (!data) return null;

  const kuralComp = data.activities.find((a) => a.type === 'kural_completion');
  const matchMeaning = data.activities.find((a) => a.type === 'match_meaning');
  const vedantaMatch = data.activities.find((a) => a.type === 'vedanta_match');
  const reflectionAct = data.activities.find((a) => a.type === 'reflection');

  const flipCard = (uid: string, pairId: string) => {
    if (flipped.includes(uid) || memorySolved.includes(pairId) || flipped.length === 2) return;
    const next = [...flipped, uid];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const c1 = cards.find((c) => c.uid === next[0]);
      const c2 = cards.find((c) => c.uid === next[1]);
      if (c1 && c2 && c1.pairId === c2.pairId) {
        setMemorySolved((s) => [...s, c1.pairId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    const updated = [`${new Date().toLocaleDateString()}: ${reflectionText.trim()}`, ...savedReflections].slice(0, 10);
    setSavedReflections(updated);
    setReflectionText('');
    try {
      localStorage.setItem('tamil_wisdom_reflections', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(lang === 'ta' ? 'சிந்தனைப் பதிவு சேமிக்கப்பட்டது!' : 'Reflection saved!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="space-y-2 border-b border-[#C49A45]/25 pb-6">
        <p className="text-xs tracking-wider uppercase text-[#762B35] dark:text-[#E6A946]">
          {lang === 'ta' ? 'செயல்வழிக் கற்றல்' : 'Interactive Learning Exercises'}
        </p>
        <h1 className="font-display text-4xl font-bold">
          {lang === 'ta' ? 'கற்றல் செயல்பாடுகள் (Activities)' : 'Learning Activities'}
        </h1>
      </div>

      {/* 1. Kural Completion */}
      {kuralComp && (
        <section className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-2xl font-bold">{lang === 'ta' ? kuralComp.titleTa : kuralComp.titleEn}</h2>
            <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
              {lang === 'ta' ? kuralComp.promptTa : kuralComp.promptEn}
            </p>
          </div>
          <div className="space-y-4">
            {(kuralComp.dataJson.items || []).map((item: any, idx: number) => {
              const chosen = completionAnswers[idx];
              const isCorrect = chosen === item.answer;
              return (
                <div key={idx} className="p-4 rounded-lg bg-[#EFE4CC]/60 dark:bg-[#231B18] space-y-3">
                  <p className="font-tamil-serif text-lg font-medium">
                    <span className="font-mono-num text-xs mr-2 text-[#762B35] dark:text-[#E6A946]">
                      #{item.kuralNumber}
                    </span>
                    {item.before}{' '}
                    <span className="px-2 py-0.5 rounded bg-[#FCF8EE] dark:bg-[#2A201C] border border-[#C49A45]/40 font-bold">
                      {chosen || item.blankLabel}
                    </span>{' '}
                    {item.after}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.options.map((opt: string) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCompletionAnswers((prev) => ({ ...prev, [idx]: opt }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                          chosen === opt
                            ? opt === item.answer
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-rose-700 text-white border-rose-700'
                            : 'border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                    {chosen && (
                      <span className="text-xs font-medium ml-2">
                        {isCorrect ? `✓ Correct · ${item.meaningEn}` : '✗ Try again'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2 & 3. Match Kural & Vedanta Matching */}
      {[matchMeaning, vedantaMatch].filter(Boolean).map((act: any) => {
        const pairs = act.dataJson?.pairs || [];
        return (
          <section
            key={act.id}
            className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold">{lang === 'ta' ? act.titleTa : act.titleEn}</h2>
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
                Click an item on the left, then click its matching explanation on the right.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {pairs.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={matchedIds[p.id]}
                    onClick={() => setSelectedLeft(p.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm font-medium transition-colors ${
                      matchedIds[p.id]
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 opacity-75'
                        : selectedLeft === p.id
                          ? 'border-[#762B35] bg-[#EFE4CC] dark:bg-[#352924]'
                          : 'border-[#C49A45]/35 hover:border-[#762B35]'
                    }`}
                  >
                    {p.left}
                  </button>
                ))}
              </div>
              <div className="space-y-2.5">
                {[...pairs].reverse().map((p: any) => (
                  <button
                    key={`${p.id}-r`}
                    type="button"
                    disabled={matchedIds[p.id]}
                    onClick={() => {
                      if (!selectedLeft) return;
                      if (selectedLeft === p.id) {
                        setMatchedIds((prev) => ({ ...prev, [p.id]: true }));
                        setSelectedLeft(null);
                        showToast('Matched!');
                      } else {
                        setSelectedLeft(null);
                        showToast('Not a match — try another pair.');
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors ${
                      matchedIds[p.id]
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 opacity-75'
                        : 'border-[#C49A45]/35 hover:border-[#762B35]'
                    }`}
                  >
                    {p.right}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* 4. Memory Card Game */}
      {memoryAct && (
        <section className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{lang === 'ta' ? memoryAct.titleTa : memoryAct.titleEn}</h2>
              <p className="text-sm text-[#725648] dark:text-[#CBBBA4]">
                {lang === 'ta' ? memoryAct.promptTa : memoryAct.promptEn}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-num">
              <span>Moves: {moves}</span>
              <span>Matched: {memorySolved.length} / {cards.length / 2}</span>
              <button
                type="button"
                onClick={() => {
                  setFlipped([]);
                  setMemorySolved([]);
                  setMoves(0);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[#C49A45]/40"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cards.map((card) => {
              const isRevealed = flipped.includes(card.uid) || memorySolved.includes(card.pairId);
              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => flipCard(card.uid, card.pairId)}
                  className={`min-h-[84px] p-3 rounded-lg border text-sm font-medium transition-all ${
                    memorySolved.includes(card.pairId)
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                      : isRevealed
                        ? 'border-[#762B35] bg-[#EFE4CC] dark:bg-[#352924]'
                        : 'border-[#C49A45]/35 bg-[#762B35] text-[#FCF8EE] hover:bg-[#5E2129]'
                  }`}
                >
                  {isRevealed ? card.text : 'தமிழ் ஞானம்'}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Daily Reflection */}
      {reflectionAct && (
        <section className="rounded-xl border border-[#C49A45]/35 bg-[#EFE4CC]/60 dark:bg-[#231B18] p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold">{lang === 'ta' ? reflectionAct.titleTa : reflectionAct.titleEn}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {(reflectionAct.dataJson.prompts || []).map((p: any) => (
              <div key={p.id} className="p-4 rounded-lg bg-[#FCF8EE] dark:bg-[#2A201C] border border-[#C49A45]/25">
                {lang === 'ta' ? p.ta : p.en}
              </div>
            ))}
          </div>
          <form onSubmit={handleSaveReflection} className="space-y-3">
            <textarea
              rows={3}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder={lang === 'ta' ? 'உங்கள் தினசரி ஆன்மீகச் சிந்தனையை இங்கே எழுதுங்கள்...' : 'Write your quiet reflection here...'}
              className="w-full p-3 text-sm rounded-lg border border-[#C49A45]/40 bg-[#FCF8EE] dark:bg-[#2A201C]"
            />
            <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white">
              {lang === 'ta' ? 'சிந்தனையைச் சேமி' : 'Save Reflection'}
            </button>
          </form>
          {savedReflections.length > 0 && (
            <ul className="space-y-2 text-xs text-[#725648] dark:text-[#CBBBA4]">
              {savedReflections.map((r, i) => (
                <li key={i} className="p-2.5 rounded bg-[#FCF8EE]/70 dark:bg-[#2A201C]">{r}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export function MeditationPage() {
  const { data, lang, playTrack } = useApp();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);

  const active = data?.meditations[selectedIdx] || data?.meditations[0] || null;
  const [inhaleSec, holdSec, exhaleSec] = useMemo(() => {
    const parts = (active?.breathingPattern || '4-4-6').split('-').map((n) => Number(n) || 0);
    return [parts[0] || 4, parts[1] ?? 4, parts[2] || 6];
  }, [active]);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        if (phase === 'Inhale') {
          if (holdSec > 0) {
            setPhase('Hold');
            return holdSec;
          }
          setPhase('Exhale');
          return exhaleSec;
        }
        if (phase === 'Hold') {
          setPhase('Exhale');
          return exhaleSec;
        }
        setPhase('Inhale');
        return inhaleSec;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, phase, inhaleSec, holdSec, exhaleSec]);

  if (!data || !active) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="relative rounded-xl overflow-hidden border border-[#C49A45]/35 bg-[#1A1412] text-[#FCF8EE] p-8 sm:p-12">
        <img
          src="/src/assets/images/meditation_sanctuary_1795408079754.jpg"
          alt="Meditation Sanctuary"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative max-w-2xl space-y-3">
          <p className="text-xs tracking-widest uppercase text-[#E6A946]">
            {lang === 'ta' ? 'வழிகாட்டப்பட்ட தியானம் & பிராணாயாமம்' : 'Guided Meditation & Breathing'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            {lang === 'ta' ? 'த்யானம் — உள்ளமைதிப் பயிற்சி' : 'Guided Meditation Sanctuary'}
          </h1>
          <p className="text-sm text-[#E5D7BF] leading-relaxed">
            {lang === 'ta'
              ? 'மூச்சுப் பயிற்சி, மனத் தளர்வு மற்றும் சாக்ஷி தியான அமர்வுகள் அனைத்தும் இலவசம்.'
              : 'Practice calm diaphragmatic breathing, body relaxation, and witness awareness with Swamiji’s audio guidance.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Breathing Pacer */}
        <div className="lg:col-span-5 rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 sm:p-8 flex flex-col items-center justify-between space-y-6 text-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">
              {lang === 'ta' ? 'மூச்சுப் பயிற்சி வழிகாட்டி' : 'Breathing Pacer'}
            </h2>
            <p className="text-xs font-mono-num text-[#725648] dark:text-[#CBBBA4]">
              Pattern: {inhaleSec}s Inhale · {holdSec}s Hold · {exhaleSec}s Exhale
            </p>
          </div>

          <div
            className={`w-44 h-44 rounded-full border-2 border-[#C49A45] flex flex-col items-center justify-center transition-transform duration-1000 ${
              breathingActive && phase === 'Inhale'
                ? 'scale-110 bg-[#EFE4CC] dark:bg-[#352924]'
                : breathingActive && phase === 'Hold'
                  ? 'scale-110 bg-[#762B35]/15'
                  : 'scale-95 bg-[#F7F0DF] dark:bg-[#231B18]'
            }`}
          >
            <span className="text-xs uppercase tracking-widest text-[#762B35] dark:text-[#E6A946]">
              {phase}
            </span>
            <span className="font-mono-num text-4xl font-bold mt-1">{secondsLeft}s</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!breathingActive) {
                setPhase('Inhale');
                setSecondsLeft(inhaleSec);
              }
              setBreathingActive(!breathingActive);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
          >
            {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{breathingActive ? (lang === 'ta' ? 'நிறுத்து' : 'Pause Pacer') : (lang === 'ta' ? 'மூச்சுப் பயிற்சி தொடங்கு' : 'Start Breathing')}</span>
          </button>
        </div>

        {/* Sessions & Instructions */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap gap-2">
            {data.meditations.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg ${
                  idx === selectedIdx ? 'bg-[#762B35] text-white' : 'bg-[#EFE4CC] dark:bg-[#231B18]'
                }`}
              >
                {lang === 'ta' ? m.titleTa : m.titleEn}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#C49A45]/35 bg-[#FCF8EE] dark:bg-[#2A201C] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#725648] dark:text-[#CBBBA4]">
                  {active.category} · <span className="font-mono-num">{active.durationMinutes} min</span>
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {lang === 'ta' ? active.titleTa : active.titleEn}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <SpeakTamilButton text={active.instructionsTa} label={lang === 'ta' ? 'தமிழ் வழிகாட்டி' : 'Voice Guide'} />
                <button
                  type="button"
                  onClick={() =>
                    playTrack({
                      id: 1000 + active.id,
                      itemType: 'meditation',
                      titleTa: active.titleTa,
                      titleEn: active.titleEn,
                      subtitle: `${active.category} · ${active.durationMinutes} min`,
                      audioUrl: active.audioUrl || `/api/media/audio/${active.slug}`,
                      allowDownload: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#762B35] text-white hover:bg-[#5E2129]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'தியான ஒலி இயக்கு' : 'Play Guided Audio'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#EFE4CC]/60 dark:bg-[#231B18] whitespace-pre-line text-sm leading-relaxed">
              {lang === 'ta' ? active.instructionsTa : active.instructionsEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
