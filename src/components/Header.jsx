import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Target, Calendar, Share2, MailCheck, Mic } from 'lucide-react';

export default function Header({ onOpenAccountability, onOpenBrainDump, activeTab, setActiveTab }) {
  const { selectedDate, setSelectedDate } = useTracker();

  return (
    <header className="bg-bg-card p-5 rounded-md border border-border-color flex items-center justify-between flex-wrap gap-4 shadow-subtle mb-4 font-body">
      <div className="flex items-center gap-3">
        <div className="bg-accent-blue/8 text-accent-blue w-11 h-11 rounded-md flex items-center justify-center">
          <Target size={24} />
        </div>
        <div>
          <h1 className="text-[1.35rem] font-bold text-text-primary font-heading">Daily Activity Tracker</h1>
          <p className="text-[0.8rem] text-text-secondary">
            LDS 15-10-2 Job Search Practice • Auto Follow-ups, Voice Notes & Email Tracker
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Selector */}
        <div 
          className="flex items-center gap-2 bg-bg-elevated py-1.5 px-3 rounded-md border border-border-color cursor-pointer hover:bg-bg-card transition-colors date-wrapper-hack"
        >
          <Calendar size={15} color="var(--accent-blue)" />
          <input
            type="date"
            className="border-none bg-transparent p-0 w-auto font-semibold text-[0.85rem] text-text-primary focus:outline-none cursor-pointer date-input-hack"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Voice Note / Brain Dump button */}
        <button
          className="inline-flex items-center justify-center gap-2 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-border-color bg-bg-card text-text-primary hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85"
          onClick={onOpenBrainDump}
        >
          <Mic size={16} color="var(--accent-purple)" />
          <span>Voice / Text Brain Dump</span>
        </button>

        {/* Email Tracker trigger button */}
        <button
          className={`inline-flex items-center justify-center gap-2 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border cursor-pointer transition-all duration-150 active:opacity-85 ${
            activeTab === 'inbox'
              ? 'bg-accent-blue text-white border-transparent hover:bg-[#1d4ed8]'
              : 'bg-bg-card text-text-primary border-border-color hover:bg-bg-elevated'
          }`}
          onClick={() => setActiveTab(activeTab === 'inbox' ? 'tracker' : 'inbox')}
        >
          <MailCheck size={16} />
          <span>Email Tracker</span>
        </button>

        {/* Daily Accountability Update Button */}
        <button
          className="inline-flex items-center justify-center gap-2 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-transparent bg-accent-emerald text-white hover:bg-[#047857] cursor-pointer transition-all duration-150 active:opacity-85"
          onClick={onOpenAccountability}
        >
          <Share2 size={16} />
          <span>Accountability Update</span>
        </button>
      </div>
    </header>
  );
}
