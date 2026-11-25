import { getStatusColor } from '@/utils/formatters';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  label?: string;
}

export default function StatusBadge({ status, size = 'md', label: customLabel }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  const label = customLabel || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize ${colors.bg} ${colors.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}
