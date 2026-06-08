import type { PeriodType } from '../types';

interface PeriodFilterProps {
  selected: PeriodType;
  onSelect: (type: PeriodType) => void;
}

const periods: { type: PeriodType; label: string }[] = [
  { type: 'month', label: 'This Month' },
  { type: 'quarter', label: 'This Quarter' },
  { type: 'year', label: 'This Year' },
  { type: 'all', label: 'All Time' },
];

export function PeriodFilter({ selected, onSelect }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {periods.map(p => (
        <button
          key={p.type}
          onClick={() => onSelect(p.type)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selected === p.type
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function getPeriodDates(type: PeriodType): {
  startDate: string | null;
  endDate: string | null;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  switch (type) {
    case 'month': {
      const start = formatDate(year, month, 1);
      return { startDate: start, endDate: formatDate(year, month, day) };
    }
    case 'quarter': {
      const quarter = Math.floor(month / 3);
      const start = formatDate(year, quarter * 3, 1);
      return { startDate: start, endDate: formatDate(year, month, day) };
    }
    case 'year': {
      const start = formatDate(year, 0, 1);
      return { startDate: start, endDate: formatDate(year, month, day) };
    }
    case 'all':
    default:
      return { startDate: null, endDate: null };
  }
}
