import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CONTACT_TYPES, MEETING_TYPES, getDefaultFollowUpForContactType, getDefaultFollowUpForMeetingType, calculateFollowUpDate } from '../utils/followUpRules';
import InstructionsPopover from './InstructionsPopover';
import DatePickerPopover from './DatePickerPopover';
import { FileText, Plus, Trash2, X } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SM_PRIMARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-blue text-white hover:bg-blue-700`;

const CELL_INPUT = "border border-transparent rounded-[4px] bg-transparent p-[0.35rem_0.5rem] w-full font-body text-[16px] text-text-primary outline-none hover:bg-slate-100 hover:border-slate-300 focus:bg-white! focus:border-accent-blue! focus:outline-2 focus:outline-accent-blue! focus:outline-offset-1 focus:text-[#0f172a]";

export default function FillablePaperFormView() {
  const {
    selectedDate,
    setSelectedDate,
    resources,
    contacts,
    meetings,
    targets,
    updateResourceSlot,
    deleteResource,
    updateContactSlot,
    deleteContact,
    updateMeetingSlot,
    deleteMeeting,
    updateTargetSlot,
    deleteTarget
  } = useTracker();

  const [newTargetInput, setNewTargetInput] = useState('');

  // Ensure 15 slots for Resources
  const resourceSlots = Array.from({ length: 15 }, (_, i) => resources[i] || null);

  // Ensure 10 slots for Contacts
  const contactSlots = Array.from({ length: 10 }, (_, i) => contacts[i] || null);

  // Ensure 2 slots for Meetings
  const meetingSlots = Array.from({ length: 2 }, (_, i) => meetings[i] || null);

  // Ensure 5 slots for Targets
  const targetSlots = Array.from({ length: 5 }, (_, i) => targets[i] || null);

  const handleResourceChange = (index, field, value) => {
    updateResourceSlot(index, { [field]: value });
  };

  const handleContactChange = (index, field, value) => {
    if (field === 'kindOfContact') {
      const days = getDefaultFollowUpForContactType(value);
      const autoFollowUp = calculateFollowUpDate(days);
      updateContactSlot(index, { [field]: value, followUpDate: autoFollowUp });
    } else {
      updateContactSlot(index, { [field]: value });
    }
  };

  const handleMeetingChange = (index, field, value) => {
    if (field === 'kindOfMeeting') {
      const days = getDefaultFollowUpForMeetingType(value);
      const autoFollowUp = calculateFollowUpDate(days);
      updateMeetingSlot(index, { [field]: value, followUpDate: autoFollowUp });
    } else {
      updateMeetingSlot(index, { [field]: value });
    }
  };

  const handleTargetChange = (index, field, value) => {
    updateTargetSlot(index, { [field]: value });
  };

  // Filter out items with empty names for slot counts
  const filledResourceCount = resources.filter(r => r && r.name && r.name.trim()).length;
  const filledContactCount = contacts.filter(c => c && c.name && c.name.trim()).length;
  const filledMeetingCount = meetings.filter(m => m && m.name && m.name.trim()).length;
  const filledTargetCount = targets.filter(t => t && (t.name ? t.name.trim() : (typeof t === 'string' && t.trim()))).length;

  // Calculate first empty slot indices for sequential unlocking
  const firstEmptyResIdx = resourceSlots.findIndex(r => !r || !r.name || !r.name.trim());
  const effectiveEmptyResIdx = firstEmptyResIdx === -1 ? 15 : firstEmptyResIdx;

  const firstEmptyConIdx = contactSlots.findIndex(c => !c || !c.name || !c.name.trim());
  const effectiveEmptyConIdx = firstEmptyConIdx === -1 ? 10 : firstEmptyConIdx;

  const firstEmptyMtgIdx = meetingSlots.findIndex(m => !m || !m.name || !m.name.trim());
  const effectiveEmptyMtgIdx = firstEmptyMtgIdx === -1 ? 2 : firstEmptyMtgIdx;

  const firstEmptyTargetIdx = targetSlots.findIndex(t => !t || (!t.name && typeof t !== 'string') || (t.name ? !t.name.trim() : !t.trim()));
  const effectiveEmptyTargetIdx = firstEmptyTargetIdx === -1 ? 5 : firstEmptyTargetIdx;

  return (
    <div className="bg-white rounded-lg p-6 shadow-card transition-all duration-150 border-2 border-[#0f172a] text-[#0f172a]">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-2.5 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText size={24} color="#0f172a" />
          <div>
            <h2 className="text-[1.25rem] font-extrabold uppercase m-0 text-[#0f172a]">
              Daily Activity Tracking Form (Fillable)
            </h2>
            <span className="text-[0.85rem] font-normal text-slate-500">Form PD10048654 • Fill slots consecutively in order</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Instructions Info Popover */}
          <InstructionsPopover />

          {/* Date Selector */}
          <div className="flex items-center gap-1.5 font-semibold text-[16px]">
            <span>Date:</span>
            <DatePickerPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
        </div>
      </div>

      {/* Date-locked container wrapper */}
      <div className="relative">
        {selectedDate === 'ALL' && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[3px] z-10 flex items-center justify-center rounded-[4px] border border-slate-300">
            <div className="bg-white border-2 border-[#0f172a] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] p-6 rounded-lg text-center max-w-[400px]">
              <span className="text-[2rem] block mb-2">🔒</span>
              <h4 className="font-extrabold m-[0_0_0.5rem_0] uppercase text-[#0f172a]">Daily Form Locked</h4>
              <p className="text-[0.8rem] text-slate-500 m-[0_0_1rem_0] leading-relaxed font-normal">
                You are viewing activity records across <strong>All Dates</strong> combined. To edit or fill daily slot records, select a specific date first.
              </p>
              <button 
                type="button" 
                className={BTN_PRIMARY}
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Go to Today's Form
              </button>
            </div>
          </div>
        )}

      {/* 15 Daily Resources Identified Box */}
      <div className="border border-[#0f172a] p-3.5 mb-5 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[0.9rem] font-extrabold text-[#0f172a] uppercase">
            Daily Resources Identified (Goal: 15)
          </h3>
          <span className="text-[0.85rem] text-slate-500 font-normal">{filledResourceCount} / 15 slots filled</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-1.5">
          {resourceSlots.map((res, i) => {
            const hasData = res && res.name && res.name.trim();
            const isSlotDisabled = !hasData && i > effectiveEmptyResIdx;
            
            return (
              <div
                key={`res_slot_${i}`}
                className={`flex items-center gap-1.5 border border-slate-300 rounded-[4px] p-[0.2rem_0.4rem] ${
                  isSlotDisabled ? 'bg-slate-100 opacity-55 cursor-not-allowed' : 'bg-white opacity-100 cursor-default'
                }`}
                title={isSlotDisabled ? `Complete empty Resource #${effectiveEmptyResIdx + 1} first` : 'e.g. Ancestry Careers, LinkedIn Alumni Search, Chamber Directory'}
              >
                <span className={`font-semibold text-[16px] w-5.5 ${isSlotDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}.</span>
                <input
                  type="text"
                  className={CELL_INPUT}
                  disabled={isSlotDisabled}
                  aria-label={`Resource Slot #${i + 1}`}
                  placeholder=""
                  title={isSlotDisabled ? `Complete empty Resource #${effectiveEmptyResIdx + 1} first` : 'e.g. Ancestry Careers, LinkedIn Alumni Search, Chamber Directory'}
                  value={res ? res.name : ''}
                  onChange={(e) => handleResourceChange(i, 'name', e.target.value)}
                />
                {hasData && (
                  <button
                    type="button"
                    aria-label={`Delete resource slot #${i + 1}`}
                    onClick={() => deleteResource(res.id)}
                    className="bg-transparent border-none text-red-500 cursor-pointer p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-sm hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contacts Table Section (10 Slots) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5 border-b-2 border-[#0f172a] pb-1">
          <h3 className="text-[0.95rem] font-extrabold uppercase m-0">
            Contacts (Goal: 10)
          </h3>
          <span className="text-[0.85rem] text-slate-500 font-normal">{filledContactCount} / 10 contacts</span>
        </div>

        <div className="table-responsive">
          <table className="w-full border-collapse border border-[#0f172a] text-[16px]" aria-label="Contacts Form Table">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-[#0f172a] p-2 text-left w-[30px]">#</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Contact name</th>
                <th className="border border-[#0f172a] p-2 text-left w-[140px]">Organization</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Email / Phone / LinkedIn</th>
                <th className="border border-[#0f172a] p-2 text-left">Comments</th>
                <th className="border border-[#0f172a] p-2 text-left w-[150px]">Kind of contact</th>
                <th className="border border-[#0f172a] p-2 text-left w-[130px]">Follow-up date</th>
                <th className="border border-[#0f172a] p-2 text-center w-[44px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {contactSlots.map((c, i) => {
                const hasData = c && c.name && c.name.trim();
                const isContactDisabled = !hasData && i > effectiveEmptyConIdx;

                return (
                  <tr
                    key={`contact_slot_${i}`}
                    className={`${hasData ? 'bg-white' : 'bg-[#fafafa]'} ${isContactDisabled ? 'opacity-55 cursor-not-allowed' : 'opacity-100 cursor-default'}`}
                    title={isContactDisabled ? `Complete empty Contact #${effectiveEmptyConIdx + 1} first` : ''}
                  >
                    <td className={`border border-[#0f172a] p-1.5 font-semibold text-center text-[16px] ${isContactDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} name`}
                        placeholder=""
                        value={c ? c.name : ''}
                        onChange={(e) => handleContactChange(i, 'name', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} organization`}
                        placeholder=""
                        value={c ? c.organization : ''}
                        onChange={(e) => handleContactChange(i, 'organization', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} email, phone, or LinkedIn`}
                        placeholder=""
                        value={c ? c.emailPhone : ''}
                        onChange={(e) => handleContactChange(i, 'emailPhone', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} comments`}
                        placeholder=""
                        value={c ? c.comments : ''}
                        onChange={(e) => handleContactChange(i, 'comments', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <select
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} kind of contact`}
                        className={`${CELL_INPUT} font-semibold ${isContactDisabled ? 'text-slate-400' : 'text-blue-700'}`}
                        value={c ? c.kindOfContact : 'Network Call'}
                        onChange={(e) => handleContactChange(i, 'kindOfContact', e.target.value)}
                      >
                        {CONTACT_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="date"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} follow up date`}
                        className={`${CELL_INPUT} font-semibold ${isContactDisabled ? 'text-slate-400' : 'text-blue-700'}`}
                        value={c ? c.followUpDate : ''}
                        onChange={(e) => handleContactChange(i, 'followUpDate', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-1 text-center">
                      {hasData && (
                        <button
                          type="button"
                          aria-label={`Delete contact ${c.name}`}
                          onClick={() => deleteContact(c.id)}
                          className="bg-transparent border-none text-red-500 cursor-pointer p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-sm hover:bg-red-50 mx-auto"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face-to-Face Meetings Section (2 Slots) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5 border-b-2 border-[#0f172a] pb-1">
          <h3 className="text-[0.95rem] font-extrabold uppercase m-0">
            Face-to-Face Meetings (Goal: 2)
          </h3>
          <span className="text-[0.85rem] text-slate-500 font-normal">{filledMeetingCount} / 2 meetings</span>
        </div>

        <div className="table-responsive">
          <table className="w-full border-collapse border border-[#0f172a] text-[16px]" aria-label="Meetings Form Table">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-[#0f172a] p-2 text-left w-[30px]">#</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Contact name</th>
                <th className="border border-[#0f172a] p-2 text-left w-[140px]">Organization</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Email / Phone / LinkedIn</th>
                <th className="border border-[#0f172a] p-2 text-left">Comments</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Kind of meeting</th>
                <th className="border border-[#0f172a] p-2 text-left w-[130px]">Follow-up date</th>
                <th className="border border-[#0f172a] p-2 text-center w-[44px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {meetingSlots.map((m, i) => {
                const hasData = m && m.name && m.name.trim();
                const isMeetingDisabled = !hasData && i > effectiveEmptyMtgIdx;

                return (
                  <tr
                    key={`meeting_slot_${i}`}
                    className={`${hasData ? 'bg-white' : 'bg-[#fafafa]'} ${isMeetingDisabled ? 'opacity-55 cursor-not-allowed' : 'opacity-100 cursor-default'}`}
                    title={isMeetingDisabled ? `Complete empty Meeting #${effectiveEmptyMtgIdx + 1} first` : ''}
                  >
                    <td className={`border border-[#0f172a] p-1.5 font-semibold text-center text-[16px] ${isMeetingDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} contact name`}
                        placeholder=""
                        value={m ? m.name : ''}
                        onChange={(e) => handleMeetingChange(i, 'name', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} organization`}
                        placeholder=""
                        value={m ? m.organization : ''}
                        onChange={(e) => handleMeetingChange(i, 'organization', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} email, phone, or LinkedIn`}
                        placeholder=""
                        value={m ? m.emailPhone : ''}
                        onChange={(e) => handleMeetingChange(i, 'emailPhone', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} notes`}
                        placeholder=""
                        value={m ? m.comments : ''}
                        onChange={(e) => handleMeetingChange(i, 'comments', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <select
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} kind of meeting`}
                        className={`${CELL_INPUT} font-semibold ${isMeetingDisabled ? 'text-slate-400' : 'text-purple-700'}`}
                        value={m ? m.kindOfMeeting : 'Informational Interview'}
                        onChange={(e) => handleMeetingChange(i, 'kindOfMeeting', e.target.value)}
                      >
                        {MEETING_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="date"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} follow up date`}
                        className={`${CELL_INPUT} font-semibold ${isMeetingDisabled ? 'text-slate-400' : 'text-blue-700'}`}
                        value={m ? m.followUpDate : ''}
                        onChange={(e) => handleMeetingChange(i, 'followUpDate', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-1 text-center">
                      {hasData && (
                        <button
                          type="button"
                          aria-label={`Delete meeting ${m.name}`}
                          onClick={() => deleteMeeting(m.id)}
                          className="bg-transparent border-none text-red-500 cursor-pointer p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-sm hover:bg-red-50 mx-auto"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Companies Table Section (5 Slots) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5 border-b-2 border-[#0f172a] pb-1">
          <h3 className="text-[0.95rem] font-extrabold uppercase m-0">
            Target Companies (Goal: 5)
          </h3>
          <span className="text-[0.85rem] text-slate-500 font-normal">{filledTargetCount} / 5 companies</span>
        </div>

        <div className="table-responsive">
          <table className="w-full border-collapse border border-[#0f172a] text-[16px]" aria-label="Targets Form Table">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-[#0f172a] p-2 text-left w-[30px]">#</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Company Name</th>
                <th className="border border-[#0f172a] p-2 text-left w-[140px]">Website</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Summary</th>
                <th className="border border-[#0f172a] p-2 text-left w-[170px]">Contacts</th>
                <th className="border border-[#0f172a] p-2 text-left">Notes</th>
                <th className="border border-[#0f172a] p-2 text-center w-[44px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {targetSlots.map((t, i) => {
                const nameStr = t ? (t.name !== undefined ? t.name : t) : '';
                const hasData = typeof nameStr === 'string' && nameStr.trim().length > 0;
                const isTargetDisabled = !hasData && i > effectiveEmptyTargetIdx;
                const isStringTarget = typeof t === 'string';

                return (
                  <tr
                    key={`target_slot_${i}`}
                    className={`${hasData ? 'bg-white' : 'bg-[#fafafa]'} ${isTargetDisabled ? 'opacity-55 cursor-not-allowed' : 'opacity-100 cursor-default'}`}
                    title={isTargetDisabled ? `Complete empty Target #${effectiveEmptyTargetIdx + 1} first` : ''}
                  >
                    <td className={`border border-[#0f172a] p-1.5 font-semibold text-center text-[16px] ${isTargetDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{i + 1}</td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isTargetDisabled}
                        aria-label={`Target ${i + 1} company name`}
                        placeholder=""
                        value={nameStr}
                        onChange={(e) => handleTargetChange(i, 'name', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isTargetDisabled}
                        aria-label={`Target ${i + 1} website`}
                        placeholder=""
                        value={isStringTarget ? '' : (t ? t.website : '')}
                        onChange={(e) => handleTargetChange(i, 'website', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isTargetDisabled}
                        aria-label={`Target ${i + 1} summary`}
                        placeholder=""
                        value={isStringTarget ? '' : (t ? t.summary : '')}
                        onChange={(e) => handleTargetChange(i, 'summary', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isTargetDisabled}
                        aria-label={`Target ${i + 1} contacts`}
                        placeholder=""
                        value={isStringTarget ? '' : (t ? t.contacts : '')}
                        onChange={(e) => handleTargetChange(i, 'contacts', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-0.5">
                      <input
                        type="text"
                        className={CELL_INPUT}
                        disabled={isTargetDisabled}
                        aria-label={`Target ${i + 1} notes`}
                        placeholder=""
                        value={isStringTarget ? '' : (t ? t.notes : '')}
                        onChange={(e) => handleTargetChange(i, 'notes', e.target.value)}
                      />
                    </td>
                    <td className="border border-[#0f172a] p-1 text-center">
                      {hasData && (
                        <button
                          type="button"
                          aria-label={`Delete target ${nameStr}`}
                          onClick={() => deleteTarget(isStringTarget ? t : t.id)}
                          className="bg-transparent border-none text-red-500 cursor-pointer p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-sm hover:bg-red-50 mx-auto"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      </div> {/* Closing the Date-locked container wrapper */}

      {/* Official Form Metadata Footer */}
      <div className="text-[0.75rem] text-slate-500 text-right font-normal">
        © 2013 by Intellectual Reserve, Inc. All rights reserved. Printed in the USA. English approval: 6/13 PD10048654
      </div>
    </div>
  );
}
