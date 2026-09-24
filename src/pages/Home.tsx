import { useNavigate } from 'react-router-dom';
import SealButton from '@/components/SealButton';
import { useFateStore } from '@/store/fate';

export default function Home() {
  const navigate = useNavigate();
  const profile = useFateStore((s) => s.profile);
  const collection = useFateStore((s) => s.collection);

  return (
    <div className="paper-bg relative min-h-screen overflow-hidden">
      {/* 云气漂移 */}
      <div className="pointer-events-none absolute -top-16 -left-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl animate-drift" />
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cinnabar/10 blur-3xl animate-drift"
        style={{ animationDelay: '2.5s' }}
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-6 pb-10 pt-16">
        {/* 眉批 */}
        <p className="animate-fade-up text-center text-xs tracking-[0.5em] text-inkSoft">
          灵感来自《逃出大英博物馆》
        </p>

        {/* 竖排主标题 + 印章 */}
        <div className="mt-10 flex items-start justify-center gap-5">
          <h1 className="vertical-rl animate-fade-up font-display text-[64px] leading-[1.05] text-ink" style={{ animationDelay: '0.1s' }}>
            文物有缘
          </h1>
          <span
            className="seal mt-2 h-14 w-14 animate-stamp-in rounded-lg text-3xl"
            style={{ animationDelay: '0.6s' }}
          >
            缘
          </span>
        </div>

        {/* 引言之引 */}
        <div className="stagger mt-12 space-y-3 text-center">
          <p className="font-serif text-lg text-ink">每一件文物，</p>
          <p className="font-serif text-lg text-ink">都在等待与它魂魄相通的人。</p>
        </div>

        <div className="stagger mt-8">
          <p className="mx-auto max-w-[300px] text-sm leading-7 text-inkSoft">
            答完六道题，你会得到自己的六维文物气质。然后，选一座博物馆——
            或输入世界上任何一座馆的名字，去遇见那件与你缘分最深的文物，
            并为它盖下一枚只属于你的印章。
          </p>
        </div>

        {/* CTA */}
        <div className="stagger mt-12 flex flex-col items-center gap-4">
          {profile ? (
            <>
              <SealButton size="lg" onClick={() => navigate('/museum')}>
                继续逛馆
              </SealButton>
              <SealButton variant="ghost" onClick={() => navigate('/quiz')}>
                重新测试气质
              </SealButton>
            </>
          ) : (
            <SealButton size="lg" onClick={() => navigate('/quiz')}>
                唤醒本命文物
            </SealButton>
          )}
        </div>

        {/* 足迹 */}
        <button
          onClick={() => navigate('/collection')}
          className="btn-press mx-auto mt-10 flex items-center gap-2 rounded-full border border-gold/50 bg-paper/70 px-5 py-2 text-sm text-inkSoft hover:border-cinnabar/60"
        >
          <span>我的集章足迹</span>
          <span className="font-display text-base text-cinnabar">
            {collection.length}
          </span>
          <span>枚</span>
        </button>

        <p className="mt-auto pt-12 text-center text-[10px] leading-5 text-inkSoft/70">
          本应用为文创娱乐作品 · 文案为艺术创作，文物信息以各馆官方为准
          <br />
          <button
            onClick={() => navigate('/about')}
            className="underline decoration-inkSoft/40 underline-offset-2"
          >
            版权与来源说明
          </button>
        </p>
      </main>
    </div>
  );
}
