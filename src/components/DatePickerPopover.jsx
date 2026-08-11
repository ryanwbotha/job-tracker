import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePickerPopover({ selectedDate, setSelectedDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const initialDate = selectedDate && selectedDate !== 'ALL'
    ? new Date(selectedDate + 'T00:00:00')
    : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(p => p - 1); }
    else { setCurrentMonth(p => p - 1); }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(p => p + 1); }
    else { setCurrentMonth(p => p + 1); }
  };

  const handleDaySelect = (day, e) => {
    e.stopPropagation();
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    setSelectedDate(`${currentYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setIsOpen(false);
  };

  const handleSetAll = (e) => {
    e.stopPropagation();
    setSelectedDate('ALL');
    setIsOpen(false);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysGrid = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const getDisplayLabel = () => {
    if (selectedDate === 'ALL') return 'All Dates';
    const d = new Date(selectedDate + 'T00:00:00');
    if (isNaN(d.getTime())) return selectedDate;
    if (selectedDate === new Date().toISOString().split('T')[0]) return 'Today';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div ref={popoverRef} className="relative inline-block h-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-[var(--bg-card)] transition-colors"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          padding: '0 0.75rem',
          minWidth: '100px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          height: '100%',
          justifyContent: 'center',
        }}
      >
        <CalendarIcon size={14} style={{ color: 'var(--text-muted)' }} />
        {getDisplayLabel()}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              width: '256px',
              padding: '0.875rem',
            }}
            className="animate-fadeIn"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3.5 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
              className="hover:!bg-[var(--bg-elevated)] min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
              className="hover:!bg-[var(--bg-elevated)] min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {DAY_LABELS.map(d => (
              <span key={d} style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>{d}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((day, idx) => {
              if (day === null) return <div key={`e${idx}`} />;
              const mm = String(currentMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const thisDateStr = `${currentYear}-${mm}-${dd}`;
              const isSelected = selectedDate === thisDateStr;
              const isToday = todayStr === thisDateStr;

              return (
                <button
                  key={`d${day}`}
                  type="button"
                  onClick={e => handleDaySelect(day, e)}
                  style={isSelected
                    ? { background: '#3b82f6', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', padding: '8px 0', minHeight: '36px' }
                    : isToday
                    ? { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontWeight: 700, border: '1px solid rgba(59,130,246,0.4)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', padding: '8px 0', minHeight: '36px' }
                    : { background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8125rem', padding: '8px 0', minHeight: '36px' }
                  }
                  className={!isSelected && !isToday ? 'hover:!bg-[var(--bg-elevated)]' : ''}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{ borderTop: '1px solid var(--border)', marginTop: '0.875rem', paddingTop: '0.75rem' }}
            className="flex gap-2"
          >
            <button
              type="button"
              onClick={handleSetToday}
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '8px 0',
                minHeight: '36px',
                fontFamily: 'inherit',
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSetAll}
              style={{
                flex: 1,
                background: selectedDate === 'ALL' ? '#3b82f6' : 'var(--bg-elevated)',
                border: selectedDate === 'ALL' ? '1px solid #3b82f6' : '1px solid var(--border)',
                color: selectedDate === 'ALL' ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '8px 0',
                minHeight: '36px',
                fontFamily: 'inherit',
              }}
            >
              Show All
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
