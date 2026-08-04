import Dexie from 'dexie';

const db = new Dexie('JobSearchActivityTracker');

// Define tables and indexed properties
// Primary key is listed first, additional indexes follow
db.version(2).stores({
  contacts:  'id, date, status, followUpDate, organization, kindOfContact',
  meetings:  'id, date, status, followUpDate, organization, kindOfMeeting',
  resources: 'id, date, category',
  emails:    'id, date, analyzed',
  targets:   'name',
  history:   'id, date, timestamp, category',
  settings:  'key'
});

export default db;
