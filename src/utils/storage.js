import db from './db';
import { calculateFollowUpDate } from './followUpRules';

const LEGACY_STORAGE_KEY = '15_10_2_JOB_SEARCH_TRACKER_V1';

const INITIAL_SEED_DATA = {
  selectedDate: new Date().toISOString().split('T')[0],
  targets: ['ANCESTRY.COM', 'ADOBE.COM', 'FINTECHS', 'WORKDAY', 'QUALTRICS'],
  resources: [
    { id: 'res_seed_1', name: 'Ancestry.com Careers Page & Engineering Directory', category: 'Company Directory', notes: 'Identified 5 software engineering job openings' },
    { id: 'res_seed_2', name: 'LDS Employment Services Network List', category: 'Network Community', notes: 'Local job networking group contact list' },
    { id: 'res_seed_3', name: 'LinkedIn Industry Group - Tech Talent Utah', category: 'Professional Association', notes: 'Found 10 active recruiter profiles' },
    { id: 'res_seed_4', name: 'Adobe Careers Portal', category: 'Target Employer', notes: 'Reviewing Senior Product Manager postings' },
    { id: 'res_seed_5', name: 'Fintech Industry Journal 2026 Digest', category: 'Industry Publication', notes: 'Top 20 growing financial tech startups' }
  ],
  contacts: [
    {
      id: 'c_seed_1',
      name: 'TYLER JENSEN',
      organization: 'Tech Network',
      emailPhone: 'tyler.jensen@example.com',
      linkedinUrl: 'https://linkedin.com/in/tyler-jensen-demo',
      comments: 'Introduced me to Dave North at Ancestry. Follow up next week.',
      kindOfContact: 'Network Call',
      followUpDate: calculateFollowUpDate(3),
      status: 'Active'
    },
    {
      id: 'c_seed_2',
      name: 'DAVE NORTH',
      organization: 'ANCESTRY.COM',
      emailPhone: 'd.north@ancestry.com',
      linkedinUrl: 'https://linkedin.com/in/dave-north-demo',
      comments: 'Tyler Jensen Connection. Discussed engineering opening.',
      kindOfContact: 'LinkedIn Message',
      followUpDate: calculateFollowUpDate(2),
      status: 'Active'
    },
    {
      id: 'c_seed_3',
      name: 'LEANNE',
      organization: 'Family / Network',
      emailPhone: 'leanne@example.org',
      linkedinUrl: '',
      comments: 'She has contacts in USA tech sector. Asking for introduction email.',
      kindOfContact: 'Referral Reachout',
      followUpDate: calculateFollowUpDate(4),
      status: 'Pending'
    },
    {
      id: 'c_seed_4',
      name: 'ELDER JAMES MARKHAM',
      organization: 'CHURCH MUSEUM ASSOC',
      emailPhone: 'jmarkham@church.org',
      linkedinUrl: '',
      comments: 'Sent updated résumé and asked for informational call.',
      kindOfContact: 'Résumé',
      followUpDate: calculateFollowUpDate(5),
      status: 'Active'
    },
    {
      id: 'c_seed_5',
      name: 'TONY HALL',
      organization: 'Fintech Solutions',
      emailPhone: 'tony.hall@fintech.io',
      linkedinUrl: 'https://linkedin.com/in/tonyhall-demo',
      comments: 'Connected on LinkedIn. Sent thank-you message.',
      kindOfContact: 'Thank-you note',
      followUpDate: calculateFollowUpDate(3),
      status: 'Completed'
    }
  ],
  meetings: [
    {
      id: 'm_seed_1',
      name: 'ROB JEX',
      organization: 'CHURCH EMPLOYMENT',
      emailPhone: 'rob.jex@church.org',
      linkedinUrl: 'https://linkedin.com/in/rob-jex-demo',
      comments: 'Face-to-face informational interview regarding self-reliance group leader opportunities.',
      kindOfMeeting: 'Informational Interview',
      followUpDate: calculateFollowUpDate(3),
      status: 'Completed'
    },
    {
      id: 'm_seed_2',
      name: 'ANGEL SHELBURNE',
      organization: 'ADOBE.COM',
      emailPhone: 'ashelburne@adobe.com',
      linkedinUrl: 'https://linkedin.com/in/angel-shelburne-demo',
      comments: 'Job interview with hiring manager for design team.',
      kindOfMeeting: 'Job Interview',
      followUpDate: calculateFollowUpDate(2),
      status: 'Upcoming'
    }
  ],
  emails: [
    {
      id: 'e_seed_1',
      sender: 'Dave North <d.north@ancestry.com>',
      subject: 'Re: Connection via Tyler Jensen / Ancestry Opportunity',
      date: '2026-07-21 14:20',
      body: `Hi Ryan,

Thanks for reaching out via Tyler Jensen! I would be glad to chat about opportunities here at Ancestry.com.
We have an opening on our product engineering team. Check out my LinkedIn profile (https://linkedin.com/in/dave-north-demo) and let me know if you have time for a 15-minute call on Thursday at 2 PM MT.

Best regards,
Dave North
Senior Engineering Manager | Ancestry.com`,
      analyzed: true,
      analysis: {
        contactName: 'Dave North',
        organization: 'ANCESTRY.COM',
        email: 'd.north@ancestry.com',
        linkedinUrl: 'https://linkedin.com/in/dave-north-demo',
        comments: 'AI Extracted: Warm response from Dave North at Ancestry. Invited to 15-min call Thursday 2 PM.',
        kindOfContact: 'Network Call',
        followUpDate: calculateFollowUpDate(2),
        sentiment: 'High Interest / Active Opportunity',
        sentimentBadge: 'badge-emerald'
      }
    }
  ]
};

