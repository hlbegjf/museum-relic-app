import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SealButton from '@/components/SealButton';

const LINKS = {
  wikidata: 'https://www.wikidata.org',
  commons: 'https://commons.wikimedia.org',
  repo: 'https://github.com/hlbegjf/museum-relic-app',
};

/** 外链小字 */
function Ext({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-inkSoft/40 underline-offset-2 hover:text-inkSoft"
    >
      {children} ↗
    </a>
  );
}

/** 一条来源说明（标题 + 正文） */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gold/40 bg-paper/70 p-5 card-shadow">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <div className="mt-2 space-y-2 text-sm leading-7 text-inkSoft">{children}</div>
    </section>
  );
}

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="paper-bg min-h-screen">
      <main className="mx-auto w-full max-w-[480px] px-6 pb-16 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-inkSoft hover:text-ink"
        >
          <ArrowLeft size={14} />
          返回
        </button>

        <p className="mt-6 text-center text-xs tracking-[0.5em] text-inkSoft">来源 · 许可 · 边界</p>
        <h2 className="mt-4 text-center font-display text-4xl text-ink">版权与来源说明</h2>

        <div className="mt-8 space-y-4">
          <Section title="文物数据">
            <p>
              文物的名称、类别、年代与馆藏等信息来自{' '}
              <Ext href={LINKS.wikidata}>Wikidata</Ext>，其全部内容以
              <strong className="text-ink"> CC0（公共领域贡献）</strong>
              协议发布，可自由复制与使用。
            </p>
          </Section>

          <Section title="文物图片">
            <p>
              文物图片均来自{' '}
              <Ext href={LINKS.commons}>Wikimedia Commons</Ext>
              ，其收录的文件均为自由许可作品（公共领域、CC0、CC BY、CC BY-SA 等）。
            </p>
            <p>
              每件文物结果页的「图源」链接可直达对应的 Commons
              文件页面，<strong className="text-ink">作者与具体授权信息以该页面标注为准</strong>。
              如需复用图片，请遵循其各自的许可条款（部分许可要求署名或以相同方式共享）。
            </p>
          </Section>

          <Section title="文案与视觉">
            <p>
              本应用的气质测试、推演结果、拟人化文案与视觉设计均为原创艺术创作，属文创娱乐内容，
              <strong className="text-ink">不代表任何博物馆的官方立场</strong>。
            </p>
            <p>
              博物馆名称与馆藏信息归属各博物馆官方。本应用与任何博物馆无隶属或合作关系，
              文物信息请以各馆官方发布为准。
            </p>
          </Section>

          <Section title="权利主张">
            <p>
              本应用不存储任何图片，仅在浏览时引用 Commons 公开链接。如权利人认为本应用
              引用的内容侵犯了您的权益，请通过{' '}
              <Ext href={`${LINKS.repo}/issues`}>GitHub 仓库 Issues</Ext>{' '}
              告知，我们将在核实后第一时间移除或更正。
            </p>
          </Section>
        </div>

        <div className="mt-10">
          <SealButton variant="ghost" onClick={() => navigate('/')}>
            回到首页
          </SealButton>
        </div>
      </main>
    </div>
  );
}
