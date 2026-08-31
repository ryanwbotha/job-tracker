import React, { useState } from 'react';
import { CalendarBlank as CalendarIcon } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { format } from 'date-fns';

const getLocalDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function DatePickerPopover({ selectedDate, setSelectedDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastDate, setLastDate] = React.useState(selectedDate === 'ALL' ? getLocalDateStr() : selectedDate);

  React.useEffect(() => {
    if (selectedDate && selectedDate !== 'ALL') {
      setLastDate(selectedDate);
    }
  }, [selectedDate]);

  // Convert string to Date using lastDate so the picker doesn't clear
  const dateValue = new Date(lastDate + 'T00:00:00');

  const getDisplayLabel = () => {
    if (dateValue && !isNaN(dateValue.getTime())) {
      return format(dateValue, 'MMM d, yyyy');
    }
    return lastDate || 'Select date';
  };

  const handleSelect = (newDate) => {
    if (newDate) {
      const yyyy = newDate.getFullYear();
      const mm = String(newDate.getMonth() + 1).padStart(2, '0');
      const dd = String(newDate.getDate()).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-${dd}`);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs font-medium gap-2 border-none">
          <CalendarIcon size={14} className="text-muted-foreground" />
          <span>{getDisplayLabel()}</span>
        </Button>
      } />
      <PopoverContent className="w-auto p-0" align="center">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