// ============================================================
// Migration: localStorage → IndexedDB (one-time bridge)
// ============================================================

async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    console.log('📦 Found existing localStorage data. Migrating to IndexedDB...');

    const migrationDate = parsed.selectedDate || new Date().toISOString().split('T')[0];

    await db.transaction('rw',
      db.contacts, db.meetings, db.resources, db.emails,
      db.targets, db.history, db.settings,
      async () => {
        if (parsed.contacts?.length) {
          await db.contacts.bulkPut(parsed.contacts.map(c => ({ ...c, date: c.date || migrationDate })));
        }
        if (parsed.meetings?.length) {
          await db.meetings.bulkPut(parsed.meetings.map(m => ({ ...m, date: m.date || migrationDate })));
        }
        if (parsed.resources?.length) {
          await db.resources.bulkPut(parsed.resources.map(r => ({ ...r, date: r.date || migrationDate })));
        }
        if (parsed.emails?.length) {
          await db.emails.bulkPut(parsed.emails.map(e => ({ ...e, date: e.date || migrationDate })));
        }
        if (parsed.targets?.length) {
          await db.targets.bulkPut(parsed.targets.map(name => ({ name })));
        }
        if (parsed.history?.length) {
          await db.history.bulkPut(parsed.history.map(h => ({ ...h, date: h.date || migrationDate })));
        }
        if (parsed.selectedDate) {
          await db.settings.put({ key: 'selectedDate', value: parsed.selectedDate });
        }
      }
    );

    // NOTE: Old localStorage data is intentionally NOT deleted.
    // It stays as a backup until user explicitly confirms migration success.
    console.log('✅ Migration complete! Old localStorage data preserved as backup under key:', LEGACY_STORAGE_KEY);
    return parsed;
  } catch (err) {
    console.error('❌ Migration from localStorage failed:', err);
    return null;
  }
}

// ============================================================
// First-time seed (when no data exists anywhere)
// ============================================================

async function seedInitialData() {
  console.log('🌱 No existing data found. Seeding initial demo data...');
  const seed = INITIAL_SEED_DATA;
  const seedDate = new Date().toISOString().split('T')[0];

  await db.transaction('rw',
    db.contacts, db.meetings, db.resources, db.emails,
    db.targets, db.settings,
    async () => {
      await db.contacts.bulkPut(seed.contacts.map(c => ({ ...c, date: c.date || seedDate })));
      await db.meetings.bulkPut(seed.meetings.map(m => ({ ...m, date: m.date || seedDate })));
      await db.resources.bulkPut(seed.resources.map(r => ({ ...r, date: r.date || seedDate })));
      await db.emails.bulkPut(seed.emails.map(e => ({ ...e, date: e.date || seedDate })));
      await db.targets.bulkPut(seed.targets.map(name => ({ name })));
      await db.settings.put({ key: 'selectedDate', value: seed.selectedDate });
    }
  );
}

// ============================================================
// Load: reads all data from IndexedDB into a single state object
// ============================================================

