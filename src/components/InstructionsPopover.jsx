import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_SM_BLUE = "inline-flex items-center justify-center gap-1.5 rounded-full border border-accent-blue/20 bg-accent-blue/10 px-4 py-1.5 text-xs font-semibold text-accent-blue shadow-sm transition-colors hover:bg-accent-blue/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/10 cursor-pointer";

export default function InstructionsPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={BTN_SM_BLUE}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Form Instructions"
      >
        <HelpCircle size={15} />
        <span>Form Instructions</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 w-[340px] bg-bg-card border border-border-color rounded-md p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] z-[100] text-[16px] leading-normal text-text-secondary animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-2 border-b border-border-color pb-1.5">
            <strong className="text-[16px] text-text-primary font-bold">15-10-2 Form Guidance</strong>
            <button onClick={() => setIsOpen(false)} aria-label="Close Instructions" className="border-none cursor-pointer text-text-muted p-1.5 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated hover:text-text-primary bg-transparent">
              <X size={16} />
            </button>
          </div>

          <ul className="pl-4.5 m-0 flex flex-col gap-1.5">
            <li><strong>Contact name:</strong> Record the contact's full name.</li>
            <li><strong>Organization:</strong> Record company or organization name.</li>
            <li><strong>Email and phone:</strong> Record email address and cell/landline number.</li>
            <li><strong>Comments:</strong> Record conversation results, follow-up notes, or LinkedIn URLs.</li>
            <li><strong>Kind of contact:</strong> Application, résumé, thank-you note, employer call, network call, referral reachout.</li>
            <li><strong>Kind of meeting:</strong> Job interview or informational interview.</li>
            <li><strong>Follow-up date:</strong> Target date you will follow up with contact.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
