import { getLineColor } from '@/utils/metroData';
import { cn } from '@/lib/utils';

interface LineBadgeProps {
  line: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LineBadge({ line, size = 'md' }: LineBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5'
  };

  return (
    <span
      className={cn(
        "metro-line-badge",
        getLineColor(line),
        sizeClasses[size]
      )}
    >
      {line}
    </span>
  );
}