export async function loadTrackerData() {
  try {
    // Check if IndexedDB already has data
    const contactCount = await db.contacts.count();

    if (contactCount === 0) {
      // Try migrating from localStorage first
      const migrated = await migrateFromLocalStorage();

      if (!migrated) {
        // No localStorage data either — seed with demo data
        await seedInitialData();
      }
    }

    // Read all collections
    const [contacts, meetings, resources, emails, targetObjects, history, settings] = await Promise.all([
      db.contacts.toArray(),
      db.meetings.toArray(),
      db.resources.toArray(),
      db.emails.toArray(),
      db.targets.toArray(),
      db.history.toArray(),
      db.settings.toArray()
    ]);

    const selectedDate = settings.find(s => s.key === 'selectedDate')?.value
      || new Date().toISOString().split('T')[0];

    return {
      selectedDate,
      targets: targetObjects.map(t => t.name),
      resources,
      contacts,
      meetings,
      emails,
      history
    };
  } catch (err) {
    console.error('Failed to load tracker data from IndexedDB:', err);
    // Last resort fallback
    return {
      ...INITIAL_SEED_DATA,
      history: []
    };
  }
}

// ============================================================
// Granular write operations (called per-action, not bulk)
// ============================================================

// --- Contacts ---
export async function putContact(contact) {
  await db.contacts.put(contact);
}

export async function updateContactInDb(id, fields) {
  await db.contacts.update(id, fields);
}

export async function removeContact(id) {
  await db.contacts.delete(id);
}

// --- Meetings ---
export async function putMeeting(meeting) {
  await db.meetings.put(meeting);
}

export async function updateMeetingInDb(id, fields) {
  await db.meetings.update(id, fields);
}

export async function removeMeeting(id) {
  await db.meetings.delete(id);
}

// --- Resources ---
export async function putResource(resource) {
  await db.resources.put(resource);
}

export async function updateResourceInDb(id, fields) {
  await db.resources.update(id, fields);
}

export async function removeResource(id) {
  await db.resources.delete(id);
}

// --- Emails ---
export async function putEmail(email) {
  await db.emails.put(email);
}

// --- Targets ---
export async function putTarget(targetObj) {
  await db.targets.put(targetObj);
}

export async function removeTarget(name) {
  await db.targets.delete(name);
}

// --- History ---
export async function putHistoryEntry(entry) {
  await db.history.put(entry);
}

// --- Settings ---
export async function putSetting(key, value) {
  await db.settings.put({ key, value });
}

// ============================================================
// Export / Import (manual backup before cloud sync exists)
// ============================================================

export async function exportAllData() {
  const [contacts, meetings, resources, emails, targetObjects, history, settings] = await Promise.all([
    db.contacts.toArray(),
    db.meetings.toArray(),
    db.resources.toArray(),
    db.emails.toArray(),
    db.targets.toArray(),
    db.history.toArray(),
    db.settings.toArray()
  ]);

  return {
    selectedDate: settings.find(s => s.key === 'selectedDate')?.value || new Date().toISOString().split('T')[0],
    targets: targetObjects.map(t => t.name),
    resources,
    contacts,
    meetings,
    emails,
    history,
    exportedAt: new Date().toISOString()
  };
}

export async function importAllData(jsonData) {
  await db.transaction('rw',
    db.contacts, db.meetings, db.resources, db.emails,
    db.targets, db.history, db.settings,
    async () => {
      // Clear all tables
      await Promise.all([
        db.contacts.clear(),
        db.meetings.clear(),
        db.resources.clear(),
        db.emails.clear(),
        db.targets.clear(),
        db.history.clear(),
        db.settings.clear()
      ]);

      // Import data
      if (jsonData.contacts?.length) await db.contacts.bulkPut(jsonData.contacts);
      if (jsonData.meetings?.length) await db.meetings.bulkPut(jsonData.meetings);
      if (jsonData.resources?.length) await db.resources.bulkPut(jsonData.resources);
      if (jsonData.emails?.length) await db.emails.bulkPut(jsonData.emails);
      if (jsonData.targets?.length) {
        const targets = jsonData.targets.map(t => typeof t === 'string' ? { name: t } : t);
        await db.targets.bulkPut(targets);
      }
      if (jsonData.history?.length) await db.history.bulkPut(jsonData.history);
      if (jsonData.selectedDate) {
        await db.settings.put({ key: 'selectedDate', value: jsonData.selectedDate });
      }
    }
  );
}
