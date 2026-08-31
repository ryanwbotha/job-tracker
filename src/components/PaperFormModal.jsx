import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { FileText } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

export default function PaperFormModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();

  // Pad resources array to 15 slots matching paper sheet
  const resourceSlots = Array.from({ length: 15 }, (_, i) => resources[i] || null);

  // Pad contacts array to 10 slots matching paper sheet
  const contactSlots = Array.from({ length: 10 }, (_, i) => contacts[i] || null);

  // Pad meetings array to 2 slots matching paper sheet
  const meetingSlots = Array.from({ length: 2 }, (_, i) => meetings[i] || null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[960px] max-h-[90vh] overflow-y-auto w-[95%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <FileText className="text-blue-500" size={24} weight="fill" />
            Official 15-10-2 Paper Form Web Replica
          </DialogTitle>
          <DialogDescription className="sr-only">
            A digital replica of the physical tracking form
          </DialogDescription>
        </DialogHeader>

        {/* Paper Sheet Container (Mirrors Form PD10048654) */}
        <div className="border-2 border-slate-900 p-5 font-sans text-[0.825rem] bg-white text-slate-900 mt-2">
          {/* Paper Title Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-3">
            <h2 className="text-[1.35rem] font-extrabold uppercase tracking-wide m-0 text-slate-900">
              Daily Activity Tracking Form
            </h2>
            <div className="text-[0.8rem] font-bold text-slate-600">
              PD10048654
            </div>
          </div>

          {/* Date Row */}
          <div className="border-b border-slate-900 pb-1.5 mb-3 font-bold">
            Date: <span className="underline text-blue-700">{selectedDate}</span>
          </div>

          {/* Instructions & Daily Resources Identified Split Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-900 mb-4">
            {/* Left Instructions Box */}
            <div className="p-2.5 md:border-r border-b md:border-b-0 border-slate-900 bg-bg-elevated">
              <h4 className="text-[0.85rem] font-extrabold mb-1.5">Instructions</h4>
              <ul className="pl-4.5 m-0 leading-relaxed text-[0.775rem] text-slate-700 list-disc">
                <li><strong>Contact name:</strong> Record the contact's name.</li>
                <li><strong>Organization:</strong> Record company or organization name.</li>
                <li><strong>Email and phone:</strong> Record email address and phone number.</li>
                <li><strong>Comments:</strong> Record results, follow-up items, and LinkedIn links.</li>
                <li><strong>Kind of contact:</strong> Application, résumé, thank-you note, employer call, network call, referral reachout.</li>
                <li><strong>Kind of meeting:</strong> Job or informational interview.</li>
                <li><strong>Follow-up date:</strong> Record date that you will call/contact.</li>
              </ul>
            </div>

            {/* Right 15 Daily Resources Box */}
            <div className="p-2.5">
              <h4 className="text-[0.85rem] font-extrabold mb-1.5">Daily Resources Identified (Goal: 15)</h4>
              <div className="flex flex-col gap-1">
                {resourceSlots.map((res, i) => (
                  <div key={i} className="border-b border-slate-200 text-[0.75rem] py-0.5 flex gap-1.5 overflow-hidden">
                    <span className="font-bold text-slate-400 w-5 shrink-0">{i + 1}.</span>
                    <span className={`truncate ${res ? 'text-slate-900 font-semibold' : 'text-slate-300 font-normal'}`}>
                      {res ? `${res.name} (${res.category})` : '____________________________________________'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts Section (Goal: 10) */}
          <div className="mb-4 overflow-x-auto">
            <h3 className="text-[0.95rem] font-extrabold border-b-2 border-slate-900 pb-1 mb-1.5">
              Contacts Made (Goal: 10)
            </h3>
            <table className="w-full min-w-[600px] border-collapse border border-slate-900 text-[0.775rem]">
              <thead>
                <tr className="bg-secondary">
                  <th className="border border-slate-900 p-1.5 text-left">Contact name</th>
                  <th className="border border-slate-900 p-1.5 text-left">Organization</th>
                  <th className="border border-slate-900 p-1.5 text-left">Email / Phone / LinkedIn</th>
                  <th className="border border-slate-900 p-1.5 text-left">Comments</th>
                  <th className="border border-slate-900 p-1.5 text-left">Kind of contact</th>
                  <th className="border border-slate-900 p-1.5 text-left">Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {contactSlots.map((c, i) => (
                  <tr key={i}>
                    <td className="border border-slate-900 p-1.5 font-semibold break-words">{c ? c.name : ' '}</td>
                    <td className="border border-slate-900 p-1.5 break-words">{c ? c.organization : ' '}</td>
                    <td className="border border-slate-900 p-1.5 break-all">{c ? c.emailPhone : ' '}</td>
                    <td className="border border-slate-900 p-1.5 text-slate-600 break-words">{c ? c.comments : ' '}</td>
                    <td className="border border-slate-900 p-1.5 font-semibold break-words">{c ? c.kindOfContact : ' '}</td>
                    <td className="border border-slate-900 p-1.5 font-bold text-blue-700 whitespace-nowrap">{c ? formatFriendlyDate(c.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Face-to-Face Meetings Section (Goal: 2) */}
          <div className="mb-4 overflow-x-auto">
            <h3 className="text-[0.95rem] font-extrabold border-b-2 border-slate-900 pb-1 mb-1.5">
              Face-to-Face Meetings (Goal: 2)
            </h3>
            <table className="w-full min-w-[600px] border-collapse border border-slate-900 text-[0.775rem]">
              <thead>
                <tr className="bg-secondary">
                  <th className="border border-slate-900 p-1.5 text-left">Contact name</th>
                  <th className="border border-slate-900 p-1.5 text-left">Organization</th>
                  <th className="border border-slate-900 p-1.5 text-left">Email / Phone / LinkedIn</th>
                  <th className="border border-slate-900 p-1.5 text-left">Comments</th>
                  <th className="border border-slate-900 p-1.5 text-left">Kind of meeting</th>
                  <th className="border border-slate-900 p-1.5 text-left">Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {meetingSlots.map((m, i) => (
                  <tr key={i}>
                    <td className="border border-slate-900 p-1.5 font-semibold break-words">{m ? m.name : ' '}</td>
                    <td className="border border-slate-900 p-1.5 break-words">{m ? m.organization : ' '}</td>
                    <td className="border border-slate-900 p-1.5 break-all">{m ? m.emailPhone : ' '}</td>
                    <td className="border border-slate-900 p-1.5 text-slate-600 break-words">{m ? m.comments : ' '}</td>
                    <td className="border border-slate-900 p-1.5 font-semibold break-words">{m ? m.kindOfMeeting : ' '}</td>
                    <td className="border border-slate-900 p-1.5 font-bold text-blue-700 whitespace-nowrap">{m ? formatFriendlyDate(m.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Target Companies Footer Box */}
          <div className="border border-slate-900 p-2.5 font-bold text-[0.85rem] mb-3 bg-bg-elevated break-words">
            TARGET COMPANIES: <span className="text-blue-700">{targets.join(' • ') || 'ANCESTRY.COM • ADOBE.COM • FINTECHS'}</span>
          </div>

          {/* Official Copyright Footer Line */}
          <div className="text-[0.7rem] text-slate-500 text-right">
            © 2013 by Intellectual Reserve, Inc. All rights reserved. Printed in the USA. English approval: 6/13 PD10048654
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close Paper Form View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
