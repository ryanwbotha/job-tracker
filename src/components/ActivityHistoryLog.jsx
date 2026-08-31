import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { History, Clock, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export default function ActivityHistoryLog() {
  const { history } = useTracker();

  return (
    <Card className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary"
        >
          <History size={17} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Activity History Log
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological log of all daily activity entries, outreach, meetings, and updates
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div
          className="py-12 flex flex-col items-center gap-2 text-center bg-muted/30 border border-dashed border-border rounded-lg"
        >
          <Activity size={24} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mt-1">
            No activity logged yet
          </p>
          <p className="text-xs text-muted-foreground">
            Start adding resources or contacts to see history appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 relative pl-5">
          {/* Timeline line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border"
          />

          {history.map((entry, index) => {
            return (
              <div
                key={entry.id || index}
                className="relative flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 border border-border rounded-lg"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[-21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                />

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="secondary">
                    {entry.category}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {entry.actionText}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0"
                >
                  <Clock size={11} />
                  <span>{entry.dateString || new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
