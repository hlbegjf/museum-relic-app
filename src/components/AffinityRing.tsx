import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AffinityRingProps {
  value: number;
  size?: number;
  className?: string;
}

/** 鎏金缘分环：加载时从 0 扫到目标值 */
export default function AffinityRing({ value, size = 120, className }: AffinityRingProps) {
  const [display, setDisplay] = useState(0);
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = window.setTimeout(() => setDisplay(value), 120);
    return () => window.clearTimeout(timer);
  }, [value]);

  const offset = circumference * (1 - display / 100);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A063" />
            <stop offset="50%" stopColor="#E8A33D" />
            <stop offset="100%" stopColor="#C8394B" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(201,160,99,0.25)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gold)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl leading-none text-cinnabar">{display}</span>
        <span className="mt-1 text-[10px] tracking-[0.3em] text-inkSoft">缘分值</span>
      </div>
    </div>
  );
}
