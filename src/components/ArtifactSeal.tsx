import { emblemChar } from '@/lib/emblem';
import { cn } from '@/lib/utils';

interface ArtifactSealProps {
  name: string;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

/** 文物徽记：朱砂方章 + 毛笔字首字 */
export default function ArtifactSeal({ name, size = 'md', className }: ArtifactSealProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'seal rounded-lg',
        size === 'md' && 'h-14 w-14 text-3xl',
        size === 'lg' && 'h-20 w-20 text-5xl',
        size === 'xl' && 'h-24 w-24 text-6xl',
        className,
      )}
    >
      {emblemChar(name)}
    </span>
  );
}
