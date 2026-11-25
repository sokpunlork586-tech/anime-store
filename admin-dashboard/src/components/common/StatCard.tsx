import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  iconBg: string;
  isCurrency?: boolean;
}

export default function StatCard({ title, value, growth, icon, iconBg, isCurrency = false }: StatCardProps) {
  const isPositive = growth >= 0;
  const displayValue = isCurrency ? formatCurrency(value) : formatNumber(value);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border-light hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-text-muted font-medium">{title}</p>
          <p className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">{displayValue}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '↑' : '↓'} {Math.abs(growth)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
