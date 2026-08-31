import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Copy, Check, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

export default function AccountabilityModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();
  const [copied, setCopied] = useState(false);

  const summaryText = `📅 *Daily 15-10-2 Job Search Accountability Update*
Date: ${selectedDate}

🎯 *Daily Numbers*:
- 🔍 Resources Identified: ${resources.length} / 15
- 👥 Contacts Made: ${contacts.length} / 10
- 🤝 Face-to-Face Meetings: ${meetings.length} / 2

👥 *Key Contacts & Auto Follow-ups*:
${contacts.map(c => `• ${c.name} (${c.organization || 'General'}) - ${c.kindOfContact} | Follow-up: ${formatFriendlyDate(c.followUpDate)}`).join('\n') || '• No contacts logged today yet.'}

🤝 *Face-to-Face Meetings*:
${meetings.map(m => `• ${m.name} (${m.organization || 'Org'}) - ${m.kindOfMeeting} | Follow-up: ${formatFriendlyDate(m.followUpDate)}`).join('\n') || '• No meetings logged today yet.'}

🏢 *Active Target Companies*: ${targets.join(', ')}

#15102JobSearch #Accountability #SelfReliance`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
              <Award size={17} />
            </div>
            <div>
              <DialogTitle>Daily Accountability Update</DialogTitle>
              <DialogDescription className="mt-0.5">
                Share your progress with your mentor or accountability group
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Summary box */}
        <div className="p-4 bg-muted/40 border border-border rounded-lg text-foreground font-mono text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
          {summaryText}
        </div>

        {/* Actions */}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Update Text'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
