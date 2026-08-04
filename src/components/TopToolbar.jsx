import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Share2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="top-toolbar">
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{viewTitle}</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{viewSubtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Date Navigator Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Date</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            
            {/* Prev button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrevDay}
              style={{ padding: '0.4rem 0.5rem', minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Previous Day"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Custom Calendar Popover */}
            <DatePickerPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

            {/* Next button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleNextDay}
              style={{ padding: '0.4rem 0.5rem', minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Next Day"
            >
              <ChevronRight size={14} />
            </button>

            {/* All toggle button */}
            <button
              type="button"
              className={`btn btn-sm ${selectedDate === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleSetAll}
              style={{ padding: '0.4rem 0.65rem', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              title="Toggle All Dates"
            >
              All
            </button>

          </div>
        </div>

        {/* Unified Sorter Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily Activity Sorter</label>
          <button className="btn btn-secondary" onClick={onOpenBrainDump} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={15} color="var(--accent-purple)" />
            <span>Import Voice/Text/Photo</span>
          </button>
        </div>

        {/* Accountability Update Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Share Summary</label>
          <button className="btn btn-emerald" onClick={onOpenAccountability}>
            <Share2 size={15} />
            <span>Accountability Update</span>
          </button>
        </div>
      </div>
    </div>
  );
}
