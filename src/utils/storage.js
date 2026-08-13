import { db, auth } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import localDb from './db';

const getUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Caveman not logged in!");
  return user.uid;
};

// ============================================================
// Load: reads all data from Firestore for current user
// ============================================================

async function migrateFromDexieToFirestore() {
  try {
    const contactCount = await localDb.contacts.count();
    if (contactCount === 0) return; // Nothing to migrate or already migrated

    console.log("Migrating data from local IndexedDB to Firestore...");
    
    const [contacts, meetings, resources, emails, targets, history, settings] = await Promise.all([
      localDb.contacts.toArray(),
      localDb.meetings.toArray(),
      localDb.resources.toArray(),
      localDb.emails.toArray(),
      localDb.targets.toArray(),
      localDb.history.toArray(),
      localDb.settings.toArray()
    ]);

    // Put everything into Firestore
    for (const c of contacts) await putContact(c);
    for (const m of meetings) await putMeeting(m);
    for (const r of resources) await putResource(r);
    for (const e of emails) await putEmail(e);
    for (const t of targets) await putTarget(t);
    for (const h of history) await putHistoryEntry(h);
    for (const s of settings) await putSetting(s.key, s.value);

    // Clear local DB to prevent future migrations
    await Promise.all([
      localDb.contacts.clear(),
      localDb.meetings.clear(),
      localDb.resources.clear(),
      localDb.emails.clear(),
      localDb.targets.clear(),
      localDb.history.clear(),
      localDb.settings.clear()
    ]);
    
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

export async function loadTrackerData() {
  try {
    const userId = getUserId();
    
    // Check if migration is needed
    await migrateFromDexieToFirestore();
    
    // Fetch all collections for this user
    const fetchCollection = async (colName) => {
      const q = query(collection(db, colName), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const [contacts, meetings, resources, emails, targetsList, history, settingsList] = await Promise.all([
      fetchCollection('contacts'),
      fetchCollection('meetings'),
      fetchCollection('resources'),
      fetchCollection('emails'),
      fetchCollection('targets'),
      fetchCollection('history'),
      fetchCollection('settings')
    ]);

    const selectedDateSetting = settingsList.find(s => s.key === 'selectedDate');
    const selectedDate = selectedDateSetting ? selectedDateSetting.value : new Date().toISOString().split('T')[0];

    return {
      selectedDate,
      targets: targetsList,
      resources,
      contacts,
      meetings,
      emails,
      history
    };
  } catch (err) {
    console.error('Failed to load tracker data from Firestore:', err);
    return null;
  }
}

// ============================================================
// Granular write operations
// ============================================================

// --- Contacts ---
export async function putContact(contact) {
  const userId = getUserId();
  await setDoc(doc(db, 'contacts', contact.id), { ...contact, userId });
}
export async function updateContactInDb(id, fields) {
  await updateDoc(doc(db, 'contacts', id), fields);
}
export async function removeContact(id) {
  await deleteDoc(doc(db, 'contacts', id));
}

// --- Meetings ---
export async function putMeeting(meeting) {
  const userId = getUserId();
  await setDoc(doc(db, 'meetings', meeting.id), { ...meeting, userId });
}
export async function updateMeetingInDb(id, fields) {
  await updateDoc(doc(db, 'meetings', id), fields);
}
export async function removeMeeting(id) {
  await deleteDoc(doc(db, 'meetings', id));
}

// --- Resources ---
export async function putResource(resource) {
  const userId = getUserId();
  await setDoc(doc(db, 'resources', resource.id), { ...resource, userId });
}
export async function updateResourceInDb(id, fields) {
  await updateDoc(doc(db, 'resources', id), fields);
}
export async function removeResource(id) {
  await deleteDoc(doc(db, 'resources', id));
}

// --- Emails ---
export async function putEmail(email) {
  const userId = getUserId();
  await setDoc(doc(db, 'emails', email.id), { ...email, userId });
}

// --- Targets ---
export async function putTarget(targetObj) {
  const userId = getUserId();
  await setDoc(doc(db, 'targets', targetObj.id), { ...targetObj, userId });
}
export async function updateTargetInDb(id, fields) {
  await updateDoc(doc(db, 'targets', id), fields);
}
export async function removeTarget(id) {
  await deleteDoc(doc(db, 'targets', id));
}

// --- History ---
export async function putHistoryEntry(entry) {
  const userId = getUserId();
  await setDoc(doc(db, 'history', entry.id), { ...entry, userId });
}

// --- Settings ---
export async function putSetting(key, value) {
  const userId = getUserId();
  await setDoc(doc(db, 'settings', key + '_' + userId), { key, value, userId });
}

// ============================================================
// Export / Import (Dummy for now since data is in cloud)
// ============================================================
export async function exportAllData() {
  return await loadTrackerData();
}

export async function importAllData(jsonData) {
  console.log("Import disabled in Cloud Cave Mode!");
}
