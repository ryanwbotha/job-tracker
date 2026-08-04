import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  ExternalLink, 
  UserPlus, 
  Sparkles, 
  Link as LinkIcon, 
  MapPin, 
  FileText, 
  X,
  PlusCircle,
  Link2,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Heuristic word-overlap matching algorithm for local resume match calculation
function calculateLocalMatch(resumeText, job) {
  if (!resumeText || !job) return 0;
  
  const resume = resumeText.toLowerCase();
  const jobTitle = (job.role || '').toLowerCase();
  const jobNotes = (job.notesText || '').toLowerCase();
  const jobCompany = (job.company || '').toLowerCase();
  
  const cleanWords = (text) => {
    const words = text.match(/\b[a-z0-9+#.-]{3,25}\b/g) || [];
    const stopWords = new Set([
      'the', 'and', 'for', 'you', 'this', 'that', 'with', 'from', 'have', 'are', 'your', 'will', 'our', 'their', 'about',
      'some', 'than', 'them', 'then', 'into', 'only', 'over', 'other', 'been', 'were', 'also', 'more', 'work', 'team',
      'role', 'job', 'application', 'status', 'with', 'from', 'when', 'who', 'how', 'why', 'what', 'which', 'where',
      'has', 'had', 'have', 'having', 'should', 'could', 'would', 'must', 'will', 'shall'
    ]);
    return words.filter(w => !stopWords.has(w));
  };
  
  const resumeWordSet = new Set(cleanWords(resume));
  const jobWordSet = new Set(cleanWords(`${jobTitle} ${jobNotes} ${jobCompany}`));
  
  if (jobWordSet.size === 0) return 0;
  
  let matches = 0;
  jobWordSet.forEach(word => {
    if (resumeWordSet.has(word)) {
      matches++;
    }
  });
  
  let matchPercentage = Math.round((matches / jobWordSet.size) * 100);
  
  const titleWords = cleanWords(jobTitle);
  let titleMatchCount = 0;
  titleWords.forEach(word => {
    if (resumeWordSet.has(word)) titleMatchCount++;
  });
  if (titleWords.length > 0 && titleMatchCount > 0) {
    matchPercentage += Math.round((titleMatchCount / titleWords.length) * 15);
  }
  
  if (matches === 0) return 0;
  return Math.min(98, Math.max(15, matchPercentage));
}

function getMatchBadgeClass(score) {
  if (score >= 80) return 'badge-emerald';
  if (score >= 50) return 'badge-amber';
  return 'badge-rose';
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--accent-emerald)';
  if (score >= 50) return 'var(--accent-amber)';
  return 'var(--accent-rose)';
}

export function checkLinkStatus(url) {
  if (!url || !url.trim()) return null;
  const cleanUrl = url.trim().toLowerCase();
  
  try {
    let urlObj;
    if (/^https?:\/\//i.test(cleanUrl)) {
      urlObj = new URL(cleanUrl);
    } else {
      urlObj = new URL(`https://${cleanUrl}`);
    }
    
    const path = urlObj.pathname;
    
    if (path.includes('/profile/') || path.includes('/candidate/') || path.includes('/inbox/') || path.includes('/apply/') || path.includes('/login') || path.includes('/dashboard')) {
      return 'login_required';
    }
    
    const isGeneric = path === '/' || path === '' || path === '/jobs' || path === '/jobs/' || path.includes('/search') || path.includes('/careers');
    if (isGeneric && !urlObj.search && !urlObj.hash) {
      return 'generic_link';
    }
  } catch (e) {
    return 'generic_link';
  }
  
  return 'valid';
}

function getLocalMatchBreakdown(resumeText, job) {
  if (!resumeText || !job) {
    return {
      score: 0,
      matchingWords: [],
      missingWords: []
    };
  }

  const resume = resumeText.toLowerCase();
  const jobTitle = (job.role || '').toLowerCase();
  const jobNotes = (job.notesText || '').toLowerCase();
  const jobCompany = (job.company || '').toLowerCase();
  
  const cleanWords = (text) => {
    const words = text.match(/\b[a-z0-9+#.-]{3,25}\b/g) || [];
    const stopWords = new Set([
      'the', 'and', 'for', 'you', 'this', 'that', 'with', 'from', 'have', 'are', 'your', 'will', 'our', 'their', 'about',
      'some', 'than', 'them', 'then', 'into', 'only', 'over', 'other', 'been', 'were', 'also', 'more', 'work', 'team',
      'role', 'job', 'application', 'status', 'with', 'from', 'when', 'who', 'how', 'why', 'what', 'which', 'where',
      'has', 'had', 'have', 'having', 'should', 'could', 'would', 'must', 'will', 'shall'
    ]);
    return words.filter(w => !stopWords.has(w));
  };
  
  const resumeWordSet = new Set(cleanWords(resume));
  const jobWords = cleanWords(`${jobTitle} ${jobNotes} ${jobCompany}`);
  const jobWordSet = new Set(jobWords);
  
  if (jobWordSet.size === 0) {
    return {
      score: 0,
      matchingWords: [],
      missingWords: []
    };
  }
  
  const matchingWords = [];
  const missingWords = [];
  
  jobWordSet.forEach(word => {
    if (resumeWordSet.has(word)) {
      matchingWords.push(word);
    } else {
      missingWords.push(word);
    }
  });
  
  let matches = matchingWords.length;
  let matchPercentage = Math.round((matches / jobWordSet.size) * 100);
  
  const titleWords = cleanWords(jobTitle);
  let titleMatchCount = 0;
  titleWords.forEach(word => {
    if (resumeWordSet.has(word)) titleMatchCount++;
  });
  if (titleWords.length > 0 && titleMatchCount > 0) {
    matchPercentage += Math.round((titleMatchCount / titleWords.length) * 15);
  }
  
  const score = matches === 0 ? 0 : Math.min(98, Math.max(15, matchPercentage));
  
  return {
    score,
    matchingWords,
    missingWords
  };
}

export default function JobTrackerView({ setActiveView }) {
  const { allResources, addResource, deleteResource, updateResource, allContacts, addContact } = useTracker();
  
  const resumeText = localStorage.getItem('ats_resume_text') || '';
  const hasMasterResume = !!resumeText.trim();
  
  // View states
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedJobs, setParsedJobs] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  // Layout and selection states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedJobs, setSelectedJobs] = useState([]); // array of job IDs
  const [expandedJobs, setExpandedJobs] = useState([]); // array of expanded job IDs for list view
  
  // Quick Add Job states
  const [quickCompany, setQuickCompany] = useState('');
  const [quickRole, setQuickRole] = useState('');
  const [quickLink, setQuickLink] = useState('');
  const [quickNotes, setQuickNotes] = useState('');

  // Inline Contact Add state (indexed by job id)
  const [addingContactJobId, setAddingContactJobId] = useState(null);
  const [activeBreakdownJob, setActiveBreakdownJob] = useState(null);
  const [selectedDescriptionJob, setSelectedDescriptionJob] = useState(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactLinkedin, setNewContactLinkedin] = useState('');
  const [isPullingDesc, setIsPullingDesc] = useState(false);

  const pullJobDescription = async (jobId, jobUrl, silent = false) => {
    if (!jobUrl) return;

    let cleanUrl = jobUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setIsPullingDesc(true);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch webpage content via CORS proxy (${res.status})`);
      }
      
      const resText = await res.text();
      if (!resText || !resText.trim()) {
        throw new Error("Empty response from CORS proxy.");
      }
      
      const resData = JSON.parse(resText);
      const rawHtml = resData.contents;
      if (!rawHtml) {
        throw new Error("No content returned from the webpage proxy.");
      }

      // Parse HTML inside browser DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      // Helper function to recursively traverse DOM nodes and compile formatted markdown text
      const formatNode = (node) => {
        let text = '';
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.nodeValue.replace(/\s+/g, ' ').trim();
          if (val) text += val + ' ';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          
          // Ignore noise elements completely
          if (['script', 'style', 'nav', 'header', 'footer', 'iframe', 'noscript', 'head', 'svg', 'button', 'input', 'select', 'textarea', 'form'].includes(tagName)) {
            return '';
          }
          
          let childText = '';
          node.childNodes.forEach(child => {
            childText += formatNode(child);
          });
          
          childText = childText.trim();
          if (!childText) return '';
          
          if (/^h[1-6]$/.test(tagName)) {
            const level = tagName[1];
            text += `\n\n${'#'.repeat(level)} ${childText}\n\n`;
          } else if (tagName === 'p') {
            text += `\n\n${childText}\n\n`;
          } else if (tagName === 'li') {
            text += `\n* ${childText}`;
          } else if (tagName === 'ul' || tagName === 'ol') {
            text += `\n${childText}\n`;
          } else if (tagName === 'div' || tagName === 'section' || tagName === 'article') {
            text += `\n${childText}\n`;
          } else if (['strong', 'b'].includes(tagName)) {
            text += ` **${childText}** `;
          } else if (['em', 'i'].includes(tagName)) {
            text += ` *${childText}* `;
          } else {
            text += childText + ' ';
          }
        }
        return text;
      };

      let formattedText = formatNode(doc.body);
      formattedText = formattedText
        .replace(/\n{3,}/g, '\n\n') // replace 3+ newlines with 2 newlines
        .trim();

      const isPrivateProfile = cleanUrl.toLowerCase().includes('/profile/') || cleanUrl.toLowerCase().includes('/candidate/');
      const pageTitle = doc.title || '';

      if (!formattedText || formattedText.length < 50) {
        if (isPrivateProfile) {
          updateResource(jobId, { linkStatus: 'login_required' });
          throw new Error("Private candidate profile links (e.g. /profile/) require a signed-in session and cannot be crawled. Please copy the public job posting link (e.g. /jobs/) or paste the description text manually.");
        }
        updateResource(jobId, { linkStatus: 'generic_link' });
        throw new Error("This webpage uses client-side JavaScript rendering (SPA) or is empty, so its content cannot be read by the scraper. Please paste the description text manually.");
      }

      const isNotJobPost = /login|sign in|cookies|robot|captcha|404|not found|forbidden/i.test(pageTitle) || 
                           (formattedText.toLowerCase().includes("enable cookies") && formattedText.length < 500);
      
      if (isNotJobPost) {
        if (isPrivateProfile) {
          updateResource(jobId, { linkStatus: 'login_required' });
          throw new Error("Private candidate portal link detected. The scraper was redirected to a login screen. Please use the public listing URL (e.g. /jobs/) or paste the description text manually.");
        }
        updateResource(jobId, { linkStatus: 'generic_link' });
        throw new Error(`The link does not appear to contain a specific job description (login, cookie verification, or security block page detected: "${pageTitle}"). Please paste the description text manually.`);
      }

      // Save formatted text to Notes
      const updates = { notesText: formattedText, linkStatus: 'valid' };
      
      // Auto-extract metadata if fields are empty
      const currentJob = jobApplications.find(j => j.id === jobId);
      if (currentJob) {
        // Try to guess Company / Role from page title if they are empty/open roles
        if (!currentJob.company || currentJob.company.toLowerCase().includes('google') || currentJob.company === 'Open Company') {
          const titleClean = pageTitle.split(/[|\-•]/)[0].trim();
          if (titleClean && titleClean.length < 100) {
            const matchCompany = pageTitle.match(/at\s+([^|\-•]+)/i) || pageTitle.match(/careers\s+at\s+([^|\-•]+)/i);
            if (matchCompany && !currentJob.company) {
              updates.company = matchCompany[1].trim();
            }
          }
        }
      }

      updateResource(jobId, updates);
      if (!silent) {
        alert("Successfully pulled and formatted job description!");
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        alert(`Error pulling description: ${err.message}`);
      }
    } finally {
      setIsPullingDesc(false);
    }
  };

  // Filter resources to get only job applications
  const jobApplications = (allResources || [])
    .filter(res => res.category === 'Job Application')
    .map(job => {
      if (!job.company && job.name && job.name.includes(' - ')) {
        const parts = job.name.split(' - ');
        return {
          ...job,
          company: parts[0].trim(),
          role: parts.slice(1).join(' - ').trim()
        };
      }
      return job;
    });

  const filteredJobs = selectedStatusFilter === 'ALL'
    ? jobApplications
    : jobApplications.filter(job => (job.status || 'Wishlist') === selectedStatusFilter);

  // Status mapping colors for styles
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Wishlist': return 'badge-slate';
      case 'Applied': return 'badge-amber';
      case 'Interviewing': return 'badge-purple';
      case 'Offer': return 'badge-emerald';
      case 'Rejected': return 'badge-rose';
      default: return 'badge-slate';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Wishlist': return '#cbd5e1';
      case 'Applied': return 'var(--accent-amber)';
      case 'Interviewing': return 'var(--accent-purple)';
      case 'Offer': return 'var(--accent-emerald)';
      case 'Rejected': return 'var(--accent-rose)';
      default: return '#cbd5e1';
    }
  };

  // Add individual job application
  const handleAddJob = (jobData) => {
    return addResource({
      name: `${jobData.company} - ${jobData.role}`,
      category: 'Job Application',
      notes: jobData.notes || '',
      company: jobData.company,
      role: jobData.role,
      location: jobData.location || '',
      type: jobData.type || 'Full-Time',
      link: jobData.link || '',
      linkStatus: checkLinkStatus(jobData.link),
      status: jobData.status || 'Wishlist',
      linkedContactIds: jobData.linkedContactIds || [],
      notesText: jobData.notesText || ''
    });
  };

  // Quick Add form submit
  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickCompany.trim() || !quickRole.trim()) return;
    
    handleAddJob({
      company: quickCompany.trim(),
      role: quickRole.trim(),
      link: quickLink.trim(),
      notes: quickNotes.trim(),
      status: 'Wishlist'
    });

    setQuickCompany('');
    setQuickRole('');
    setQuickLink('');
    setQuickNotes('');
  };

  // Local parser fallback
  const parseLocalRegex = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const jobs = [];
    let currentCompany = '';

    const urlRegex = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
    
    const noiseLabels = [
      'location link', 'job link', 'apply here', 'apply link', 'link to job', 
      'url', 'posting link', 'link', 'details', 'more info', 'click here', 
      'website', 'job website', 'careers page', 'careers link', 'view job',
      'apply online', 'online application', 'job details', 'location'
    ];

    const isNoiseLabel = (str) => {
      const clean = str.toLowerCase().replace(/[:\-\s]+/g, ' ').trim();
      return noiseLabels.some(label => clean === label || clean.startsWith(label));
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      // Look for company headings
      // e.g., "1. Ernst & Young (EY)", "2. Meta Platforms", "Google"
      const numberHeadingMatch = line.match(/^(?:\d+\.\s+)?([^:\-\n(]+)/);
      const isCompanyHeader = line.match(/^\d+\./) || (line.length < 40 && (lower.includes('platforms') || lower.includes('google') || lower.includes('ey') || lower.includes('group') || lower.includes('systems') || lower.includes('corp') || lower.includes('inc.')));
      
      if (isCompanyHeader && numberHeadingMatch) {
        currentCompany = numberHeadingMatch[1].replace(/\(.*\)/g, '').trim();
        continue;
      }

      // Look for details inside company section
      const urlMatch = line.match(urlRegex);
      if (urlMatch) {
        const url = urlMatch[0];
        let rolePart = line.replace(url, '').trim();
        // Clean up role labels
        rolePart = rolePart.replace(/^role\s*:?/i, '').replace(/^[|\-\s]+/g, '').trim();
        
        if (rolePart && !isNoiseLabel(rolePart) && currentCompany) {
          jobs.push({
            company: currentCompany,
            role: rolePart.length > 60 ? rolePart.substring(0, 57) + '...' : rolePart,
            link: url,
            location: '',
            type: 'Full-Time',
            notes: 'Pasted from list'
          });
        } else if (currentCompany) {
          // If no role on this line, try to grab the previous line as the role if it wasn't the company name
          const prevLine = i > 0 ? lines[i - 1] : '';
          const isPrevCompany = prevLine.match(/^\d+\./) || (prevLine.length < 40 && (prevLine.toLowerCase().includes('platforms') || prevLine.toLowerCase().includes('google') || prevLine.toLowerCase().includes('ey') || prevLine.toLowerCase().includes('group') || prevLine.toLowerCase().includes('systems') || prevLine.toLowerCase().includes('corp') || prevLine.toLowerCase().includes('inc.')));
          const inferredRole = !isPrevCompany && prevLine && !isNoiseLabel(prevLine) ? prevLine : 'Open Role';
          
          jobs.push({
            company: currentCompany,
            role: inferredRole.length > 60 ? inferredRole.substring(0, 57) + '...' : inferredRole,
            link: url,
            location: '',
            type: 'Full-Time',
            notes: 'Pasted from list'
          });
        }
      } else if (lower.startsWith('role') || lower.startsWith('title')) {
        const roleText = line.replace(/^(?:role|title)\s*:?/i, '').trim();
        if (roleText && !isNoiseLabel(roleText) && currentCompany) {
          // Look ahead to check if next line is a URL
          const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
          const nextUrlMatch = nextLine.match(urlRegex);
          const link = nextUrlMatch ? nextUrlMatch[0] : '';
          
          jobs.push({
            company: currentCompany,
            role: roleText,
            link: link,
            location: '',
            type: 'Full-Time',
            notes: 'Pasted from list'
          });
          if (link) i++; // skip next line containing the link
        }
      } else if (currentCompany && line.length < 100 && !isNoiseLabel(line)) {
        // Look ahead: if next line is a URL, this line is likely the role
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        const nextUrlMatch = nextLine.match(urlRegex);
        if (nextUrlMatch) {
          jobs.push({
            company: currentCompany,
            role: line.length > 60 ? line.substring(0, 57) + '...' : line,
            link: nextUrlMatch[0],
            location: '',
            type: 'Full-Time',
            notes: 'Pasted from list'
          });
          i++; // skip next line containing the link
        }
      }
    }

    return jobs;
  };

  // AI Paste Parser via Gemini API
  const handleParsePaste = async () => {
    if (!importText.trim()) return;

    const inputTrim = importText.trim();
    const isSingleUrl = /^https?:\/\/[^\s]+$/i.test(inputTrim) || 
                        (!inputTrim.includes('\n') && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/[^\s]*$/i.test(inputTrim));

    if (isSingleUrl) {
      setIsParsing(true);
      setParsedJobs([]);
      
      let cleanUrl = inputTrim;
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`;
      }

      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) {
          throw new Error(`Failed to fetch webpage content via CORS proxy (${res.status})`);
        }
        
        const resText = await res.text();
        if (!resText || !resText.trim()) {
          throw new Error("Empty response from CORS proxy.");
        }
        
        const resData = JSON.parse(resText);
        const rawHtml = resData.contents;
        if (!rawHtml) {
          throw new Error("No content returned from the webpage proxy.");
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        const pageTitle = doc.title || '';
        let company = 'Open Company';
        let role = 'Open Role';

        if (pageTitle) {
          const parts = pageTitle.split(/[|\-•]/);
          role = parts[0].trim();
          if (parts.length > 1) {
            company = parts[1].trim();
            company = company.replace(/careers/i, '').trim();
          }
          const matchCompany = pageTitle.match(/at\s+([^|\-•]+)/i);
          if (matchCompany) {
            company = matchCompany[1].trim();
          }
        }

        const h1 = doc.querySelector('h1')?.textContent?.trim();
        if (h1 && h1.length < 150) {
          role = h1;
        }

        if (role.toLowerCase().includes('careers') || role.toLowerCase().includes('job opportunity') || role.toLowerCase().includes('details')) {
          role = h1 || 'Open Role';
        }

        const parsedJob = {
          company: company,
          role: role,
          link: cleanUrl,
          location: '',
          type: 'Full-Time',
          notes: 'Scraped from direct link input'
        };

        setParsedJobs([parsedJob]);
      } catch (err) {
        console.error("Local URL parser failed:", err);
        alert(`Could not parse job details from URL: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
      return;
    }

    setIsParsing(true);
    setParsedJobs([]);

    let apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      apiKey = localStorage.getItem('ats_gemini_api_key') || '';
    }

    if (!apiKey) {
      // Local fallback parser
      const localParsed = parseLocalRegex(importText);
      setParsedJobs(localParsed);
      setIsParsing(false);
      return;
    }

    const prompt = `You are a structured job opportunity parser. Parse the following unstructured list of company names, roles, locations, links, and job details. 
Extract all the open jobs listed. Make sure to capture the exact URL links for the jobs if they are in the list.
Do NOT extract label text (like 'Location Link', 'Apply Here', 'Job Link', 'Click Link', 'Website') as the job title/role. The role should always be the actual professional title (e.g. Software Engineer, Product Designer). If no professional title is specified, use 'Open Role'.

Return a JSON array of objects with this exact structure:
[
  {
    "company": "Company Name",
    "role": "Role/Title",
    "location": "Location (e.g. New York, NY or Remote)",
    "type": "Onsite|Hybrid|Remote",
    "link": "URL link if available",
    "notes": "Salary info, job category, or description summary"
  }
]

Here is the text to parse:
${importText}`;

    try {
      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok && (response.status === 429 || response.status === 403)) {
        console.warn("Gemini 2.0 Flash quota exceeded. Falling back to Gemini 1.5 Flash for paste parsing...");
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          }
        );
      }

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error('Gemini API returned empty response.');
      }

      let cleanJson = textResponse.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        setParsedJobs(parsed);
      } else {
        throw new Error('Parsed response is not a list.');
      }
    } catch (err) {
      console.error('Gemini API parse failed, falling back to local parser:', err);
      const localParsed = parseLocalRegex(importText);
      setParsedJobs(localParsed);
    } finally {
      setIsParsing(false);
    }
  };

  // Import parsed list into the tracker
  const handleImportParsed = () => {
    const importableJobs = parsedJobs.filter(job => {
      const linkStatus = checkLinkStatus(job.link);
      return linkStatus !== 'generic_link' && linkStatus !== 'login_required';
    });

    importableJobs.forEach(job => {
      const newJob = handleAddJob({
        ...job,
        status: 'Wishlist'
      });

      if (newJob && newJob.link && newJob.linkStatus === 'valid') {
        pullJobDescription(newJob.id, newJob.link, true);
      }
    });
    setParsedJobs([]);
    setImportText('');
    setShowImport(false);
  };

  // Update job properties
  const handleStatusChange = (jobId, newStatus) => {
    updateResource(jobId, { status: newStatus });
  };

  const handleNotesChange = (jobId, newNotes) => {
    updateResource(jobId, { notesText: newNotes });
  };

  // Link a contact to job application
  const handleLinkContact = (jobId, contactId, jobObj) => {
    const currentLinks = jobObj.linkedContactIds || [];
    if (currentLinks.includes(contactId)) return;
    
    updateResource(jobId, {
      linkedContactIds: [...currentLinks, contactId]
    });
  };

  // Remove a linked contact
  const handleUnlinkContact = (jobId, contactId, jobObj) => {
    const currentLinks = jobObj.linkedContactIds || [];
    updateResource(jobId, {
      linkedContactIds: currentLinks.filter(id => id !== contactId)
    });
  };

  // Quick create contact and link directly
  const handleQuickAddContactSubmit = (e, jobId, jobObj) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    // Create new contact in database
    const newContact = addContact({
      name: newContactName.trim(),
      organization: jobObj.company,
      linkedinUrl: newContactLinkedin.trim(),
      comments: `Contact for job application at ${jobObj.company} - ${jobObj.role}`,
      kindOfContact: 'LinkedIn Message'
    });

    // Link contact ID to resource
    if (newContact && newContact.id) {
      const currentLinks = jobObj.linkedContactIds || [];
      updateResource(jobId, {
        linkedContactIds: [...currentLinks, newContact.id]
      });
    }

    setNewContactName('');
    setNewContactLinkedin('');
    setAddingContactJobId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Action Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['ALL', 'Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedStatusFilter(filter)}
              className={`btn btn-sm ${selectedStatusFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                minHeight: '38px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.825rem',
                borderRadius: '9999px',
                fontWeight: 700
              }}
            >
              {filter === 'Wishlist' ? 'Jobs' : filter}
            </button>
          ))}

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }} />

          {/* Grid/List Layout Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: viewMode === 'grid' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: viewMode === 'list' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowImport(!showImport)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Sparkles size={16} />
          <span>{showImport ? 'Close Paste Panel' : 'Paste AI Job List'}</span>
        </button>
      </div>

      {/* Expandable Paste Panel */}
      {showImport && (
        <div className="section-card expandable-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px dashed var(--accent-purple)', background: 'rgba(139, 92, 246, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--accent-purple)" />
            <strong style={{ fontSize: '1rem' }}>Paste AI Company & Job Openings List</strong>
          </div>
          
          <textarea
            className="textarea-field"
            rows={6}
            placeholder="Paste your compiled list here. E.g.
1. Ernst & Young (EY)
Studio+ Experience Designer, Senior - UX/UI
careers.ey.com

2. Meta Platforms
Product Designer - metacareers.com/jobs/1397212694826926"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary"
              disabled={isParsing || !importText.trim()}
              onClick={handleParsePaste}
            >
              {isParsing ? 'Parsing with AI...' : 'Parse pasted text'}
            </button>
            {parsedJobs.length > 0 && (() => {
              const importableCount = parsedJobs.filter(job => {
                const linkStatus = checkLinkStatus(job.link);
                return linkStatus !== 'generic_link' && linkStatus !== 'login_required';
              }).length;

              return (
                <button 
                  className="btn btn-emerald"
                  onClick={handleImportParsed}
                  disabled={importableCount === 0}
                >
                  Import {importableCount} Jobs to Tracker
                </button>
              );
            })()}
          </div>

          {/* Parsed Jobs Preview */}
          {parsedJobs.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Preview found roles:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {parsedJobs.map((job, idx) => {
                  const linkStatus = checkLinkStatus(job.link);
                  const isImportable = linkStatus !== 'generic_link' && linkStatus !== 'login_required';
                  
                  return (
                    <div key={idx} style={{ 
                      background: '#ffffff', 
                      padding: '0.65rem 0.85rem', 
                      borderRadius: 'var(--radius-sm)', 
                      border: isImportable ? '1px solid var(--border-color)' : '1px dashed var(--accent-rose)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.2rem',
                      opacity: isImportable ? 1 : 0.7
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{job.role}</strong>
                        {!isImportable && (
                          <span className="badge badge-rose" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {linkStatus === 'login_required' ? '🔒 Excluded: Login Portal' : '⚠️ Excluded: General Careers'}
                          </span>
                        )}
                        {isImportable && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            ✅ Importable
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{job.company}</span>
                      {job.link && (
                        <span style={{ fontSize: '0.75rem', color: isImportable ? 'var(--accent-blue)' : 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={job.link}>
                          {job.link}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasMasterResume && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid var(--accent-amber)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={20} color="var(--accent-amber)" />
            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Automatic ATS Matching Available</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Add a Master Resume in Settings to automatically see keyword match scores on your job applications.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveView && setActiveView('settings')}
            className="btn btn-secondary"
            style={{ 
              borderColor: 'var(--accent-amber)',
              color: 'var(--accent-amber)',
              background: 'transparent',
              fontSize: '0.85rem',
              minHeight: '36px',
              padding: '0.35rem 1rem'
            }}
          >
            Go to Settings
          </button>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedJobs.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(244, 63, 94, 0.05)', 
          border: '1px solid rgba(244, 63, 94, 0.15)',
          padding: '0.75rem 1rem', 
          borderRadius: 'var(--radius-md)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input 
              type="checkbox"
              checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedJobs(filteredJobs.map(j => j.id));
                } else {
                  setSelectedJobs([]);
                }
              }}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
              Select All ({filteredJobs.length})
            </label>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              • {selectedJobs.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedJobs.length} selected job applications?`)) {
                  selectedJobs.forEach(id => deleteResource(id));
                  setSelectedJobs([]);
                }
              }}
              className="btn btn-primary"
              style={{ background: 'var(--accent-rose)', border: 'none', minHeight: '34px', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedJobs([])}
              className="btn btn-secondary"
              style={{ minHeight: '34px', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid/List of Job Cards wrapped in split layout */}
      <div className="tracker-split-layout">
        <div className="tracker-main-pane">
          {filteredJobs.length === 0 ? (
        <div className="section-card empty-state" style={{ padding: '3.5rem 1.5rem' }}>
          <Briefcase className="empty-state-icon" style={{ width: '48px', height: '48px' }} />
          <strong style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>No job applications recorded</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Paste a list from AI using button above, or add a single job using the Quick Add form below.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredJobs.map(job => {
            const linkedContacts = (allContacts || []).filter(c => (job.linkedContactIds || []).includes(c.id));
            const availableContacts = (allContacts || []).filter(c => !(job.linkedContactIds || []).includes(c.id));
            const matchScore = calculateLocalMatch(resumeText, job);
            
            // Stepper variables
            const steps = ['Wishlist', 'Applied', 'Interviewing', job.status === 'Rejected' ? 'Rejected' : 'Offer'];
            const currentStepIndex = steps.indexOf(job.status || 'Wishlist') !== -1 ? steps.indexOf(job.status || 'Wishlist') : 0;
            const isSelected = selectedJobs.includes(job.id);
            const isActiveJob = selectedDescriptionJob && selectedDescriptionJob.id === job.id;

            const getLabelStyle = (idx, isActive) => {
              const baseStyle = {
                position: 'absolute',
                top: '16px',
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease'
              };
              if (idx === 0) return { ...baseStyle, left: '0', transform: 'none' };
              if (idx === 3) return { ...baseStyle, right: '0', transform: 'none' };
              return { ...baseStyle, left: '50%', transform: 'translateX(-50%)' };
            };            return (
              <div 
                key={job.id} 
                className={`section-card tracker-job-card ${isActiveJob ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDescriptionJob(job)}
              >
                {/* Selection Checkbox */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(prev => [...prev, job.id]);
                      } else {
                        setSelectedJobs(prev => prev.filter(id => id !== job.id));
                      }
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {/* Role & Company Header */}
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{job.role}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.15rem' }}>{job.company}</div>
                </div>

                {/* Location & Type & Match Score Badges */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {job.location && (
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                      <MapPin size={8} style={{ marginRight: '-1px' }} />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      {job.type}
                    </span>
                  )}
                  {hasMasterResume && !!(job.notesText || '').trim() && (
                    <span className={`badge ${getMatchBadgeClass(matchScore)}`} style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Sparkles size={8} />
                      <span>Match: {matchScore}%</span>
                    </span>
                  )}
                  <span className={`badge ${getStatusColorClass(job.status || 'Wishlist')}`} style={{ fontSize: '0.65rem' }}>
                    {job.status || 'Wishlist'}
                  </span>
                  {job.linkStatus === 'login_required' && (
                    <span className="badge badge-rose" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      🔑 Behind Login
                    </span>
                  )}
                  {job.linkStatus === 'generic_link' && (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      ⚠️ Not Direct Link
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredJobs.map(job => {
            const matchScore = calculateLocalMatch(resumeText, job);
            const isSelected = selectedJobs.includes(job.id);
            const isActiveJob = selectedDescriptionJob && selectedDescriptionJob.id === job.id;

            return (
              <div 
                key={job.id}
                className={`section-card tracker-job-row ${isActiveJob ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDescriptionJob(job)}
              >
                {/* Left Side: Checkbox, Status Dot, Company & Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '250px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(prev => [...prev, job.id]);
                      } else {
                        setSelectedJobs(prev => prev.filter(id => id !== job.id));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  
                  {/* Status Dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getStatusColor(job.status || 'Wishlist'),
                    boxShadow: `0 0 6px ${getStatusColor(job.status || 'Wishlist')}80`
                  }} />

                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{job.role}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{job.company}</div>
                  </div>
                </div>

                {/* Right Side: Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {job.location && (
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                      <MapPin size={8} style={{ marginRight: '-1px' }} />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      {job.type}
                    </span>
                  )}
                  {hasMasterResume && !!(job.notesText || '').trim() && (
                    <span className={`badge ${getMatchBadgeClass(matchScore)}`} style={{ fontSize: '0.65rem' }}>
                      <Sparkles size={8} />
                      <span>Match: {matchScore}%</span>
                    </span>
                  )}
                  <span className={`badge ${getStatusColorClass(job.status || 'Wishlist')}`} style={{ fontSize: '0.65rem' }}>
                    {job.status || 'Wishlist'}
                  </span>
                  {job.linkStatus === 'login_required' && (
                    <span className="badge badge-rose" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      🔑 Behind Login
                    </span>
                  )}
                  {job.linkStatus === 'generic_link' && (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      ⚠️ Not Direct Link
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Responsive Side Drawer Spacer to shift listings */}
      {selectedDescriptionJob && (
        <div className="tracker-side-spacer" />
      )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {selectedDescriptionJob && (() => {
        const activeJob = jobApplications.find(j => j.id === selectedDescriptionJob.id);
        if (!activeJob) return null;

        const matchScore = calculateLocalMatch(resumeText, activeJob);
        const linkedContacts = (allContacts || []).filter(c => (activeJob.linkedContactIds || []).includes(c.id));
        const availableContacts = (allContacts || []).filter(c => !(activeJob.linkedContactIds || []).includes(c.id));
        const steps = ['Wishlist', 'Applied', 'Interviewing', activeJob.status === 'Rejected' ? 'Rejected' : 'Offer'];
        const currentStepIndex = steps.indexOf(activeJob.status || 'Wishlist') !== -1 ? steps.indexOf(activeJob.status || 'Wishlist') : 0;

        const getLabelStyle = (idx, isActive) => {
          const baseStyle = {
            position: 'absolute',
            top: '16px',
            fontSize: '0.65rem',
            fontWeight: isActive ? 700 : 500,
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease'
          };
          if (idx === 0) return { ...baseStyle, left: '0', transform: 'none' };
          if (idx === 3) return { ...baseStyle, right: '0', transform: 'none' };
          return { ...baseStyle, left: '50%', transform: 'translateX(-50%)' };
        };

        return (
          <div className="tracker-side-pane">
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              gap: '0.5rem'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeJob.role}>
                  {activeJob.role}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeJob.company}>
                  {activeJob.company}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete this application to ${activeJob.company}?`)) {
                      deleteResource(activeJob.id);
                      setSelectedDescriptionJob(null);
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete Application"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setSelectedDescriptionJob(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              
              {/* Status Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Status Progress
                  </span>
                  <select
                    value={activeJob.status || 'Wishlist'}
                    onChange={(e) => handleStatusChange(activeJob.id, e.target.value)}
                    className={`badge ${getStatusColorClass(activeJob.status || 'Wishlist')}`}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      fontWeight: 700,
                      padding: '0.2rem 1.4rem 0.2rem 0.5rem',
                      fontFamily: 'var(--font-body)',
                      appearance: 'none',
                      backgroundPosition: 'right 0.4rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
                      backgroundSize: '8px',
                      fontSize: '0.7rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase'
                    }}
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                {/* Stepper Track */}
                <div style={{ position: 'relative', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', margin: '0.5rem 0 1.25rem 0' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(currentStepIndex / 3) * 100}%`,
                    background: getStatusColor(activeJob.status || 'Wishlist'),
                    borderRadius: '2px',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', width: '100%', top: '-4px', left: 0 }}>
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isActive = idx === currentStepIndex;
                      const stepColor = isCompleted ? getStatusColor(activeJob.status || 'Wishlist') : 'rgba(0,0,0,0.12)';
                      
                      return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: isActive ? '#ffffff' : stepColor,
                            border: `3px solid ${stepColor}`,
                            boxShadow: isActive ? `0 0 0 3px ${stepColor}40, var(--shadow-subtle)` : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                          onClick={() => handleStatusChange(activeJob.id, step === 'Rejected' || step === 'Offer' ? (activeJob.status === 'Rejected' ? 'Rejected' : 'Offer') : step)}
                          title={`Set status to ${step}`}
                          />
                          <span style={getLabelStyle(idx, isActive)}>
                            {step === 'Wishlist' ? 'Jobs' : step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Metadata Editing Fields */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Location</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', minHeight: '32px' }}
                      value={activeJob.location || ''} 
                      onChange={(e) => updateResource(activeJob.id, { location: e.target.value })}
                      placeholder="e.g. Remote"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Job Type</label>
                    <select 
                      className="select-field" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', minHeight: '32px' }}
                      value={activeJob.type || 'Full-Time'} 
                      onChange={(e) => updateResource(activeJob.id, { type: e.target.value })}
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Job Posting Link</label>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Add job link (e.g. careers.google.com)..."
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', minHeight: '32px', flex: 1 }}
                      value={activeJob.link || ''}
                      onChange={(e) => {
                        const newLink = e.target.value;
                        updateResource(activeJob.id, { 
                          link: newLink, 
                          linkStatus: checkLinkStatus(newLink) 
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => pullJobDescription(activeJob.id, activeJob.link)}
                      disabled={!activeJob.link || isPullingDesc}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '32px',
                        padding: '0 0.5rem',
                        fontSize: '0.725rem',
                        gap: '0.25rem',
                        fontWeight: 600
                      }}
                      title="Pull details and description from link"
                    >
                      <Sparkles size={12} color="var(--accent-blue)" />
                      <span>{isPullingDesc ? 'Pulling...' : 'Auto-Pull'}</span>
                    </button>
                    {activeJob.link && (
                      <a 
                        href={activeJob.link.startsWith('http') ? activeJob.link : `https://${activeJob.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '32px', width: '32px', padding: 0 }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {activeJob.linkStatus === 'login_required' && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem', fontWeight: 600 }}>
                      <span>🔑 Behind Login: Link requires session. Use public listing URL instead.</span>
                    </div>
                  )}
                  {activeJob.linkStatus === 'generic_link' && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem', fontWeight: 600 }}>
                      <span>⚠️ Not Direct Link: URL is generic page. Scraper needs specific posting.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ATS Match Overview */}
              {hasMasterResume && !!(activeJob.notesText || '').trim() && (
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                    ATS Resume Match Quality
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: `3px solid ${getScoreColor(matchScore)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: getScoreColor(matchScore)
                      }}>
                        {matchScore}%
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Keyword Overlap</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {matchScore}% matched with master resume
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ minHeight: '28px', padding: '0.15rem 0.45rem', fontSize: '0.725rem' }}
                      onClick={() => {
                        setSelectedDescriptionJob(null);
                        setActiveBreakdownJob(activeJob);
                      }}
                    >
                      Breakdown
                    </button>
                  </div>
                </div>
              )}

              {/* Application Notes (editable) */}
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Job Description & Notes
                </label>
                <textarea
                  className="textarea-field"
                  rows={6}
                  placeholder="Paste details, requirements, notes, salary info, or interview steps here..."
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.65rem', lineHeight: 1.5 }}
                  value={activeJob.notesText || ''}
                  onChange={(e) => handleNotesChange(activeJob.id, e.target.value)}
                />
              </div>

              {/* Document/Resume upload section */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Resume Document
                </label>
                {activeJob.resume ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: 'rgba(0, 0, 0, 0.02)', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
                      <FileText size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                      <span 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = activeJob.resume.data;
                          link.download = activeJob.resume.name;
                          link.click();
                        }}
                        style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--accent-blue)', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title="Download resume"
                      >
                        {activeJob.resume.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this resume?")) {
                          updateResource(activeJob.id, { resume: null });
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Trash2 size={14} className="btn-icon-hover" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label 
                      htmlFor={`resume-upload-drawer-${activeJob.id}`} 
                      className="btn btn-secondary"
                      style={{ 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                      }}
                    >
                      <Plus size={14} />
                      <span>Upload Resume</span>
                    </label>
                    <input
                      id={`resume-upload-drawer-${activeJob.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        
                        if (!allowedExtensions.includes(fileExtension)) {
                          alert("Invalid file format. Please upload a document format (.pdf, .doc, .docx, .txt, .rtf, .odt).");
                          return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateResource(activeJob.id, {
                            resume: {
                              name: file.name,
                              type: file.type,
                              data: event.target.result
                            }
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Linked Contacts connector section */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contacts Contacted</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAddingContactJobId(addingContactJobId === activeJob.id ? null : activeJob.id)}
                    style={{ minHeight: '28px', padding: '0.15rem 0.45rem', fontSize: '0.725rem' }}
                  >
                    <UserPlus size={12} />
                    <span>{addingContactJobId === activeJob.id ? 'Close' : 'Quick Add'}</span>
                  </button>
                </div>

                {/* Quick Add Form */}
                {addingContactJobId === activeJob.id && (
                  <form 
                    onSubmit={(e) => handleQuickAddContactSubmit(e, activeJob.id, activeJob)} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.4rem', 
                      background: '#f8fafc', 
                      padding: '0.65rem', 
                      borderRadius: 'var(--radius-sm)', 
                      marginBottom: '0.5rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <input 
                      type="text" 
                      placeholder="Contact name (required)..." 
                      className="input-field" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', minHeight: '30px' }}
                      value={newContactName} 
                      onChange={(e) => setNewContactName(e.target.value)} 
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="LinkedIn URL (optional)..." 
                      className="input-field" 
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.55rem', minHeight: '30px' }}
                      value={newContactLinkedin} 
                      onChange={(e) => setNewContactLinkedin(e.target.value)} 
                    />
                    <button type="submit" className="btn btn-emerald btn-sm" style={{ alignSelf: 'flex-end', minHeight: '28px', fontSize: '0.725rem' }}>
                      Add & Link
                    </button>
                  </form>
                )}

                {/* Contact list mapping */}
                {linkedContacts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.5rem 0' }}>
                    {linkedContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '0.4rem 0.6rem', 
                          background: '#f8fafc', 
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{contact.name}</strong>
                          {contact.linkedinUrl && (
                            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                              <Linkedin size={10} color="#2563eb" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnlinkContact(activeJob.id, contact.id, activeJob)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                          title="Unlink contact"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link existing contact select dropdown */}
                {availableContacts.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.35rem' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleLinkContact(activeJob.id, e.target.value, activeJob);
                          e.target.value = '';
                        }
                      }}
                      className="select-field"
                      style={{ fontSize: '0.725rem', padding: '0.25rem 0.45rem', minHeight: '30px' }}
                      defaultValue=""
                    >
                      <option value="" disabled>Link existing contact...</option>
                      {availableContacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.organization ? `(${c.organization})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
            
            {/* Footer */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDescriptionJob(null)}>
                Close Details
              </button>
            </div>
          </div>
        );
      })()}

      {/* Manual Quick Add Form */}
      <div className="section-card">
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <PlusCircle size={16} color="var(--accent-blue)" />
          <span>Add Single Job Application</span>
        </h4>
        <form onSubmit={handleQuickSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="quick-company" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Company *</label>
            <input
              id="quick-company"
              type="text"
              className="input-field"
              placeholder="e.g. Google"
              value={quickCompany}
              onChange={(e) => setQuickCompany(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quick-role" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Role / Title *</label>
            <input
              id="quick-role"
              type="text"
              className="input-field"
              placeholder="e.g. Product Designer"
              value={quickRole}
              onChange={(e) => setQuickRole(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quick-link" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Posting Link</label>
            <input
              id="quick-link"
              type="text"
              className="input-field"
              placeholder="e.g. careers.google.com"
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minHeight: '44px' }}>
            Add Application
          </button>
        </form>
      </div>

      {activeBreakdownJob && (() => {
        const breakdown = getLocalMatchBreakdown(resumeText, activeBreakdownJob);
        return (
          <div className="modal-overlay" onClick={() => setActiveBreakdownJob(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Sparkles color="var(--accent-blue)" size={22} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Keyword Match Breakdown</h2>
                </div>
                <button className="modal-close-btn" onClick={() => setActiveBreakdownJob(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{activeBreakdownJob.company}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{activeBreakdownJob.role}</div>
                </div>

                {/* Score summary */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Local Keyword Match</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: getScoreColor(breakdown.score) }}>
                      {breakdown.score >= 80 
                        ? 'Strong Match'
                        : breakdown.score >= 50
                        ? 'Good Keyword Overlap'
                        : 'Low Keyword Overlap'}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: getScoreColor(breakdown.score)
                  }}>
                    {breakdown.score}%
                  </div>
                </div>

                {/* Breakdown lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Matching Words */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)' }}>
                      <CheckCircle2 size={18} />
                      <strong style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Matched Words ({breakdown.matchingWords.length})</strong>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Words from this job listing description/title found in your resume:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', background: '#fafdfb', border: '1px solid #e6f6ec', borderRadius: 'var(--radius-md)', padding: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                      {breakdown.matchingWords.length > 0 ? (
                        breakdown.matchingWords.map((word, i) => (
                          <span key={i} className="badge badge-emerald" style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {word}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matching keywords.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing/Unmatched Words */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-rose)' }}>
                      <AlertTriangle size={18} />
                      <strong style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Unmatched Words ({breakdown.missingWords.length})</strong>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Words in this job listing description/title missing from your resume:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', background: '#fffbfa', border: '1px solid #fdeee9', borderRadius: 'var(--radius-md)', padding: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                      {breakdown.missingWords.length > 0 ? (
                        breakdown.missingWords.map((word, i) => (
                          <span key={i} className="badge badge-rose" style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {word}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>All keywords match!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveBreakdownJob(null)}>Close Breakdown</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
