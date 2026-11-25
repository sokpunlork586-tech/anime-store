import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SalesDataPoint } from '@/types';

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border-light">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-[18px] font-semibold text-text-primary">Sales Overview</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-text-secondary">This Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-text-secondary">Last Month</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="thisMonthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D96532" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#D96532" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lastMonthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E9A36F" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#E9A36F" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0D9C4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9B8178' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9B8178' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff', border: '1px solid #F0D9C4', borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(61,22,15,0.1)', fontSize: '13px',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend content={() => null} />
          <Area type="monotone" dataKey="lastMonth" stroke="#E9A36F" strokeWidth={2} fill="url(#lastMonthGradient)" dot={false} name="Last Month" />
          <Area type="monotone" dataKey="thisMonth" stroke="#D96532" strokeWidth={2.5} fill="url(#thisMonthGradient)" dot={{ r: 3, fill: '#D96532', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} name="This Month" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
