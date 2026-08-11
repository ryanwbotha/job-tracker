import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { X, FileText } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const CLOSE_BTN = "inline-flex items-center justify-center rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer border-none bg-transparent";

export default function PaperFormModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();

  if (!isOpen) return null;

  // Pad resources array to 15 slots matching paper sheet
  const resourceSlots = Array.from({ length: 15 }, (_, i) => resources[i] || null);

  // Pad contacts array to 10 slots matching paper sheet
  const contactSlots = Array.from({ length: 10 }, (_, i) => contacts[i] || null);

  // Pad meetings array to 2 slots matching paper sheet
  const meetingSlots = Array.from({ length: 2 }, (_, i) => meetings[i] || null);

  return (
    <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-5 animate-fadeIn" onClick={onClose}>
      <div className="bg-bg-card border border-border-color rounded-xl w-[95%] max-w-[960px] max-h-[90vh] overflow-y-auto p-7 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col gap-4.5 animate-fadeIn text-text-primary" onClick={(e) => e.stopPropagation()}>
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between border-b border-border-color pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <FileText color="var(--accent-blue)" size={22} />
            <h2 className="text-[1.2rem] font-bold text-text-primary">Official 15-10-2 Paper Form Web Replica</h2>
          </div>
          <button className={CLOSE_BTN} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Paper Sheet Container (Mirrors Form PD10048654) */}
        <div className="border-2 border-[#0f172a] p-5 font-sans text-[0.825rem] bg-white text-[#0f172a]">
          {/* Paper Title Header */}
          <div className="flex justify-between items-center border-b-2 border-[#0f172a] pb-2 mb-3">
            <h2 className="text-[1.35rem] font-extrabold uppercase tracking-wide m-0 text-[#0f172a]">
              Daily Activity Tracking Form
            </h2>
            <div className="text-[0.8rem] font-bold text-slate-600">
              PD10048654
            </div>
          </div>

          {/* Date Row */}
          <div className="border-b border-[#0f172a] pb-1.5 mb-3 font-bold">
            Date: <span className="underline text-blue-700">{selectedDate}</span>
          </div>

          {/* Instructions & Daily Resources Identified Split Section */}
          <div className="grid grid-cols-2 border border-[#0f172a] mb-4">
            {/* Left Instructions Box */}
            <div className="p-2.5 border-r border-[#0f172a] bg-slate-50">
              <h4 className="text-[0.85rem] font-extrabold mb-1.5">Instructions</h4>
              <ul className="pl-4.5 m-0 leading-relaxed text-[0.775rem] text-slate-700">
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
                  <div key={i} className="border-b border-slate-200 text-[0.75rem] py-0.5 flex gap-1.5">
                    <span className="font-bold text-slate-400 w-5">{i + 1}.</span>
                    <span className={res ? 'text-[#0f172a] font-semibold' : 'text-slate-300 font-normal'}>
                      {res ? `${res.name} (${res.category})` : '____________________________________________'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts Section (Goal: 10) */}
          <div className="mb-4">
            <h3 className="text-[0.95rem] font-extrabold border-b-2 border-[#0f172a] pb-1 mb-1.5">
              Contacts Made (Goal: 10)
            </h3>
            <table className="w-full border-collapse border border-[#0f172a] text-[0.775rem]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-[#0f172a] p-1.5 text-left">Contact name</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Organization</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Email / Phone / LinkedIn</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Comments</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Kind of contact</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {contactSlots.map((c, i) => (
                  <tr key={i}>
                    <td className="border border-[#0f172a] p-1.5 font-semibold">{c ? c.name : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5">{c ? c.organization : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5">{c ? c.emailPhone : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 text-slate-600">{c ? c.comments : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 font-semibold">{c ? c.kindOfContact : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 font-bold text-blue-700">{c ? formatFriendlyDate(c.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Face-to-Face Meetings Section (Goal: 2) */}
          <div className="mb-4">
            <h3 className="text-[0.95rem] font-extrabold border-b-2 border-[#0f172a] pb-1 mb-1.5">
              Face-to-Face Meetings (Goal: 2)
            </h3>
            <table className="w-full border-collapse border border-[#0f172a] text-[0.775rem]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-[#0f172a] p-1.5 text-left">Contact name</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Organization</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Email / Phone / LinkedIn</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Comments</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Kind of meeting</th>
                  <th className="border border-[#0f172a] p-1.5 text-left">Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {meetingSlots.map((m, i) => (
                  <tr key={i}>
                    <td className="border border-[#0f172a] p-1.5 font-semibold">{m ? m.name : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5">{m ? m.organization : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5">{m ? m.emailPhone : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 text-slate-600">{m ? m.comments : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 font-semibold">{m ? m.kindOfMeeting : ' '}</td>
                    <td className="border border-[#0f172a] p-1.5 font-bold text-blue-700">{m ? formatFriendlyDate(m.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Target Companies Footer Box */}
          <div className="border border-[#0f172a] p-2.5 font-bold text-[0.85rem] mb-3 bg-slate-50">
            TARGET COMPANIES: <span className="text-blue-700">{targets.join(' • ') || 'ANCESTRY.COM • ADOBE.COM • FINTECHS'}</span>
          </div>

          {/* Official Copyright Footer Line */}
          <div className="text-[0.7rem] text-slate-500 text-right">
            © 2013 by Intellectual Reserve, Inc. All rights reserved. Printed in the USA. English approval: 6/13 PD10048654
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="flex justify-end mt-4">
          <button className={BTN_SECONDARY} onClick={onClose}>Close Paper Form View</button>
        </div>
      </div>
    </div>
  );
}
