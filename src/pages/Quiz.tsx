import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SealButton from '@/components/SealButton';
import { QUIZ } from '@/data/quiz';
import { DIMENSIONS, DIMENSION_LABELS, DIMENSION_POEMS, computeProfile } from '@/engine/engine';
import { useFateStore } from '@/store/fate';

export default function Quiz() {
  const navigate = useNavigate();
  const setProfile = useFateStore((s) => s.setProfile);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const question = QUIZ[index];
  const progress = ((index + (done ? 1 : 0)) / QUIZ.length) * 100;

  const profile = useMemo(
    () => (answers.length === QUIZ.length ? computeProfile(answers) : null),
    [answers],
  );

  function choose(optIdx: number) {
    if (selected !== null) return;
    setSelected(optIdx);
    const nextAnswers = [...answers, optIdx];
    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelected(null);
      if (index + 1 >= QUIZ.length) {
        const p = computeProfile(nextAnswers);
        setProfile(p);
        setDone(true);
      } else {
        setIndex(index + 1);
      }
    }, 380);
  }

  /* ── 气质结算 ─────────────────────────────────────────── */
  if (done && profile) {
    return (
      <div className="paper-bg min-h-screen">
        <main className="mx-auto w-full max-w-[480px] px-6 pb-16 pt-14">
          <p className="text-center text-xs tracking-[0.5em] text-inkSoft">气质已成</p>
          <h2 className="mt-4 text-center font-display text-4xl text-ink">你的六维文物气质</h2>

          <div className="stagger mt-10 space-y-5">
            {DIMENSIONS.map((dim) => {
              const max = Math.max(...DIMENSIONS.map((d) => profile.dims[d]), 1);
              const width = (profile.dims[dim] / max) * 100;
              return (
                <div key={dim}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-xl text-ink">{DIMENSION_LABELS[dim]}</span>
                    <span className="text-xs text-inkSoft">{DIMENSION_POEMS[dim]}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cinnabar to-tungsten"
                      style={{ width: `${Math.max(6, width)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm leading-7 text-inkSoft">
            气质已封存入印。接下来，去一座博物馆——
            <br />
            见一见在那儿等你千年的它。
          </p>

          <div className="mt-8 flex justify-center">
            <SealButton size="lg" onClick={() => navigate('/museum')}>
              去选一座博物馆
            </SealButton>
          </div>
        </main>
      </div>
    );
  }

  /* ── 答题 ─────────────────────────────────────────────── */
  return (
    <div className="paper-bg flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pb-10 pt-12">
        {/* 进度 */}
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-cinnabar">
            {index + 1}
            <span className="text-inkSoft"> / {QUIZ.length}</span>
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cinnabar to-tungsten transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 题干 */}
        <div key={question.id} className="animate-fade-up mt-10">
          <p className="text-[10px] tracking-[0.4em] text-inkSoft">第 {index + 1} 夜</p>
          <h2 className="mt-3 font-serif text-xl leading-9 text-ink">{question.scene}</h2>
        </div>

        {/* 选项 */}
        <div key={`${question.id}-options`} className="stagger mt-8 space-y-3.5">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`option-bar w-full rounded-xl border border-tungsten/45 bg-paper/70 px-5 py-4 text-left font-serif text-[15px] leading-7 text-ink ${
                selected === i ? 'selected' : ''
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="mt-auto pt-10 text-center text-[10px] tracking-[0.3em] text-inkSoft/60">
          凭直觉选 · 没有对错
        </p>
      </main>
    </div>
  );
}
