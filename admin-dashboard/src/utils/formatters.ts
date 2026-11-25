export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
}

export function formatFullDateTime(dateString: string): { date: string; time: string; full: string } {
  if (!dateString) return { date: '—', time: '', full: '—' };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    return { date: dateString, time: '', full: dateString };
  }

  const date = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);

  return {
    date,
    time,
    full: `${date} at ${time}`,
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#ORD-${num}`;
}

export function generateSku(category: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return formatDate(dateString);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  switch (status.toLowerCase()) {
    case 'completed': case 'active': case 'approved': case 'paid': case 'in_stock':
      return { bg: 'bg-success-light', text: 'text-success', dot: 'bg-success' };
    case 'processing':
      return { bg: 'bg-info-light', text: 'text-info', dot: 'bg-info' };
    case 'pending':
      return { bg: 'bg-warning-light', text: 'text-warning', dot: 'bg-warning' };
    case 'cancelled': case 'inactive': case 'hidden': case 'refunded': case 'out_of_stock':
      return { bg: 'bg-danger-light', text: 'text-danger', dot: 'bg-danger' };
    case 'low_stock':
      return { bg: 'bg-warning-light', text: 'text-warning', dot: 'bg-warning' };
    case 'draft': case 'archived':
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  }
}
