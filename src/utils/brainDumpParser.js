import { calculateFollowUpDate, getDefaultFollowUpForContactType, getDefaultFollowUpForMeetingType } from './followUpRules';

/**
 * Parses chaotic text or voice note transcriptions into structured 15-10-2 categories:
 * - Resources
 * - Contacts (with auto follow-ups & LinkedIn links)
 * - Meetings
 * - Targets
 */
export function parseBrainDumpText(rawText) {
  if (!rawText || !rawText.trim()) {
    return { resources: [], contacts: [], meetings: [], targets: [] };
  }

  const lines = rawText
    .split(/\n|\. (?=[A-Z])/)
    .map(line => line.trim())
    .filter(line => line.length > 3);

  const parsedResources = [];
  const parsedContacts = [];
  const parsedMeetings = [];
  const parsedTargets = [];

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const linkedinRegex = /(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const linkedinMatch = line.match(linkedinRegex);
    const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';
    const emailMatch = line.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : '';

    // Check if line indicates a Meeting
    if (lower.includes('met ') || lower.includes('meeting') || lower.includes('interview') || lower.includes('coffee with') || lower.includes('zoom call')) {
      let kindOfMeeting = 'Informational Interview';
      if (lower.includes('job') || lower.includes('hiring manager')) {
        kindOfMeeting = 'Job Interview';
      } else if (lower.includes('coffee') || lower.includes('chat')) {
        kindOfMeeting = 'Networking Coffee / Call';
      }

      // Infer name
      const nameMatch = line.match(/(?:met|with|interviewed|talked to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      const name = nameMatch ? nameMatch[1] : `Meeting Contact ${parsedMeetings.length + 1}`;

      // Infer organization
      const orgMatch = line.match(/(?:at|from|company|with)\s+([A-Za-z0-9.]+(?:\.com)?)/i);
      let org = orgMatch ? orgMatch[1] : '';
      if (org.toLowerCase() === 'with' || org.toLowerCase() === 'at') org = 'Target Org';

      const days = getDefaultFollowUpForMeetingType(kindOfMeeting);
      parsedMeetings.push({
        id: 'bd_m_' + index,
        name,
        organization: org,
        emailPhone: email,
        linkedinUrl,
        comments: line,
        kindOfMeeting,
        followUpDate: calculateFollowUpDate(days),
        status: 'Upcoming'
      });
    }
    // Check if line indicates a Contact reachout
    else if (lower.includes('sent') || lower.includes('contacted') || lower.includes('messaged') || lower.includes('called') || lower.includes('emailed') || lower.includes('reached out') || lower.includes('spoke with') || linkedinUrl) {
      let kindOfContact = 'Network Call';
      if (lower.includes('applied') || lower.includes('application')) {
        kindOfContact = 'Application';
      } else if (lower.includes('resume') || lower.includes('résumé')) {
        kindOfContact = 'Résumé';
      } else if (lower.includes('thank')) {
        kindOfContact = 'Thank-you note';
      } else if (lower.includes('referral') || lower.includes('referred')) {
        kindOfContact = 'Referral Reachout';
      } else if (lower.includes('linkedin') || linkedinUrl) {
        kindOfContact = 'LinkedIn Message';
      } else if (lower.includes('friend') || lower.includes('family')) {
        kindOfContact = 'Friend/Family';
      } else if (lower.includes('coworker') || lower.includes('colleague') || lower.includes('ex-worker')) {
        kindOfContact = 'Former Coworker';
      } else if (lower.includes('group') || lower.includes('association') || lower.includes('networking group')) {
        kindOfContact = 'Networking Group';
      }

      // Infer name
      const nameMatch = line.match(/(?:sent|messaged|called|emailed|reached out to|spoke with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const name = nameMatch ? nameMatch[1] : `Contact Person ${parsedContacts.length + 1}`;

      // Infer org
      const orgMatch = line.match(/(?:at|from)\s+([A-Za-z0-9.]+(?:\.com)?)/i);
      const org = orgMatch ? orgMatch[1] : '';

      const days = getDefaultFollowUpForContactType(kindOfContact);
      parsedContacts.push({
        id: 'bd_c_' + index,
        name,
        organization: org,
        emailPhone: email,
        linkedinUrl,
        comments: line,
        kindOfContact,
        followUpDate: calculateFollowUpDate(days),
        status: 'Active'
      });
    }
    // Check if line indicates a Resource identified
    else if (lower.includes('found') || lower.includes('identified') || lower.includes('directory') || lower.includes('job board') || lower.includes('careers page') || lower.includes('list') || lower.includes('website') || lower.includes('portal')) {
      let category = 'Company Directory';
      if (lower.includes('association') || lower.includes('group')) {
        category = 'Professional Association';
      } else if (lower.includes('journal') || lower.includes('article')) {
        category = 'Industry Publication';
      } else if (lower.includes('employer') || lower.includes('careers')) {
        category = 'Target Employer';
      } else if (lower.includes('job board') || lower.includes('board')) {
        category = 'Job Board';
      }

      parsedResources.push({
        id: 'bd_r_' + index,
        name: line.length > 50 ? line.substring(0, 48) + '...' : line,
        category,
        notes: line
      });
    }
    // Default fallback line -> Treat as Resource or Target
    else {
      if (line.toUpperCase() === line && line.length < 25 && !line.includes(' ')) {
        parsedTargets.push(line.toUpperCase());
      } else {
        parsedResources.push({
          id: 'bd_r_' + index,
          name: line.length > 50 ? line.substring(0, 48) + '...' : line,
          category: 'General Notes',
          notes: line
        });
      }
    }
  });

  return {
    resources: parsedResources,
    contacts: parsedContacts,
    meetings: parsedMeetings,
    targets: parsedTargets
  };
}
