import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function DatePickerPopover({ selectedDate, setSelectedDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Parse current selectedDate to get starting month/year in popover
  const initialDate = selectedDate && selectedDate !== 'ALL' ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-11

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfWeek = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDaySelect = (day, e) => {
    e.stopPropagation();
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setSelectedDate(`${currentYear}-${formattedMonth}-${formattedDay}`);
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

  // Generate day cells
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfWeek(currentYear, currentMonth);
  const daysGrid = [];

  for (let i = 0; i < startDay; i++) {
    daysGrid.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const getDisplayLabel = () => {
    if (selectedDate === 'ALL') {
      return 'All Dates';
    }
    const d = new Date(selectedDate + 'T00:00:00');
    if (isNaN(d.getTime())) return selectedDate;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate === todayStr) {
      return 'Today';
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div ref={popoverRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: '#ffffff',
          color: 'var(--text-primary)',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          outline: 'none',
          minWidth: '120px',
          justifyContent: 'center',
          transition: 'all 0.15s ease'
        }}
      >
        <CalendarIcon size={14} color="var(--accent-blue)" />
        <span>{getDisplayLabel()}</span>
      </button>

      {/* Popover Calendar Grid */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem',
            width: '260px',
            animation: 'popoverFade 0.15s ease-out'
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <button 
              type="button" 
              onClick={handlePrevMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {months[currentMonth]} {currentYear}
            </span>

            <button 
              type="button" 
              onClick={handleNextMonth}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '0.35rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName, idx) => (
              <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>{dayName}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty_${idx}`} />;
              }

              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const thisDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === thisDateStr;
              const isToday = new Date().toISOString().split('T')[0] === thisDateStr;

              return (
                <button
                  key={`day_${day}`}
                  type="button"
                  onClick={(e) => handleDaySelect(day, e)}
                  style={{
                    padding: '0.3rem 0',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 800 : isToday ? 700 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    background: isSelected ? 'var(--accent-purple)' : 'transparent',
                    color: isSelected ? '#ffffff' : isToday ? 'var(--accent-blue)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s ease',
                    boxShadow: isToday && !isSelected ? 'inset 0 0 0 1px var(--accent-blue)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleSetToday}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.25rem 0' }}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedDate === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleSetAll}
              style={{ flex: 1, fontSize: '0.7rem', padding: '0.25rem 0' }}
            >
              Show All
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
