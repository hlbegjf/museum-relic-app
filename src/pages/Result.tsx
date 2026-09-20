import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ImageDown, Landmark, Stamp } from 'lucide-react';
import AffinityRing from '@/components/AffinityRing';
import ArtifactImage from '@/components/ArtifactImage';
import ArtifactSeal from '@/components/ArtifactSeal';
import SealButton from '@/components/SealButton';
import { generateShareCard } from '@/components/ShareCard';
import { MUSEUM_BY_ID } from '@/data/museums';
import { matchCurated } from '@/engine/engine';
import { matchLive, type LiveMatch } from '@/engine/wikidata';
import { useFateStore } from '@/store/fate';

export default function Result() {
  const { museumKey = '' } = useParams();
  const navigate = useNavigate();

  const profile = useFateStore((s) => s.profile);
  const pendingCustom = useFateStore((s) => s.pendingCustom);
  const collection = useFateStore((s) => s.collection);
  const addRecord = useFateStore((s) => s.addRecord);

  const builtIn = museumKey in MUSEUM_BY_ID ? MUSEUM_BY_ID[museumKey] : null;
  const customName =
    pendingCustom && pendingCustom.key === museumKey ? pendingCustom.name : null;

  /* ── 任意馆：Wikidata 真实馆藏推演（异步） ───────────── */
  const [liveResult, setLiveResult] = useState<LiveMatch | null>(null);
  const [livePhase, setLivePhase] = useState<'idle' | 'loading' | 'done'>('idle');
  /** 长等待（慢模式兜底时可达 20 秒+）切换文案，让用户知道仍在推进 */
  const [slowWait, setSlowWait] = useState(false);

  const existingRecord = useMemo(
    () => collection.find((r) => r.museumKey === museumKey),
    [collection, museumKey],
  );
  const existingSnapshot = existingRecord?.artifactSnapshot;

  useEffect(() => {
    if (!profile || builtIn || !customName) return;
    // 初遇已盖章 → 用快照重现当时的相遇，不再查询
    if (existingSnapshot) {
      setLiveResult({
        match: {
          artifact: existingSnapshot,
          affinity: existingRecord.affinity,
          divined: true,
        },
        live: existingSnapshot.live === true,
        museumQid: null,
      });
      setLivePhase('done');
      return;
    }
    let cancelled = false;
    setLivePhase('loading');
    setSlowWait(false);
    setLiveResult(null);
    const slowTimer = setTimeout(() => !cancelled && setSlowWait(true), 9000);
    matchLive(profile, customName).then((res) => {
      if (cancelled) return;
      setLiveResult(res);
      setLivePhase('done');
    });
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [profile, builtIn, customName, existingSnapshot, existingRecord?.affinity]);

  const match = useMemo(() => {
    if (!profile) return null;
    if (builtIn) return matchCurated(profile, builtIn.id);
    if (customName && livePhase === 'done' && liveResult) return liveResult.match;
    return null;
  }, [profile, builtIn, customName, livePhase, liveResult]);

  const museumName = builtIn ? builtIn.name : customName ?? '';

  const revisited = useMemo(
    () => collection.some((r) => r.museumKey === museumKey),
    [collection, museumKey],
  );

  /** 进入本页时是否已持有此馆印章（盖章引起的 store 更新不影响该判定） */
  const wasCollectedRef = useRef<boolean | null>(null);
  if (wasCollectedRef.current === null) {
    wasCollectedRef.current = revisited;
  }
  const wasCollected = wasCollectedRef.current;

  const [awakening, setAwakening] = useState(true);
  const stamped = useRef(false);

  useEffect(() => {
    if (!match) return;
    const timer = window.setTimeout(() => setAwakening(false), wasCollected ? 500 : 1800);
    return () => window.clearTimeout(timer);
  }, [match, wasCollected]);

  useEffect(() => {
    if (awakening || !match || !museumName || stamped.current) return;
    stamped.current = true;
    addRecord({
      museumKey,
      museumName,
      artifactId: match.artifact.id,
      affinity: match.affinity,
      timestamp: Date.now(),
      divined: match.divined,
      artifactSnapshot: match.artifact,
    });
  }, [awakening, match, museumName, museumKey, addRecord]);

  if (!profile) return <Navigate to="/quiz" replace />;
  if (!match) {
    // 任意馆推演中（含首帧 idle）：显示过渡页而非跳走
    if (customName && livePhase !== 'done') {
      return (
        <div className="paper-bg flex min-h-screen flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-40 w-40 animate-glow-pulse rounded-full bg-tungsten/30 blur-2xl" />
            <span className="seal relative h-24 w-24 animate-spin-slow rounded-2xl text-5xl">
              缘
            </span>
          </div>
          <p className="mt-10 animate-pulse font-display text-2xl tracking-[0.3em] text-ink">
            正在推演缘分
          </p>
          <p className="mt-3 text-xs tracking-[0.4em] text-inkSoft">{museumName}</p>
          <p className="mt-2 text-[10px] tracking-wider text-inkSoft/60">
            {slowWait ? '馆藏档案深且长，仍在细细翻检…' : '查询这座馆的真实馆藏中…'}
          </p>
        </div>
      );
    }
    return <Navigate to="/museum" replace />;
  }

  const { artifact, affinity, divined } = match;

  /* ── 苏醒过渡 ─────────────────────────────────────────── */
  if (awakening) {
    return (
      <div className="paper-bg flex min-h-screen flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 animate-glow-pulse rounded-full bg-tungsten/30 blur-2xl" />
          <span className="seal relative h-24 w-24 animate-spin-slow rounded-2xl text-5xl">
            {artifact.name.replace(/[《》「」]/g, '').charAt(0)}
          </span>
        </div>
        <p className="mt-10 animate-pulse font-display text-2xl tracking-[0.3em] text-ink">
          {divined ? '正在推演缘分' : '文物正在苏醒'}
        </p>
        <p className="mt-3 text-xs tracking-[0.4em] text-inkSoft">{museumName}</p>
      </div>
    );
  }

  /* ── 结果 ─────────────────────────────────────────────── */
  return (
    <div className="paper-bg min-h-screen">
      <main className="mx-auto w-full max-w-[480px] px-6 pb-16 pt-12">
        {/* 馆名章 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full border border-gold/60 bg-paper/80 px-4 py-1.5 text-xs text-inkSoft">
            <Landmark size={13} />
            <span>
              {museumName} ·{' '}
              {builtIn ? '专属策展' : artifact.live ? '真实馆藏推演' : '世界文物推演'}
            </span>
          </div>
          {divined && !artifact.live && (
            <p className="mt-2 text-center text-[10px] leading-4 text-inkSoft/70">
              该馆馆藏暂未收录 · 已为你推演世界文物之缘
            </p>
          )}
        </div>

        {/* 文物头图区 */}
        <div className="stagger mt-8 flex items-start justify-between gap-4">
          <div className="flex flex-col items-center gap-3">
            <ArtifactSeal name={artifact.name} size="xl" />
            <span className="text-[10px] tracking-[0.3em] text-inkSoft">本命文物</span>
          </div>
          <div className="vertical-rl min-h-[240px] font-display text-5xl leading-[1.15] text-ink">
            {artifact.name.replace(/[《》「」]/g, '')}
          </div>
        </div>

        {/* 实物图鉴：逛馆时按图索骥 */}
        <div className="stagger mt-6">
          <div className="flex items-baseline justify-between px-1">
            <span className="font-display text-lg text-ink">实物图鉴</span>
            <span className="text-[10px] tracking-wider text-inkSoft">逛馆时，凭这张图找到它</span>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-gold/50 card-shadow">
            <ArtifactImage artifact={artifact} className="h-64 w-full" />
          </div>
          <p className="mt-1.5 text-center text-[10px] text-inkSoft/60">
            图片来源 · Wikimedia Commons
          </p>
        </div>

        {/* 朝代 / 馆藏 / 缘分值 */}
        <div className="stagger mt-6 flex flex-col items-center gap-2 rounded-2xl border border-gold/40 bg-paper/70 py-5 card-shadow">
          <p className="font-serif text-sm text-ink">
            {artifact.dynasty} · {artifact.origin}
          </p>
          <AffinityRing value={affinity} size={128} />
        </div>

        {/* 身世 */}
        <div className="stagger mt-8">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-azurite" />
            <span className="font-display text-lg text-ink">它的身世</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-inkSoft">{artifact.intro}</p>
        </div>

        {/* 拟人小传 */}
        <div className="stagger mt-8 rounded-2xl border border-gold/40 bg-[#FFFCF5] p-5 card-shadow">
          <p className="text-center font-display text-xl text-cinnabar">它 · 对你说</p>
          <p className="mt-3 text-[15px] leading-8 text-ink">{artifact.persona}</p>
        </div>

        {/* 文物留言 */}
        <div className="stagger mt-8 rounded-2xl border border-dashed border-cinnabar/50 bg-paper/60 p-5">
          <p className="text-center text-[10px] tracking-[0.4em] text-inkSoft">文物留言</p>
          <p className="mt-2 text-center font-serif text-base leading-8 text-cinnabar">
            「{artifact.message}」
          </p>
        </div>

        {/* 标签 */}
        <div className="stagger mt-6 flex flex-wrap justify-center gap-2">
          {artifact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-dai/10 px-3.5 py-1 text-xs text-dai"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 盖章动画 */}
        <div className="relative mt-10 flex justify-center">
          <span className="seal h-16 w-16 animate-stamp-in rounded-xl text-2xl">
            有缘
          </span>
        </div>
        <p className="mt-2 text-center text-[10px] tracking-[0.3em] text-inkSoft">
          {wasCollected ? '此馆已集章 · 初遇记录完好' : '已盖入你的集章足迹'}
        </p>

        {/* 操作区 */}
        <div className="stagger mt-10 flex flex-col gap-3">
          <SealButton onClick={() => generateShareCard({ artifact, museumName, affinity, divined })}>
            <ImageDown size={18} />
            保存分享卡
          </SealButton>
          <div className="flex gap-3">
            <SealButton variant="ghost" className="flex-1" onClick={() => navigate('/museum')}>
              换馆再测
            </SealButton>
            <SealButton variant="ghost" className="flex-1" onClick={() => navigate('/collection')}>
              <Stamp size={16} />
              查看足迹
            </SealButton>
          </div>
        </div>
      </main>
    </div>
  );
}
