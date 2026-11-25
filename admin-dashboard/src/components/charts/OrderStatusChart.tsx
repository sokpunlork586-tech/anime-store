import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { OrderStatusData } from '@/types';
import { formatNumber } from '@/utils/formatters';

interface OrderStatusChartProps {
  data: OrderStatusData[];
  total: number;
}

export default function OrderStatusChart({ data, total }: OrderStatusChartProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border-light">
      <h3 className="text-[18px] font-semibold text-text-primary mb-4">Order Status</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                dataKey="count"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-text-primary tabular-nums">{formatNumber(total)}</span>
            <span className="text-xs text-text-muted">Total</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-text-secondary">{item.status}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
