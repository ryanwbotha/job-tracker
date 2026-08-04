/**
 * Search Ideas Catalog categorized by user industry / focus area
 */
export const DISCOVERY_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'tech', label: 'Tech & Engineering' },
  { id: 'local', label: 'Local Businesses & Small Orgs' },
  { id: 'church', label: 'Church & Community Network' },
  { id: 'executive', label: 'Executive & Management' },
];

export const SEARCH_IDEAS_CATALOG = [
  // Tech & Engineering
  {
    category: 'tech',
    title: 'LinkedIn University Alumni Search',
    description: 'Go to your University page on LinkedIn -> Alumni tab -> Filter by Target Company (e.g. Ancestry, Adobe, Qualtrics).',
    actionPrompt: 'Find 3 alumni working at your target companies and send a friendly connection request.'
  },
  {
    category: 'tech',
    title: 'GitHub & Tech Event Speaker Rosters',
    description: 'Check speaker lists from recent regional tech summits (e.g., Silicon Slopes, React Summit).',
    actionPrompt: 'Look up engineering managers who presented at local meetups.'
  },
  {
    category: 'tech',
    title: 'Target Company Engineering Blogs',
    description: 'Search for blog posts written by engineers at target companies. Authors often list their Twitter/LinkedIn.',
    actionPrompt: 'Reference a recent engineering post in your outreach message!'
  },

  // Local Businesses
  {
    category: 'local',
    title: 'Chamber of Commerce Business Directory',
    description: 'Browse your city or county Chamber of Commerce online business registry.',
    actionPrompt: 'Identify 5 growing local mid-sized businesses not listed on major job boards.'
  },
  {
    category: 'local',
    title: 'Local Business Journal "Fastest Growing Companies" List',
    description: 'Look up the "Top 50 Fast 50" list in your regional business newspaper or magazine.',
    actionPrompt: 'These fast-growing companies have unadvertised hiring needs.'
  },

  // Church & Community Network
  {
    category: 'church',
    title: 'LDS Employment & Self-Reliance Group Network',
    description: 'Connect with local Self-Reliance group leaders or employment specialists in your stake.',
    actionPrompt: 'Ask specialists for contacts in your target industry who are open to informational calls.'
  },
  {
    category: 'church',
    title: 'Ward & Stake Business Network Group',
    description: 'Reach out to fellow ward or stake members working in related fields for a 15-minute coffee chat.',
    actionPrompt: 'Send a quick text or email asking for an informational interview.'
  },

  // Executive & Management
  {
    category: 'executive',
    title: 'Professional Association Directory',
    description: 'Check member rosters of industry organizations (e.g., PMI, AMA, SHRM, IEEE).',
    actionPrompt: 'Reach out to chapter committee chairs for informational guidance.'
  },
  {
    category: 'executive',
    title: 'Second-Degree LinkedIn Connection Search',
    description: 'Filter LinkedIn search: People -> 2nd Connections -> Location + Title (e.g., "Director of Operations").',
    actionPrompt: 'Ask your mutual connection for a quick warm email introduction!'
  }
];

/**
 * Generates daily strategy tips based on current 15-10-2 counts and captured resources
 */
export function generateDailyTips(resources = [], contacts = [], meetings = [], targets = []) {
  const tips = [];

  const resourceCount = resources.length;
  const contactCount = contacts.length;
  const meetingCount = meetings.length;

  // Tip 1: Target Gap Advice
  if (resourceCount < 5) {
    tips.push({
      type: 'resource_gap',
      icon: 'Compass',
      badge: 'Resource Priority',
      badgeColor: 'badge-blue',
      title: 'Boost Identified Resources',
      text: `You have identified ${resourceCount}/15 resources today. Spend 20 minutes browsing target company directories or LinkedIn alumni to hit your 15 resource goal.`
    });
  } else if (contactCount < 5) {
    tips.push({
      type: 'contact_gap',
      icon: 'Users',
      badge: 'Contact Priority',
      badgeColor: 'badge-emerald',
      title: 'Turn Resources into Active Outreach',
      text: `Great job capturing ${resourceCount} resources! Now convert them: reach out to 5 people at those companies to reach your 10 daily contacts.`
    });
  } else if (meetingCount < 2) {
    tips.push({
      type: 'meeting_gap',
      icon: 'Video',
      badge: 'Meeting Goal',
      badgeColor: 'badge-purple',
      title: 'Schedule Face-to-Face Calls',
      text: `You have ${contactCount} contacts logged today! Ask 2 of your active contacts for a 15-minute informational interview or networking call.`
    });
  }

  // Tip 2: Resource Utilization Actionable Tip
  if (resources.length > 0) {
    const randomRes = resources[Math.floor(Math.random() * resources.length)];
    tips.push({
      type: 'resource_leverage',
      icon: 'Sparkles',
      badge: 'Leverage Resource',
      badgeColor: 'badge-amber',
      title: `Capitalize on "${randomRes.name}"`,
      text: `You captured "${randomRes.name}". Look up 2 people connected to this resource on LinkedIn and send a personalized message today.`
    });
  } else {
    tips.push({
      type: 'discovery',
      icon: 'Search',
      badge: 'Where to Look',
      badgeColor: 'badge-blue',
      title: 'Need Ideas on Where to Look?',
      text: 'Click "Show Resource/Contacts Ideas" above to browse proven search strategies across Tech, Local Business, and Community Networks!'
    });
  }

  // Tip 3: Target Company Alignment
  if (targets.length > 0) {
    const primaryTarget = targets[0];
    const targetContacts = contacts.filter(c => (c.organization || '').toUpperCase().includes(primaryTarget));
    if (targetContacts.length === 0) {
      tips.push({
        type: 'target_focus',
        icon: 'Target',
        badge: 'Target Focus',
        badgeColor: 'badge-rose',
        title: `Focus on Target: ${primaryTarget}`,
        text: `${primaryTarget} is in your target list, but no contacts logged for it today. Reach out to a manager or recruiter at ${primaryTarget}.`
      });
    }
  }

  return tips;
}
