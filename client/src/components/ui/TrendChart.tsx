import { useId } from 'react';
import { cn } from '../../lib/cn';

interface TrendChartProps {
  data: number[];
  labels?: string[];
  type?: 'bar' | 'area';
  format?: (n: number) => string;
  className?: string; // controls the chart colour via text-* (uses currentColor)
}

const W = 300;
const H = 90;

// Lightweight dependency-free SVG chart (bars or area) driven by currentColor.
export function TrendChart({ data, labels, type = 'bar', format = (n) => String(n), className }: TrendChartProps) {
  const gid = useId().replace(/:/g, '');
  const max = Math.max(...data, 1);
  const n = data.length || 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn('h-24 w-full text-primary', className)} role="img">
      {type === 'area' ? (() => {
        const pts = data.map((v, i) => [n === 1 ? 0 : (i / (n - 1)) * W, H - (v / max) * (H - 6)] as const);
        const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
        const area = `${line} L${W},${H} L0,${H} Z`;
        return (
          <>
            <defs>
              <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#g${gid})`} />
            <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </>
        );
      })() : (() => {
        const gap = 3;
        const bw = (W - (n - 1) * gap) / n;
        return data.map((v, i) => {
          const h = (v / max) * (H - 4);
          return (
            <rect key={i} x={i * (bw + gap)} y={H - h} width={bw} height={Math.max(h, 1)} rx={Math.min(bw / 2, 3)} fill="currentColor" fillOpacity={0.85}>
              <title>{labels?.[i] ? `${labels[i]}: ${format(v)}` : format(v)}</title>
            </rect>
          );
        });
      })()}
    </svg>
  );
}

export default TrendChart;
