import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Building2, Plus, X } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated`;
const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";

export default function TargetCompanyList() {
  const { targets, addTarget, deleteTarget } = useTracker();
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTarget.trim()) {
      addTarget(newTarget.trim());
      setNewTarget('');
    }
  };

  return (
    <div className="section-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 size={22} color="var(--accent-amber)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">Target Organizations & Sectors</h3>
            <p className="text-[0.8rem] text-text-secondary">
              Primary companies and industries you are targeting for networking and applications.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        {targets.map(target => (
          <div
            key={target}
            className="inline-flex items-center gap-2 bg-amber-500/12 border border-amber-500/30 text-amber-500 px-3.5 py-2 rounded-lg font-bold text-[0.85rem] tracking-wider"
          >
            <span>{target}</span>
            <button
              onClick={() => deleteTarget(target)}
              className="bg-transparent border-none text-amber-500 cursor-pointer flex items-center p-0.5 hover:opacity-80"
              aria-label={`Remove target ${target}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="inline-flex gap-2">
          <input
            type="text"
            className={`${INPUT_FIELD} w-[200px] px-3.5 py-2 text-[0.85rem] min-h-[40px]`}
            placeholder="Add Target (e.g. FINTECHS)"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <button type="submit" className={BTN_SM_SECONDARY}>
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}
