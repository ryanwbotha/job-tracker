import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function InstructionsPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Form Instructions"
        className="gap-1.5"
      >
        <HelpCircle size={15} />
        <span>Form Instructions</span>
      </Button>

      {isOpen && (
        <Card
          className="absolute top-[calc(100%+8px)] right-0 w-[340px] p-4 z-50 text-xs leading-normal text-muted-foreground shadow-lg"
        >
          <div className="flex items-center justify-between mb-2 border-b border-border pb-1.5">
            <strong className="text-xs text-foreground font-bold">15-10-2 Form Guidance</strong>
            <Button variant="ghost" size="icon-xs" onClick={() => setIsOpen(false)} aria-label="Close Instructions">
              <X size={16} />
            </Button>
          </div>

          <ul className="pl-4 m-0 flex flex-col gap-1.5 list-disc">
            <li><strong>Contact name:</strong> Record the contact's full name.</li>
            <li><strong>Organization:</strong> Record company or organization name.</li>
            <li><strong>Email and phone:</strong> Record email address and cell/landline number.</li>
            <li><strong>Comments:</strong> Record conversation results, follow-up notes, or LinkedIn URLs.</li>
            <li><strong>Kind of contact:</strong> Application, résumé, thank-you note, employer call, network call, referral reachout.</li>
            <li><strong>Kind of meeting:</strong> Job interview or informational interview.</li>
            <li><strong>Follow-up date:</strong> Target date you will follow up with contact.</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
