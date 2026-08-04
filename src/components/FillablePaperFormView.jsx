import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CONTACT_TYPES, MEETING_TYPES, getDefaultFollowUpForContactType, getDefaultFollowUpForMeetingType, calculateFollowUpDate } from '../utils/followUpRules';
import InstructionsPopover from './InstructionsPopover';
import DatePickerPopover from './DatePickerPopover';
import { FileText, Plus, Trash2, X } from 'lucide-react';

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
    addTarget,
    deleteTarget
  } = useTracker();

  const [newTargetInput, setNewTargetInput] = useState('');

  // Ensure 15 slots for Resources
  const resourceSlots = Array.from({ length: 15 }, (_, i) => resources[i] || null);

  // Ensure 10 slots for Contacts
  const contactSlots = Array.from({ length: 10 }, (_, i) => contacts[i] || null);

  // Ensure 2 slots for Meetings
  const meetingSlots = Array.from({ length: 2 }, (_, i) => meetings[i] || null);

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

  const handleAddTargetSubmit = (e) => {
    e.preventDefault();
    if (newTargetInput.trim()) {
      addTarget(newTargetInput.trim());
      setNewTargetInput('');
    }
  };

  // Filter out items with empty names for slot counts
  const filledResourceCount = resources.filter(r => r && r.name && r.name.trim()).length;
  const filledContactCount = contacts.filter(c => c && c.name && c.name.trim()).length;
  const filledMeetingCount = meetings.filter(m => m && m.name && m.name.trim()).length;

  // Calculate first empty slot indices for sequential unlocking
  const firstEmptyResIdx = resourceSlots.findIndex(r => !r || !r.name || !r.name.trim());
  const effectiveEmptyResIdx = firstEmptyResIdx === -1 ? 15 : firstEmptyResIdx;

  const firstEmptyConIdx = contactSlots.findIndex(c => !c || !c.name || !c.name.trim());
  const effectiveEmptyConIdx = firstEmptyConIdx === -1 ? 10 : firstEmptyConIdx;

  const firstEmptyMtgIdx = meetingSlots.findIndex(m => !m || !m.name || !m.name.trim());
  const effectiveEmptyMtgIdx = firstEmptyMtgIdx === -1 ? 2 : firstEmptyMtgIdx;

  return (
    <div className="section-card" style={{ background: '#ffffff', color: '#0f172a', padding: '1.5rem', border: '2px solid #0f172a' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={24} color="#0f172a" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: '#0f172a' }}>
              Daily Activity Tracking Form (Fillable)
            </h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>Form PD10048654 • Fill slots consecutively in order</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Instructions Info Popover */}
          <InstructionsPopover />

          {/* Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '16px' }}>
            <span>Date:</span>
            <DatePickerPopover selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
        </div>
      </div>

      {/* Date-locked container wrapper */}
      <div style={{ position: 'relative' }}>
        {selectedDate === 'ALL' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{
              background: '#ffffff',
              border: '2px solid #0f172a',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔒</span>
              <h4 style={{ fontWeight: 800, margin: '0 0 0.5rem 0', textTransform: 'uppercase', color: '#0f172a' }}>Daily Form Locked</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.4, fontWeight: 400 }}>
                You are viewing activity records across <strong>All Dates</strong> combined. To edit or fill daily slot records, select a specific date first.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Go to Today's Form
              </button>
            </div>
          </div>
        )}

      {/* 15 Daily Resources Identified Box */}
      <div style={{ border: '1px solid #0f172a', padding: '0.85rem', marginBottom: '1.25rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
            Daily Resources Identified (Goal: 15)
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>{filledResourceCount} / 15 slots filled</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.4rem' }}>
          {resourceSlots.map((res, i) => {
            const hasData = res && res.name && res.name.trim();
            const isSlotDisabled = !hasData && i > effectiveEmptyResIdx;
            
            return (
              <div
                key={`res_slot_${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: isSlotDisabled ? '#f1f5f9' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '0.2rem 0.4rem',
                  opacity: isSlotDisabled ? 0.55 : 1,
                  cursor: isSlotDisabled ? 'not-allowed' : 'default'
                }}
                title={isSlotDisabled ? `Complete empty Resource #${effectiveEmptyResIdx + 1} first` : 'e.g. Ancestry Careers, LinkedIn Alumni Search, Chamber Directory'}
              >
                <span style={{ fontWeight: 600, fontSize: '16px', color: isSlotDisabled ? '#94a3b8' : '#64748b', width: '22px' }}>{i + 1}.</span>
                <input
                  type="text"
                  className="cell-input"
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
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Contacts (Goal: 10)
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>{filledContactCount} / 10 contacts</span>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a', fontSize: '16px' }} aria-label="Contacts Form Table">
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '30px' }}>#</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '170px' }}>Contact name</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '140px' }}>Organization</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '170px' }}>Email / Phone / LinkedIn</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left' }}>Comments</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '150px' }}>Kind of contact</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '130px' }}>Follow-up date</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'center', width: '44px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contactSlots.map((c, i) => {
                const hasData = c && c.name && c.name.trim();
                const isContactDisabled = !hasData && i > effectiveEmptyConIdx;

                return (
                  <tr
                    key={`contact_slot_${i}`}
                    style={{
                      background: hasData ? '#ffffff' : '#fafafa',
                      opacity: isContactDisabled ? 0.55 : 1,
                      cursor: isContactDisabled ? 'not-allowed' : 'default'
                    }}
                    title={isContactDisabled ? `Complete empty Contact #${effectiveEmptyConIdx + 1} first` : ''}
                  >
                    <td style={{ border: '1px solid #0f172a', padding: '0.4rem', fontWeight: 600, color: isContactDisabled ? '#94a3b8' : '#64748b', textAlign: 'center', fontSize: '16px' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} name`}
                        placeholder=""
                        value={c ? c.name : ''}
                        onChange={(e) => handleContactChange(i, 'name', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} organization`}
                        placeholder=""
                        value={c ? c.organization : ''}
                        onChange={(e) => handleContactChange(i, 'organization', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} email, phone, or LinkedIn`}
                        placeholder=""
                        value={c ? c.emailPhone : ''}
                        onChange={(e) => handleContactChange(i, 'emailPhone', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} comments`}
                        placeholder=""
                        value={c ? c.comments : ''}
                        onChange={(e) => handleContactChange(i, 'comments', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <select
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} kind of contact`}
                        style={{ fontWeight: 600, color: isContactDisabled ? '#94a3b8' : '#1d4ed8' }}
                        value={c ? c.kindOfContact : 'Network Call'}
                        onChange={(e) => handleContactChange(i, 'kindOfContact', e.target.value)}
                      >
                        {CONTACT_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="date"
                        className="cell-input"
                        disabled={isContactDisabled}
                        aria-label={`Contact ${i + 1} follow up date`}
                        style={{ fontWeight: 600, color: isContactDisabled ? '#94a3b8' : '#1d4ed8' }}
                        value={c ? c.followUpDate : ''}
                        onChange={(e) => handleContactChange(i, 'followUpDate', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.2rem', textAlign: 'center' }}>
                      {hasData && (
                        <button
                          type="button"
                          aria-label={`Delete contact ${c.name}`}
                          onClick={() => deleteContact(c.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', minWidth: '36px', minHeight: '36px' }}
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
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Face-to-Face Meetings (Goal: 2)
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>{filledMeetingCount} / 2 meetings</span>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a', fontSize: '16px' }} aria-label="Meetings Form Table">
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '30px' }}>#</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '170px' }}>Contact name</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '140px' }}>Organization</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '170px' }}>Email / Phone / LinkedIn</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left' }}>Comments</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '170px' }}>Kind of meeting</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'left', width: '130px' }}>Follow-up date</th>
                <th style={{ border: '1px solid #0f172a', padding: '0.5rem', textAlign: 'center', width: '44px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {meetingSlots.map((m, i) => {
                const hasData = m && m.name && m.name.trim();
                const isMeetingDisabled = !hasData && i > effectiveEmptyMtgIdx;

                return (
                  <tr
                    key={`meeting_slot_${i}`}
                    style={{
                      background: hasData ? '#ffffff' : '#fafafa',
                      opacity: isMeetingDisabled ? 0.55 : 1,
                      cursor: isMeetingDisabled ? 'not-allowed' : 'default'
                    }}
                    title={isMeetingDisabled ? `Complete empty Meeting #${effectiveEmptyMtgIdx + 1} first` : ''}
                  >
                    <td style={{ border: '1px solid #0f172a', padding: '0.4rem', fontWeight: 600, color: isMeetingDisabled ? '#94a3b8' : '#64748b', textAlign: 'center', fontSize: '16px' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} contact name`}
                        placeholder=""
                        value={m ? m.name : ''}
                        onChange={(e) => handleMeetingChange(i, 'name', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} organization`}
                        placeholder=""
                        value={m ? m.organization : ''}
                        onChange={(e) => handleMeetingChange(i, 'organization', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} email, phone, or LinkedIn`}
                        placeholder=""
                        value={m ? m.emailPhone : ''}
                        onChange={(e) => handleMeetingChange(i, 'emailPhone', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="text"
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} notes`}
                        placeholder=""
                        value={m ? m.comments : ''}
                        onChange={(e) => handleMeetingChange(i, 'comments', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <select
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} kind of meeting`}
                        style={{ fontWeight: 600, color: isMeetingDisabled ? '#94a3b8' : '#6d28d9' }}
                        value={m ? m.kindOfMeeting : 'Informational Interview'}
                        onChange={(e) => handleMeetingChange(i, 'kindOfMeeting', e.target.value)}
                      >
                        {MEETING_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.15rem' }}>
                      <input
                        type="date"
                        className="cell-input"
                        disabled={isMeetingDisabled}
                        aria-label={`Meeting ${i + 1} follow up date`}
                        style={{ fontWeight: 600, color: isMeetingDisabled ? '#94a3b8' : '#1d4ed8' }}
                        value={m ? m.followUpDate : ''}
                        onChange={(e) => handleMeetingChange(i, 'followUpDate', e.target.value)}
                      />
                    </td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.2rem', textAlign: 'center' }}>
                      {hasData && (
                        <button
                          type="button"
                          aria-label={`Delete meeting ${m.name}`}
                          onClick={() => deleteMeeting(m.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', minWidth: '36px', minHeight: '36px' }}
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

      {/* Target Companies Footer Box with Interactive Add/Remove Tags */}
      <div style={{ border: '1px solid #0f172a', padding: '0.85rem', fontWeight: 600, fontSize: '16px', marginBottom: '0.75rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ textTransform: 'uppercase', color: '#0f172a', fontSize: '0.85rem', fontWeight: 800 }}>
          Target Companies:
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {targets.map(target => (
            <div
              key={target}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              <span>{target}</span>
              <button
                type="button"
                aria-label={`Remove target company ${target}`}
                onClick={() => deleteTarget(target)}
                style={{ background: 'transparent', border: 'none', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem', minWidth: '28px', minHeight: '28px' }}
                title={`Remove ${target}`}
              >
                <X size={15} />
              </button>
            </div>
          ))}

          <form onSubmit={handleAddTargetSubmit} style={{ display: 'inline-flex', gap: '0.35rem' }}>
            <input
              type="text"
              aria-label="Add new target company"
              placeholder="+ Add Target Company"
              style={{ padding: '0.4rem 0.65rem', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', background: '#ffffff', minHeight: '44px', fontWeight: 400 }}
              value={newTargetInput}
              onChange={(e) => setNewTargetInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" aria-label="Submit new target company" style={{ padding: '0.4rem 0.75rem', fontSize: '16px' }}>
              <Plus size={16} />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      </div> {/* Closing the Date-locked container wrapper */}

      {/* Official Form Metadata Footer */}
      <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', fontWeight: 400 }}>
        © 2013 by Intellectual Reserve, Inc. All rights reserved. Printed in the USA. English approval: 6/13 PD10048654
      </div>
    </div>
  );
}
