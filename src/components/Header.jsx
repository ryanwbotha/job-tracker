import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Target, Calendar, ShareNetwork, EnvelopeSimple, Microphone } from '@phosphor-icons/react';
import { Button } from './ui/button';

export default function Header({ onOpenAccountability, onOpenBrainDump, activeTab, setActiveTab }) {
  const { selectedDate, setSelectedDate } = useTracker();

  return (
    <header className="bg-card p-5 rounded-xl border flex items-center justify-between flex-wrap gap-4 shadow-sm mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary w-11 h-11 rounded-lg flex items-center justify-center">
          <Target size={24} weight="fill" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Activity Tracker</h1>
          <p className="text-sm text-muted-foreground">
            WhatsNext • Auto Follow-ups, Voice Notes & Email Tracker
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Selector */}
        <div 
          className="flex items-center gap-2 bg-secondary py-1.5 px-3 rounded-md border cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          <Calendar size={16} className="text-primary" />
          <input
            type="date"
            className="border-none bg-transparent p-0 w-auto font-semibold text-sm text-foreground focus:outline-none cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Voice Note / Brain Dump button */}
        <Button variant="outline" onClick={onOpenBrainDump}>
          <Microphone size={16} className="mr-2 text-primary" weight="fill" />
          Voice / Text Brain Dump
        </Button>

        {/* Email Tracker trigger button */}
        <Button 
          variant={activeTab === 'inbox' ? 'default' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'inbox' ? 'tracker' : 'inbox')}
        >
          <EnvelopeSimple size={16} className="mr-2" weight={activeTab === 'inbox' ? 'fill' : 'regular'} />
          Email Tracker
        </Button>

        {/* Daily Accountability Update Button */}
        <Button 
          variant="ghost"
          onClick={onOpenAccountability}
        >
          <ShareNetwork size={16} className="mr-2" weight="bold" />
          Accountability Update
        </Button>
      </div>
    </header>
  );
}
