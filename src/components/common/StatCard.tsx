import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  onClick,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'rose': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'sky': return 'text-sky-600 bg-sky-50 border-sky-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</span>
        <div className={`p-2.5 rounded-lg border ${getColorStyles()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              trend.isNeutral
                ? 'bg-slate-100 text-slate-600'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-normal">{subtitle}</p>}
    </div>
  );
};
