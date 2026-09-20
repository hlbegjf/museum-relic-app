import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import ArtifactImage from '@/components/ArtifactImage';
import SealButton from '@/components/SealButton';
import { ARTIFACT_BY_ID } from '@/data/artifacts';
import { MUSEUMS } from '@/data/museums';
import { useFateStore } from '@/store/fate';

export default function Collection() {
  const navigate = useNavigate();
  const profile = useFateStore((s) => s.profile);
  const collection = useFateStore((s) => s.collection);
  const setPendingCustom = useFateStore((s) => s.setPendingCustom);
  const resetAll = useFateStore((s) => s.resetAll);

  const [confirming, setConfirming] = useState(false);

  const recordByKey = useMemo(
    () => Object.fromEntries(collection.map((r) => [r.museumKey, r])),
    [collection],
  );

  const builtInSealed = MUSEUMS.filter((m) => recordByKey[m.id]).length;
  const customRecords = collection.filter((r) => r.divined);
  const progress = Math.round((builtInSealed / MUSEUMS.length) * 100);

  function openRecord(museumKey: string, museumName: string, divined: boolean) {
    if (divined) {
      setPendingCustom({ key: museumKey, name: museumName });
    }
    navigate(`/result/${museumKey}`);
  }

  return (
    <div className="paper-bg min-h-screen">
      <main className="mx-auto w-full max-w-[480px] px-6 pb-16 pt-12">
        <p className="text-center text-xs tracking-[0.5em] text-inkSoft">集章 · 未完的旅程</p>
        <h2 className="mt-4 text-center font-display text-4xl text-ink">我的博物馆足迹</h2>

        {/* 进度 */}
        <div className="mt-8 rounded-2xl border border-gold/40 bg-paper/70 p-5 card-shadow">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-lg text-ink">专属策展集章</span>
            <span className="font-display text-2xl text-cinnabar">
              {builtInSealed}
              <span className="text-sm text-inkSoft"> / {MUSEUMS.length}</span>
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cinnabar to-tungsten transition-all duration-700"
              style={{ width: `${Math.max(3, progress)}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-6 text-inkSoft">
            {builtInSealed === 0 && '还没有印章。去选一座博物馆，遇见你的第一件本命文物。'}
            {builtInSealed > 0 && builtInSealed < 5 && '初启程——山河辽阔，文物们在各处等你。'}
            {builtInSealed >= 5 && builtInSealed < 10 && '渐入佳境。你的气质，正在被越来越多的文物认出。'}
            {builtInSealed >= 10 && builtInSealed < 15 && '行至深处。每一枚章，都是一次魂魄相通。'}
            {builtInSealed === 15 && '十五馆集齐！你已是文物们公认的「自己人」。'}
            {customRecords.length > 0 && ` 另有 ${customRecords.length} 座推演之馆的记忆。`}
          </p>
        </div>

        {/* 内置馆集章墙 */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {MUSEUMS.map((m) => {
            const record = recordByKey[m.id];
            const artifact = record ? ARTIFACT_BY_ID[record.artifactId] : null;
            if (record && artifact) {
              return (
                <button
                  key={m.id}
                  onClick={() => openRecord(m.id, m.name, false)}
                  className="btn-press flex flex-col items-center rounded-xl border border-cinnabar/40 bg-paper/80 p-3 card-shadow hover:border-cinnabar"
                >
                  <ArtifactImage
                    artifact={artifact}
                    fit="cover"
                    fallbackSeal={false}
                    className="h-11 w-11 rounded-md border border-cinnabar/30"
                  />
                  <span className="mt-2 line-clamp-1 w-full text-center text-[11px] font-medium text-ink">
                    {m.name.replace('博物院', '').replace('博物馆', '')}
                  </span>
                  <span className="mt-0.5 line-clamp-1 w-full text-center text-[10px] text-inkSoft">
                    {artifact.name.replace(/[《》「」]/g, '')}
                  </span>
                  <span className="mt-0.5 font-display text-xs text-cinnabar">{record.affinity}%</span>
                </button>
              );
            }
            return (
              <button
                key={m.id}
                onClick={() => openRecord(m.id, m.name, false)}
                className="btn-press flex flex-col items-center rounded-xl border border-dashed border-ink/20 bg-paper/40 p-3 opacity-70 hover:opacity-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded border border-ink/15 text-lg text-ink/30">
                  ?
                </span>
                <span className="mt-2 line-clamp-1 w-full text-center text-[11px] text-inkSoft">
                  {m.name.replace('博物院', '').replace('博物馆', '')}
                </span>
                <span className="mt-0.5 text-[10px] text-inkSoft/60">未遇之馆</span>
              </button>
            );
          })}
        </div>

        {/* 推演之馆 */}
        {customRecords.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-tungsten" />
              <span className="font-display text-lg text-ink">推演之馆</span>
            </div>
            <div className="mt-4 space-y-3">
              {customRecords.map((r) => {
                const artifact = r.artifactSnapshot ?? ARTIFACT_BY_ID[r.artifactId];
                if (!artifact) return null;
                return (
                  <button
                    key={r.museumKey}
                    onClick={() => openRecord(r.museumKey, r.museumName, true)}
                    className="btn-press flex w-full items-center gap-4 rounded-xl border border-gold/40 bg-paper/80 p-4 text-left card-shadow hover:border-cinnabar/60"
                  >
                    <ArtifactImage
                      artifact={artifact}
                      fit="cover"
                      fallbackSeal={false}
                      className="h-12 w-12 shrink-0 rounded-md border border-cinnabar/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{r.museumName}</p>
                      <p className="mt-0.5 truncate text-xs text-inkSoft">
                        与你相遇：{artifact.name.replace(/[《》「」]/g, '')}
                      </p>
                    </div>
                    <span className="font-display text-lg text-cinnabar">{r.affinity}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 操作 */}
        <div className="mt-12 flex flex-col gap-3">
          <SealButton onClick={() => navigate(profile ? '/museum' : '/quiz')}>
            {profile ? '继续逛馆集章' : '开始气质测试'}
          </SealButton>
          {confirming ? (
            <div className="rounded-xl border border-cinnabar/40 bg-paper/70 p-4 text-center">
              <p className="text-sm text-ink">将清空气质画像与全部印章，且不可恢复。确定？</p>
              <div className="mt-3 flex justify-center gap-3">
                <SealButton
                  size="sm"
                  onClick={() => {
                    resetAll();
                    setConfirming(false);
                    navigate('/');
                  }}
                >
                  挥泪清空
                </SealButton>
                <SealButton size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  再想想
                </SealButton>
              </div>
            </div>
          ) : (
            <SealButton variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              <RotateCcw size={14} />
              重新开始
            </SealButton>
          )}
        </div>
      </main>
    </div>
  );
}
