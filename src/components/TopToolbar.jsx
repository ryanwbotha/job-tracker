import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { ShareNetwork, Sparkle, CaretLeft, CaretRight } from '@phosphor-icons/react';
import DatePickerPopover from './DatePickerPopover';
import { Button } from './ui/button';
import { Card } from './ui/card';

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

  const getLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getLocalDateStr();

  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  const handleSetAll = () => {
    setSelectedDate('ALL');
  };

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 w-full">
      {/* Title block */}
      <div>
        <h1 className="text-base font-bold tracking-tight leading-tight text-foreground">
          {viewTitle}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {viewSubtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date navigator and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Date picker button group */}
          <div className="flex items-center justify-between sm:justify-start border border-border bg-card rounded-md h-9 w-full sm:w-auto shrink-0 p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrevDay}
              title="Previous Day"
              className="text-muted-foreground hover:text-foreground"
            >
              <CaretLeft size={14} />
            </Button>

            <div className="flex flex-1 sm:flex-none justify-center items-center h-full px-1 border-x border-border">
              <DatePickerPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleNextDay}
              title="Next Day"
              className="text-muted-foreground hover:text-foreground"
            >
              <CaretRight size={14} />
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Today button */}
            <Button
              variant={selectedDate === todayStr ? 'default' : 'outline'}
              size="sm"
              onClick={handleSetToday}
              title="Today"
            >
              Today
            </Button>

            {/* Show All button */}
            <Button
              variant={selectedDate === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={handleSetAll}
              title="Show All Dates"
            >
              Show All
            </Button>
          </div>
        </div>

        {/* Brain dump / activity sorter */}
        <Button variant="outline" size="sm" onClick={onOpenBrainDump} className="gap-2">
          <Sparkle size={15} className="text-primary" weight="fill" />
          <span>Import Activity</span>
        </Button>

        {/* Accountability share */}
        <Button variant="ghost" size="sm" onClick={onOpenAccountability} className="gap-2">
          <ShareNetwork size={15} weight="bold" />
          <span>Share Update</span>
        </Button>
      </div>
    </Card>
  );
}
