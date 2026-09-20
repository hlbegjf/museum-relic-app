import { useState } from 'react';
import ArtifactSeal from '@/components/ArtifactSeal';
import { artifactImage } from '@/data/artifacts/images';
import { cn } from '@/lib/utils';
import type { Artifact } from '@/types';

interface ArtifactImageProps {
  artifact: Artifact;
  /** 容器样式（决定尺寸与圆角） */
  className?: string;
  /** 填充方式：图鉴用 contain，缩略图用 cover */
  fit?: 'contain' | 'cover';
  /** 缺图回退时是否显示印章（缩略图场景可关闭） */
  fallbackSeal?: boolean;
}

/** 文物实物图：加载骨架 + 失败回退印章，不阻塞页面渲染 */
export default function ArtifactImage({
  artifact,
  className,
  fit = 'contain',
  fallbackSeal = true,
}: ArtifactImageProps) {
  const url = artifactImage(artifact);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(url ? 'loading' : 'error');

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden bg-paperDeep/50', className)}
    >
      {url && state !== 'error' ? (
        <>
          {state === 'loading' && (
            <div className="absolute inset-0 animate-pulse bg-paperDeep" />
          )}
          <img
            src={url}
            alt={`${artifact.name} 实物图`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setState('ok')}
            onError={() => setState('error')}
            className={cn(
              'transition-opacity duration-500',
              fit === 'contain' ? 'h-full w-full object-contain' : 'h-full w-full object-cover',
              state === 'loading' && 'opacity-0',
            )}
          />
        </>
      ) : fallbackSeal ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <ArtifactSeal name={artifact.name} size="lg" />
          <span className="text-[10px] tracking-[0.25em] text-inkSoft">图片暂缺 · 以印为记</span>
        </div>
      ) : (
        <ArtifactSeal name={artifact.name} className="!h-full !w-full !rounded-none !text-2xl" />
      )}
    </div>
  );
}
