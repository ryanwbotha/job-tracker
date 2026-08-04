export const CONTACT_TYPES = [
  { id: 'Application', label: 'Application Submitted', defaultDays: 7 },
  { id: 'Résumé', label: 'Résumé / CV Sent', defaultDays: 5 },
  { id: 'Slack / Discord Job Post', label: 'Slack / Discord Job Post', defaultDays: 2 },
  { id: 'Social Hiring Post', label: 'LinkedIn / X Hiring Post', defaultDays: 2 },
  { id: 'Hiring Manager DM', label: 'Hiring Manager DM', defaultDays: 2 },
  { id: 'Employee Job Poster', label: 'Employee Job Poster', defaultDays: 3 },
  { id: 'Recruiter Screen', label: 'Recruiter Call / Screen', defaultDays: 2 },
  { id: 'Employer Call', label: 'Direct Employer Call', defaultDays: 2 },
  { id: 'Network Call', label: 'Network Call / Chat', defaultDays: 3 },
  { id: 'Referral Reachout', label: 'Referral Reachout', defaultDays: 3 },
  { id: 'Alumni Outreach', label: 'Alumni Outreach', defaultDays: 3 },
  { id: 'LinkedIn Message', label: 'LinkedIn Message', defaultDays: 3 },
  { id: 'LinkedIn InMail', label: 'LinkedIn InMail', defaultDays: 3 },
  { id: 'Cold Email', label: 'Cold Email Pitch', defaultDays: 3 },
  { id: 'Mutual Intro', label: 'Mutual Connection Intro', defaultDays: 2 },
  { id: 'Community / Forum', label: 'Community / Tech Forum', defaultDays: 3 },
  { id: 'Event / Meetup Lead', label: 'Event / Meetup Lead', defaultDays: 3 },
  { id: 'Thank-you note', label: 'Thank-you Note', defaultDays: 3 },
  { id: 'Portfolio Pitch', label: 'Portfolio / Code Pitch', defaultDays: 4 },
];

export const MEETING_TYPES = [
  { id: 'Job Interview', label: 'Job Interview (1st/2nd/Final)', defaultDays: 2 },
  { id: 'Informational Interview', label: 'Informational Interview', defaultDays: 3 },
  { id: 'Networking Coffee / Call', label: 'Networking Coffee / Meetup', defaultDays: 3 },
];

/**
 * Calculates a follow up date string (YYYY-MM-DD) based on current date + offset days
 */
export function calculateFollowUpDate(daysToAdd = 3, baseDateString = null) {
  const baseDate = baseDateString ? new Date(baseDateString) : new Date();
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  return baseDate.toISOString().split('T')[0];
}

/**
 * Gets default follow up offset for a given contact type
 */
export function getDefaultFollowUpForContactType(typeId) {
  const found = CONTACT_TYPES.find(t => t.id === typeId);
  return found ? found.defaultDays : 3;
}

/**
 * Gets default follow up offset for a given meeting type
 */
export function getDefaultFollowUpForMeetingType(typeId) {
  const found = MEETING_TYPES.find(m => m.id === typeId);
  return found ? found.defaultDays : 3;
}

/**
 * Formats a YYYY-MM-DD date into friendly string e.g. "Jul 21 (Tue)"
 */
export function formatFriendlyDate(dateString) {
  if (!dateString) return 'No Date';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;
  
  const options = { month: 'short', day: 'numeric', weekday: 'short' };
  return date.toLocaleDateString('en-US', options);
}
