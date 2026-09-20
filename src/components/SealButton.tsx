import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SealButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/** 印章式按钮：朱砂方章 / 幽灵描边章 */
export default function SealButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: SealButtonProps) {
  return (
    <button
      className={cn(
        'btn-press font-display tracking-widest select-none',
        'inline-flex items-center justify-center gap-2 rounded-xl',
        variant === 'primary'
          ? 'bg-gradient-to-br from-cinnabar to-cinnabar-deep text-paper shadow-[inset_0_0_0_1px_rgba(247,242,231,0.35),0_6px_18px_rgba(160,44,59,0.35)]'
          : 'border border-gold/70 bg-paper/60 text-ink hover:bg-paperDeep',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-lg',
        size === 'lg' && 'px-8 py-4 text-2xl',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
