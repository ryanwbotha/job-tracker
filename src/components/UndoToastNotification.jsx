import React, { useEffect, useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { ArrowUUpLeft as RotateCcw, X } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

export default function UndoToastNotification() {
  const { lastDeleted, restoreLastDeleted, clearLastDeleted } = useTracker();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!lastDeleted) return;
    setTimeLeft(5);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          clearLastDeleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lastDeleted]);

  if (!lastDeleted) return null;

  const itemName = typeof lastDeleted.item === 'string'
    ? lastDeleted.item
    : (lastDeleted.item?.name || 'item');

  return (
    <Card className="fixed bottom-6 right-6 z-[200] border-border bg-popover text-popover-foreground shadow-lg min-w-[320px] flex flex-col gap-3 p-4 animate-in slide-in-from-right-8 fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Deleted <strong>{lastDeleted.type}</strong>{' '}
            <span className="text-muted-foreground">"{itemName}"</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-closing in {timeLeft}s
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={restoreLastDeleted}
            className="h-8 gap-1.5"
          >
            <RotateCcw size={14} weight="bold" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLastDeleted}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Countdown progress bar */}
      <Progress
        value={(timeLeft / 5) * 100}
        max={100}
        className="h-1"
      />
    </Card>
  );
}
