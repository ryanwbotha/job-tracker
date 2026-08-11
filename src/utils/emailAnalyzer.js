import { calculateFollowUpDate, getDefaultFollowUpForContactType } from './followUpRules';

/**
 * Analyzes an incoming email conversation thread from any networked contact
 * and extracts actionable contact metadata, sentiment, and follow-up recommendations.
 */
export function analyzeEmailInteraction(emailContent, senderHint = '', subject = '') {
  if (!emailContent || emailContent.trim() === '') {
    return null;
  }

  const content = emailContent.trim();
  
  // Extract email address pattern
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailsFound = content.match(emailRegex) || [];
  const contactEmail = emailsFound[0] || (senderHint.includes('@') ? senderHint : 'contact@company.com');

  // Extract LinkedIn URL pattern
  const linkedinRegex = /(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;
  const linkedinMatch = content.match(linkedinRegex);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : '';

  // Extract Name & Organization heuristic
  let contactName = 'Network Contact';
  let organization = 'Target Company';

  // Check From lines or Signatures
  const fromLineMatch = content.match(/From:\s*([^<\n]+)/i);
  if (fromLineMatch) {
    contactName = fromLineMatch[1].trim().replace(/"/g, '');
  } else if (senderHint) {
    contactName = senderHint.split('<')[0].replace(/"/g, '').trim();
  }

  // Attempt to infer organization from email domain or text
  if (contactEmail && !contactEmail.includes('gmail') && !contactEmail.includes('yahoo') && !contactEmail.includes('hotmail')) {
    const domainPart = contactEmail.split('@')[1];
    if (domainPart) {
      organization = domainPart.split('.')[0].toUpperCase() + '.COM';
    }
  }

  // Detect interaction type
  let kindOfContact = 'Network Call';
  let kindOfMeeting = null;
  let isMeeting = false;

  const lowerText = (content + ' ' + subject).toLowerCase();

  if (lowerText.includes('interview') || lowerText.includes('chat next week') || lowerText.includes('zoom link') || lowerText.includes('calendar invite')) {
    isMeeting = true;
    if (lowerText.includes('job') || lowerText.includes('role') || lowerText.includes('recruiter')) {
      kindOfMeeting = 'Job Interview';
    } else {
      kindOfMeeting = 'Informational Interview';
    }
  } else if (lowerText.includes('thank you') || lowerText.includes('thanks for connecting')) {
    kindOfContact = 'Thank-you note';
  } else if (lowerText.includes('application') || lowerText.includes('applied')) {
    kindOfContact = 'Application';
  } else if (lowerText.includes('referral') || lowerText.includes('referred')) {
    kindOfContact = 'Referral Reachout';
  } else if (lowerText.includes('linkedin') || lowerText.includes('connection request')) {
    kindOfContact = 'LinkedIn Message';
  } else if (lowerText.includes('call') || lowerText.includes('phone')) {
    kindOfContact = 'Employer Call';
  } else if (lowerText.includes('friend') || lowerText.includes('family')) {
    kindOfContact = 'Friend/Family';
  } else if (lowerText.includes('coworker') || lowerText.includes('colleague')) {
    kindOfContact = 'Former Coworker';
  } else if (lowerText.includes('group') || lowerText.includes('networking group')) {
    kindOfContact = 'Networking Group';
  }

  // Determine sentiment & interest level
  let sentiment = 'Positive / Warm';
  let sentimentBadge = 'badge-emerald';

  if (lowerText.includes('unfortunately') || lowerText.includes('not moving forward') || lowerText.includes('other candidates')) {
    sentiment = 'Rejected / Inactive';
    sentimentBadge = 'badge-rose';
  } else if (lowerText.includes('excited') || lowerText.includes('impressive') || lowerText.includes('love to meet') || lowerText.includes('next steps')) {
    sentiment = 'High Interest / Active Opportunity';
    sentimentBadge = 'badge-emerald';
  } else if (lowerText.includes('keep in touch') || lowerText.includes('informational')) {
    sentiment = 'Informational / Networking';
    sentimentBadge = 'badge-blue';
  }

  // Calculate recommended follow up date
  const offsetDays = isMeeting ? 2 : getDefaultFollowUpForContactType(kindOfContact);
  const calculatedFollowUpDate = calculateFollowUpDate(offsetDays);

  // Generate suggested summary comment
  let summaryComment = `AI Extracted: Conversation with ${contactName}. Tone: ${sentiment}. Key Action: Follow up by ${calculatedFollowUpDate}.`;
  if (linkedinUrl) {
    summaryComment += ` LinkedIn connected.`;
  }

  return {
    contactName,
    organization,
    email: contactEmail,
    phone: '',
    linkedinUrl,
    comments: summaryComment,
    kindOfContact,
    kindOfMeeting,
    isMeeting,
    followUpDate: calculatedFollowUpDate,
    sentiment,
    sentimentBadge,
    rawText: emailContent,
    analyzedAt: new Date().toISOString()
  };
}
