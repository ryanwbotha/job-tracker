import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Share2, Sparkles, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import DatePickerPopover from './DatePickerPopover';

export default function TopToolbar({ viewTitle, viewSubtitle, onOpenBrainDump, onOpenAccountability }) {
  const { selectedDate, setSelectedDate } = useTracker();

  const handlePrevDay = () => {
    if (selectedDate === 'ALL') {
      const prev = new Date();
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev.toISOString().split('T')[0]);
      return;
    }
    const curr = new Date(selectedDate + 'T00:00:00');
    curr.setDate(curr.getDate() - 1);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (selectedDate === 'ALL') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }
    const curr = new Date(selectedDate + 'T00:00:00');
    curr.setDate(curr.getDate() + 1);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  const handleSetAll = () => {
    setSelectedDate(selectedDate === 'ALL' ? new Date().toISOString().split('T')[0] : 'ALL');
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 w-full"
    >
      {/* Title block */}
      <div>
        <h1
          style={{ color: 'var(--text-primary)' }}
          className="text-base font-semibold tracking-tight leading-tight"
        >
          {viewTitle}
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-xs">
          {viewSubtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Date navigator */}
        <div
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
          className="flex items-center gap-0 h-10 min-h-[40px]"
        >
          <button
            type="button"
            onClick={handlePrevDay}
            title="Previous Day"
            style={{ color: 'var(--text-secondary)' }}
            className="inline-flex items-center justify-center w-10 h-10 cursor-pointer border-none bg-transparent transition-colors hover:!text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          >
            <ChevronLeft size={15} />
          </button>

          <div
            style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}
            className="flex items-center h-full"
          >
            <DatePickerPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            title="Next Day"
            style={{ color: 'var(--text-secondary)' }}
            className="inline-flex items-center justify-center w-10 h-10 cursor-pointer border-none bg-transparent transition-colors hover:!text-[var(--text-primary)]"
          >
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            onClick={handleSetAll}
            title="Toggle All Dates"
            style={selectedDate === 'ALL'
              ? { background: '#3b82f6', color: '#fff', borderLeft: '1px solid var(--border)' }
              : { background: 'transparent', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border)' }
            }
            className="inline-flex items-center justify-center px-3.5 h-10 text-xs font-semibold cursor-pointer border-none transition-colors hover:!text-[var(--text-primary)]"
          >
            All
          </button>
        </div>

        {/* Brain dump / activity sorter */}
        <button
          onClick={onOpenBrainDump}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
          }}
          className="btn btn-sm btn-ghost gap-2 min-h-[40px] px-4"
        >
          <Sparkles size={14} color="#8b5cf6" />
          <span>Import Activity</span>
        </button>

        {/* Accountability share */}
        <button
          onClick={onOpenAccountability}
          className="btn btn-sm btn-success min-h-[40px] px-4 gap-2"
        >
          <Share2 size={14} />
          <span>Share Update</span>
        </button>

      </div>
    </div>
  );
}
