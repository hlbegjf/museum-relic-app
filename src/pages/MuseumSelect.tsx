import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark as LandmarkIcon, Search, Sparkles } from 'lucide-react';
import SealButton from '@/components/SealButton';
import { MUSEUMS } from '@/data/museums';
import { customMuseumKey } from '@/engine/engine';
import { useFateStore } from '@/store/fate';

export default function MuseumSelect() {
  const navigate = useNavigate();
  const collection = useFateStore((s) => s.collection);
  const setPendingCustom = useFateStore((s) => s.setPendingCustom);

  const [keyword, setKeyword] = useState('');
  const [customName, setCustomName] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  const collectedKeys = useMemo(
    () => new Set(collection.map((r) => r.museumKey)),
    [collection],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return MUSEUMS;
    return MUSEUMS.filter(
      (m) => m.name.includes(kw) || m.city.includes(kw) || m.tagline.includes(kw),
    );
  }, [keyword]);

  function goBuiltIn(id: string) {
    setHint(null);
    navigate(`/result/${id}`);
  }

  function divineCustom() {
    const name = customName.trim();
    if (!name) {
      setHint('先写下一座博物馆的名字吧');
      return;
    }
    const builtIn = MUSEUMS.find((m) => m.name === name || name === m.name.replace('博物院', '博物馆'));
    if (builtIn) {
      setHint(`「${builtIn.name}」已收录专属策展，将带你直奔馆藏`);
      return;
    }
    const key = customMuseumKey(name);
    setPendingCustom({ key, name });
    navigate(`/result/${key}`);
  }

  return (
    <div className="paper-bg min-h-screen">
      <main className="mx-auto w-full max-w-[480px] px-6 pb-16 pt-12">
        <p className="text-center text-xs tracking-[0.5em] text-inkSoft">今夜 · 你要去哪座馆</p>
        <h2 className="mt-4 text-center font-display text-4xl text-ink">选择博物馆</h2>
        <p className="mt-3 text-center text-xs leading-6 text-inkSoft">
          已收录 {MUSEUMS.length} 座博物馆的专属策展；
          <br />
          世界上任何一座馆，也都可以为你推演缘分。
        </p>

        {/* 搜索 */}
        <div className="mt-8 flex items-center gap-2 rounded-full border border-gold/50 bg-paper/80 px-4 py-2.5">
          <Search size={16} className="shrink-0 text-inkSoft" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索馆名 / 城市…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-inkSoft/50"
          />
        </div>

        {/* 馆卡墙 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {filtered.map((m) => {
            const sealed = collectedKeys.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => goBuiltIn(m.id)}
                className="btn-press group flex flex-col rounded-xl border border-gold/40 bg-paper/80 p-4 text-left card-shadow hover:border-cinnabar/60"
              >
                <div className="flex items-start justify-between">
                  <LandmarkIcon size={18} className="mt-0.5 text-azurite" />
                  {sealed && (
                    <span className="seal h-6 w-6 rounded text-xs" title="已集章">
                      缘
                    </span>
                  )}
                </div>
                <span className="mt-3 font-display text-lg leading-tight text-ink">{m.name}</span>
                <span className="mt-1 text-[11px] text-inkSoft">{m.city}</span>
                <span className="mt-2 line-clamp-2 text-[11px] leading-5 text-inkSoft/80">
                  {m.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-inkSoft">
            没有找到内置馆——没关系，在下面用「缘分推演」唤醒它。
          </p>
        )}

        {/* 自定义馆 */}
        <div className="mt-10 rounded-2xl border border-dashed border-cinnabar/40 bg-paper/60 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-tungsten" />
            <span className="font-display text-lg text-ink">任意博物馆 · 缘分推演</span>
          </div>
          <p className="mt-2 text-xs leading-6 text-inkSoft">
            输入全国乃至全世界任何一座博物馆，系统将推演你与文明星空中
            哪一件文物最有缘。同一座馆，每次遇见的都是同一件——
            这是只属于你们的记忆。
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                setHint(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && divineCustom()}
              placeholder="如：苏州博物馆 / 卢浮宫 / 大都会…"
              className="min-w-0 flex-1 rounded-full border border-gold/50 bg-paper px-4 py-2.5 text-sm text-ink outline-none placeholder:text-inkSoft/50 focus:border-cinnabar/60"
            />
            <SealButton size="sm" onClick={divineCustom}>
              推演
            </SealButton>
          </div>
          {hint && <p className="mt-3 text-xs text-cinnabar">{hint}</p>}
        </div>
      </main>
    </div>
  );
}
