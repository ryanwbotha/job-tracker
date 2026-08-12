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

// Tailwind CSS styling helpers for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const BTN_EMERALD = `${BTN_BASE} border-accent-emerald bg-accent-emerald px-5 py-2.5 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200`;
const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated`;
const BTN_SM_EMERALD = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-emerald text-white hover:bg-emerald-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const CLOSE_BTN = "inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer border-none bg-transparent";





function getMatchBadgeClass(score) {
  if (score >= 80) return `${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`;
  if (score >= 50) return `${BADGE_BASE} bg-accent-amber/8 text-amber-700`;
  return `${BADGE_BASE} bg-accent-rose/8 text-accent-rose`;
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

  const [isRunningMatchId, setIsRunningMatchId] = useState(null);
  
  const runAtsMatch = async (jobId, jobObj, silent = false) => {
    if (!resumeText.trim() || !(jobObj.notesText || '').trim()) return;
    
    let apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      apiKey = localStorage.getItem('ats_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
    }
    if (!apiKey) {
      if (!silent) alert('Please set your Gemini API key in the ATS Matcher tab first.');
      return;
    }

    setIsRunningMatchId(jobId);
    try {
      const prompt = `You are a skilled and very experienced ATS (Application Tracking System) parser and optimizer. Evaluate this resume against the job description.
Return a JSON response matching this structure exactly:
{
  "match_percentage": <number between 0 and 100>,
  "matching_skills": [<list of technical skills present in both>],
  "missing_keywords": [<list of important technical skills/keywords from job description missing in resume>],
  "profile_summary": "<brief professional analysis in 3-4 sentences>"
}

Resume:
${resumeText}

Job Description:
${jobObj.notesText}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error (${response.status})`);
      }
      
      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        let cleanJson = textResponse.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(cleanJson);
        updateResource(jobId, { atsMatch: parsed });
        if (!silent) alert('ATS Match completed successfully!');
      }
    } catch (err) {
      console.error(err);
      if (!silent) alert('Failed to run ATS Match: ' + err.message);
    } finally {
      setIsRunningMatchId(null);
    }
  };


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
      case 'Wishlist': return `${BADGE_BASE} bg-slate-300/22 text-text-secondary`;
      case 'Applied': return `${BADGE_BASE} bg-accent-amber/8 text-amber-700`;
      case 'Interviewing': return `${BADGE_BASE} bg-accent-purple/8 text-accent-purple`;
      case 'Offer': return `${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`;
      case 'Rejected': return `${BADGE_BASE} bg-accent-rose/8 text-accent-rose`;
      default: return `${BADGE_BASE} bg-slate-300/22 text-text-secondary`;
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
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5">
        <div className="flex gap-1.5 flex-wrap items-center">
          {['ALL', 'Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedStatusFilter(filter)}
              className={`min-h-[38px] px-3.5 py-1.5 text-[0.825rem] rounded-full font-bold cursor-pointer transition-colors border ${
                selectedStatusFilter === filter 
                  ? 'bg-text-primary text-text-invert border-transparent' 
                  : 'bg-bg-card text-text-secondary border-border-color hover:bg-bg-elevated'
              }`}
            >
              {filter === 'Wishlist' ? 'Jobs' : filter}
            </button>
          ))}

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-border-color mx-2" />

          {/* Grid/List Layout Toggle */}
          <div className="flex bg-black/3 p-0.5 rounded-lg border border-border-color items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`border-none p-1.5 rounded-[6px] cursor-pointer flex items-center transition-all duration-150 ${
                viewMode === 'grid' ? 'bg-bg-card text-accent-blue shadow-sm' : 'bg-transparent text-text-secondary'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`border-none p-1.5 rounded-[6px] cursor-pointer flex items-center transition-all duration-150 ${
                viewMode === 'list' ? 'bg-bg-card text-accent-blue shadow-sm' : 'bg-transparent text-text-secondary'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowImport(!showImport)}
          className={`${BTN_PRIMARY} flex items-center gap-1.5`}
        >
          <Sparkles size={16} />
          <span>{showImport ? 'Close Paste Panel' : 'Paste AI Job List'}</span>
        </button>
      </div>

      {/* Expandable Paste Panel */}
      {showImport && (
        <div className="bg-bg-card rounded-lg p-6 shadow-card transition-all duration-150 animate-slide-down-fade flex flex-col gap-4 border border-dashed border-accent-purple bg-[#8b5cf6]/2">
          <div className="flex items-center gap-2">
            <Sparkles size={20} color="var(--accent-purple)" />
            <strong className="text-[1rem] font-bold text-text-primary">Paste AI Company & Job Openings List</strong>
          </div>
          
          <textarea
            className={INPUT_FIELD}
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

          <div className="flex gap-3">
            <button 
              className={BTN_PRIMARY}
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
                  className={BTN_EMERALD}
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
            <div className="bg-bg-elevated p-4 rounded-md border border-border-color">
              <div className="text-[0.8rem] font-bold text-text-muted mb-2 uppercase">Preview found roles:</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                {parsedJobs.map((job, idx) => {
                  const linkStatus = checkLinkStatus(job.link);
                  const isImportable = linkStatus !== 'generic_link' && linkStatus !== 'login_required';
                  
                  return (
                    <div key={idx} className={`bg-bg-card p-3.5 px-4 rounded-md flex flex-col gap-1.5 ${
                      isImportable ? 'border border-border-color opacity-100' : 'border border-dashed border-accent-rose opacity-70'
                    }`}>
                      <div className="flex justify-between items-start gap-2">
                        <strong className="text-[0.9rem] text-text-primary font-bold">{job.role}</strong>
                        {!isImportable && (
                          <span className={`${BADGE_BASE} bg-accent-rose/8 text-accent-rose text-[0.65rem] px-2 py-0.5 whitespace-nowrap font-semibold`}>
                            {linkStatus === 'login_required' ? '🔒 Excluded: Login Portal' : '⚠️ Excluded: General Careers'}
                          </span>
                        )}
                        {isImportable && (
                          <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald text-[0.65rem] px-2 py-0.5 whitespace-nowrap font-semibold`}>
                            ✅ Importable
                          </span>
                        )}
                      </div>
                      <span className="text-[0.8rem] text-text-secondary">{job.company}</span>
                      {job.link && (
                        <span 
                          className={`text-[0.75rem] text-ellipsis overflow-hidden whitespace-nowrap ${
                            isImportable ? 'text-accent-blue' : 'text-text-muted'
                          }`} 
                          title={job.link}
                        >
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
        <div className="bg-amber-500/5 border border-accent-amber rounded-lg p-5 flex justify-between items-center flex-wrap gap-4 shadow-sm mb-2">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} color="var(--accent-amber)" />
            <div>
              <strong className="text-[0.95rem] font-bold text-text-primary">Automatic ATS Matching Available</strong>
              <p className="text-[0.85rem] text-text-secondary mt-1">Add a Master Resume in Settings to automatically see keyword match scores on your job applications.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveView && setActiveView('settings')}
            className={`${BTN_SECONDARY} border border-accent-amber text-accent-amber bg-transparent text-[0.85rem] min-h-[36px] p-[0.35rem_1rem]`}
          >
            Go to Settings
          </button>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedJobs.length > 0 && (
        <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/15 p-3.5 px-4.5 rounded-lg animate-fadeIn">
          <div className="flex items-center gap-3">
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
              className="w-4 h-4 cursor-pointer"
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" className="text-[0.85rem] font-semibold text-text-primary cursor-pointer">
              Select All ({filteredJobs.length})
            </label>
            <span className="text-[0.85rem] text-text-secondary">
              • {selectedJobs.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedJobs.length} selected job applications?`)) {
                  selectedJobs.forEach(id => deleteResource(id));
                  setSelectedJobs([]);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-rose text-white hover:bg-rose-700 text-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedJobs([])}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated text-xs"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid/List of Job Cards wrapped in split layout */}
      <div className="flex gap-5 items-start relative w-full max-lg:flex-col max-lg:items-stretch">
        <div className="flex-1 min-w-0">
          {filteredJobs.length === 0 ? (
        <div className="bg-bg-card rounded-lg shadow-card text-center p-[3.5rem_1.5rem] text-text-muted flex flex-col items-center gap-2.5">
          <Briefcase className="text-text-muted opacity-50 w-12 h-12" />
          <strong className="text-[1.1rem] mt-2 font-bold">No job applications recorded</strong>
          <p className="text-[0.85rem] text-text-secondary">
            Paste a list from AI using button above, or add a single job using the Quick Add form below.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5">
          {filteredJobs.map(job => {
            const linkedContacts = (allContacts || []).filter(c => (job.linkedContactIds || []).includes(c.id));
            const availableContacts = (allContacts || []).filter(c => !(job.linkedContactIds || []).includes(c.id));
            const atsMatch = job.atsMatch;
            
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
                className={`flex flex-col gap-3 p-5 relative rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md ${isActiveJob ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                onClick={() => setSelectedDescriptionJob(job)}
              >
                {/* Selection Checkbox */}
                <div className="flex justify-start items-center" onClick={(e) => e.stopPropagation()}>
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
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Role & Company Header */}
                <div>
                  <h4 className="text-[1.15rem] font-extrabold font-heading text-text-primary">{job.role}</h4>
                  <div className="text-[0.85rem] text-text-secondary font-semibold mt-0.5">{job.company}</div>
                </div>

                {/* Location & Type & Match Score Badges */}
                <div className="flex gap-1.5 flex-wrap items-center">
                  {job.location && (
                    <span className={`${BADGE_BASE} bg-accent-blue/8 text-accent-blue text-[0.65rem]`}>
                      <MapPin size={8} className="mr-[-1px]" />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald text-[0.65rem]`}>
                      {job.type}
                    </span>
                  )}
                  {hasMasterResume && !!(job.notesText || '').trim() && (
                    atsMatch ? (
                      <span className={`${getMatchBadgeClass(atsMatch.match_percentage)} text-[0.65rem] inline-flex items-center gap-1`}>
                        <Sparkles size={8} />
                        <span>Match: {atsMatch.match_percentage}%</span>
                      </span>
                    ) : (
                      <span className={`${BADGE_BASE} bg-slate-100 text-slate-500 text-[0.65rem] inline-flex items-center gap-1`}>
                        <Sparkles size={8} />
                        <span>Not Scored</span>
                      </span>
                    )
                  )}
                  <span className={`${getStatusColorClass(job.status || 'Wishlist')} text-[0.65rem]`}>
                    {job.status || 'Wishlist'}
                  </span>
                  {job.linkStatus === 'login_required' && (
                    <span className={`${BADGE_BASE} bg-accent-rose/8 text-accent-rose text-[0.65rem] font-semibold`}>
                      🔑 Behind Login
                    </span>
                  )}
                  {job.linkStatus === 'generic_link' && (
                    <span className={`${BADGE_BASE} bg-accent-amber/8 text-amber-700 text-[0.65rem] font-semibold`}>
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
        <div className="flex flex-col gap-3">
          {filteredJobs.map(job => {
            const atsMatch = job.atsMatch;
            const isSelected = selectedJobs.includes(job.id);
            const isActiveJob = selectedDescriptionJob && selectedDescriptionJob.id === job.id;

            return (
              <div 
                key={job.id}
                className={`flex items-center justify-between p-[0.85rem_1.25rem] rounded-lg cursor-pointer gap-4 flex-wrap transition-all duration-150 ${isActiveJob ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                onClick={() => setSelectedDescriptionJob(job)}
              >
                {/* Left Side: Checkbox, Status Dot, Company & Role */}
                <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
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
                    className="w-4 h-4 cursor-pointer"
                  />
                  
                  {/* Status Dot */}
                  <div 
                    className="w-2 h-2 rounded-full shadow-sm shrink-0" 
                    style={{
                      background: getStatusColor(job.status || 'Wishlist'),
                      boxShadow: `0 0 6px ${getStatusColor(job.status || 'Wishlist')}80`
                    }} 
                  />

                  <div>
                    <strong className="text-[1rem] text-text-primary font-bold">{job.role}</strong>
                    <div className="text-[0.8rem] text-text-secondary">{job.company}</div>
                  </div>
                </div>

                {/* Right Side: Badges */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {job.location && (
                    <span className={`${BADGE_BASE} bg-accent-blue/8 text-accent-blue text-[0.65rem]`}>
                      <MapPin size={8} className="mr-[-1px]" />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald text-[0.65rem]`}>
                      {job.type}
                    </span>
                  )}
                  {hasMasterResume && !!(job.notesText || '').trim() && (
                    <span className={`${getMatchBadgeClass(matchScore)} text-[0.65rem]`}>
                      <Sparkles size={8} />
                      <span>Match: {matchScore}%</span>
                    </span>
                  )}
                  <span className={`${getStatusColorClass(job.status || 'Wishlist')} text-[0.65rem]`}>
                    {job.status || 'Wishlist'}
                  </span>
                  {job.linkStatus === 'login_required' && (
                    <span className={`${BADGE_BASE} bg-accent-rose/8 text-accent-rose text-[0.65rem] font-semibold`}>
                      🔑 Behind Login
                    </span>
                  )}
                  {job.linkStatus === 'generic_link' && (
                    <span className={`${BADGE_BASE} bg-accent-amber/8 text-amber-700 text-[0.65rem] font-semibold`}>
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
        <div className="w-[400px] shrink-0 max-lg:hidden" />
      )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {selectedDescriptionJob && (() => {
        const activeJob = jobApplications.find(j => j.id === selectedDescriptionJob.id);
        if (!activeJob) return null;

        const atsMatch = activeJob.atsMatch;
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
          <div className="w-[400px] shrink-0 bg-bg-card border border-border-color rounded-lg shadow-card flex flex-col fixed top-[100px] right-8 bottom-8 z-[100] overflow-hidden animate-slide-in-right max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-[9999]">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-elevated gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.1rem] font-extrabold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={activeJob.role}>
                  {activeJob.role}
                </h3>
                <div className="text-[0.85rem] text-text-secondary font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={activeJob.company}>
                  {activeJob.company}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete this application to ${activeJob.company}?`)) {
                      deleteResource(activeJob.id);
                      setSelectedDescriptionJob(null);
                    }
                  }}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                  title="Delete Application"
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setSelectedDescriptionJob(null)}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              
              {/* Status Section */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[0.7rem] font-bold text-text-muted uppercase">
                    Status Progress
                  </span>
                  <select
                    value={activeJob.status || 'Wishlist'}
                    onChange={(e) => handleStatusChange(activeJob.id, e.target.value)}
                    className={`badge ${getStatusColorClass(activeJob.status || 'Wishlist')}`}
                    className="border-none cursor-pointer outline-none font-bold py-[0.2rem] pr-[1.4rem] pl-[0.5rem] font-body appearance-none bg-[right_0.4rem_center] bg-no-repeat text-[0.7rem] rounded-full uppercase"
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                {/* Stepper Track */}
                <div className="relative h-1 bg-black/6 rounded-sm my-2 mb-5">
                  <div 
                    className="absolute left-0 top-0 h-full rounded-sm transition-[width] duration-300 cubic-bezier-[0.4,0,0.2,1]"
                    style={{
                      width: `${(currentStepIndex / 3) * 100}%`,
                      background: getStatusColor(activeJob.status || 'Wishlist')
                    }} 
                  />
                  
                  <div className="flex justify-between absolute w-full -top-1 left-0">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isActive = idx === currentStepIndex;
                      const stepColor = isCompleted ? getStatusColor(activeJob.status || 'Wishlist') : 'rgba(0,0,0,0.12)';
                      
                      return (
                        <div key={step} className="flex flex-col items-center relative">
                          <div 
                            className="w-3 h-3 rounded-full cursor-pointer z-[2] transition-all duration-300 cubic-bezier-[0.4,0,0.2,1]"
                            style={{
                              background: isActive ? '#ffffff' : stepColor,
                              border: `3px solid ${stepColor}`,
                              boxShadow: isActive ? `0 0 0 3px ${stepColor}40, var(--shadow-subtle)` : 'none'
                            }}
                            onClick={() => handleStatusChange(activeJob.id, step === 'Rejected' || step === 'Offer' ? (activeJob.status === 'Rejected' ? 'Rejected' : 'Offer') : step)}
                            title={`Set status to ${step}`}
                          />
                          <span className={`absolute top-4 text-[0.6rem] font-semibold whitespace-nowrap ${isActive ? 'text-text-primary' : 'text-text-muted'} ${idx === 0 ? 'left-0' : idx === steps.length - 1 ? 'right-0' : '-translate-x-1/2'}`}>
                            {step === 'Wishlist' ? 'Jobs' : step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Metadata Editing Fields */}
              <div className="flex flex-col gap-3.5 p-4 bg-slate-50 rounded-md border border-border-color">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Location</label>
                    <input 
                      type="text" 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeJob.location || ''} 
                      onChange={(e) => updateResource(activeJob.id, { location: e.target.value })}
                      placeholder="e.g. Remote"
                    />
                  </div>
                  <div>
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Job Type</label>
                    <select 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
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

                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Job Posting Link</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      className={INPUT_FIELD}
                      placeholder="Add job link (e.g. careers.google.com)..."
                      className="text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px] flex-1"
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
                      className={`${BTN_SECONDARY} flex items-center justify-center min-h-[32px] px-2 py-0 text-[0.725rem] gap-1 font-semibold`}
                      onClick={() => pullJobDescription(activeJob.id, activeJob.link)}
                      disabled={!activeJob.link || isPullingDesc}
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
                        className={`${BTN_SECONDARY} flex items-center justify-center min-h-[32px] w-8 p-0`}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {activeJob.linkStatus === 'login_required' && (
                    <div className="text-[0.725rem] text-accent-rose flex items-center gap-1 mt-1 font-semibold">
                      <span>🔑 Behind Login: Link requires session. Use public listing URL instead.</span>
                    </div>
                  )}
                  {activeJob.linkStatus === 'generic_link' && (
                    <div className="text-[0.725rem] text-accent-amber flex items-center gap-1 mt-1 font-semibold">
                      <span>⚠️ Not Direct Link: URL is generic page. Scraper needs specific posting.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ATS Match Overview */}
              {hasMasterResume && !!(activeJob.notesText || '').trim() && (
                <div>
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-2">
                    ATS Resume Match Quality
                  </label>
                  <div className="flex items-center justify-between p-3.5 border border-border-color rounded-md bg-bg-elevated">
                    {atsMatch ? (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-9 h-9 rounded-full border-[3px] flex items-center justify-center font-extrabold text-[0.85rem]"
                            style={{
                              borderColor: getScoreColor(atsMatch.match_percentage),
                              color: getScoreColor(atsMatch.match_percentage)
                            }}
                          >
                            {atsMatch.match_percentage}%
                          </div>
                          <div>
                            <div className="text-[0.8rem] font-bold">ATS Match Score</div>
                            <div className="text-[0.7rem] text-text-secondary">
                              Evaluated with Gemini AI
                            </div>
                          </div>
                        </div>
                        <button 
                          className={`${BTN_SM_SECONDARY} min-h-[28px] p-[0.15rem_0.45rem] text-[0.725rem]`}
                          onClick={() => {
                            setSelectedDescriptionJob(null);
                            setActiveBreakdownJob(activeJob);
                          }}
                        >
                          Breakdown
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 flex items-center justify-center text-slate-400">
                            <Sparkles size={14} />
                          </div>
                          <div>
                            <div className="text-[0.8rem] font-bold">ATS Match Score</div>
                            <div className="text-[0.7rem] text-text-secondary">
                              Not evaluated yet
                            </div>
                          </div>
                        </div>
                        <button 
                          className={`${BTN_SM_EMERALD} min-h-[28px] p-[0.15rem_0.45rem] text-[0.725rem]`}
                          onClick={(e) => {
                            e.stopPropagation();
                            runAtsMatch(activeJob.id, activeJob);
                          }}
                          disabled={isRunningMatchId === activeJob.id}
                        >
                          {isRunningMatchId === activeJob.id ? 'Running...' : 'Run Match'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Application Notes (editable) */}
              <div>
                <label className="text-[0.7rem] font-bold text-text-muted block mb-1.5 uppercase">
                  Job Description & Notes
                </label>
                <textarea
                  className={INPUT_FIELD}
                  rows={6}
                  placeholder="Paste details, requirements, notes, salary info, or interview steps here..."
                  className="text-[0.85rem] p-[0.5rem_0.65rem] leading-relaxed"
                  value={activeJob.notesText || ''}
                  onChange={(e) => handleNotesChange(activeJob.id, e.target.value)}
                />
              </div>

              {/* Document/Resume upload section */}
              <div className="border-t border-black/5 pt-4">
                <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-2">
                  Resume Document
                </label>
                {activeJob.resume ? (
                  <div className="flex items-center justify-between bg-black/2 p-2 rounded-sm border border-border-color">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <FileText size={16} color="var(--accent-blue)" className="shrink-0" />
                      <span 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = activeJob.resume.data;
                          link.download = activeJob.resume.name;
                          link.click();
                        }}
                        className="text-[0.8rem] text-accent-blue font-semibold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
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
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} className="transition-all duration-150 hover:text-accent-rose hover:scale-115" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label 
                      id={`resume-upload-drawer-label-${activeJob.id}`}
                      htmlFor={`resume-upload-drawer-${activeJob.id}`} 
                      className="inline-flex items-center gap-1.5 text-[0.8rem] text-text-secondary font-medium cursor-pointer py-1.5 px-3 rounded-sm border border-border-color bg-bg-card hover:bg-bg-elevated transition-all font-body"
                    >
                      <Plus size={14} />
                      <span>Upload Resume</span>
                    </label>
                    <input
                      id={`resume-upload-drawer-${activeJob.id}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                      className="hidden"
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
              <div className="border-t border-black/5 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[0.7rem] font-bold text-text-muted uppercase">Contacts Contacted</span>
                  <button
                    className={BTN_SM_SECONDARY}
                    onClick={() => setAddingContactJobId(addingContactJobId === activeJob.id ? null : activeJob.id)}
                    className={`${BTN_SM_SECONDARY} min-h-[28px] p-[0.15rem_0.45rem] text-[0.725rem]`}
                  >
                    <UserPlus size={12} />
                    <span>{addingContactJobId === activeJob.id ? 'Close' : 'Quick Add'}</span>
                  </button>
                </div>

                {/* Quick Add Form */}
                {addingContactJobId === activeJob.id && (
                  <form 
                    onSubmit={(e) => handleQuickAddContactSubmit(e, activeJob.id, activeJob)} 
                    className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-sm mb-2 border border-border-color"
                  >
                    <input 
                      type="text" 
                      placeholder="Contact name (required)..." 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[30px]`}
                      value={newContactName} 
                      onChange={(e) => setNewContactName(e.target.value)} 
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="LinkedIn URL (optional)..." 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[30px]`}
                      value={newContactLinkedin} 
                      onChange={(e) => setNewContactLinkedin(e.target.value)} 
                    />
                    <button type="submit" className={`${BTN_SM_EMERALD} self-end min-h-[28px] text-[0.725rem]`}>
                      Add & Link
                    </button>
                  </form>
                )}

                {/* Contact list mapping */}
                {linkedContacts.length > 0 && (
                  <div className="flex flex-col gap-1.5 my-2">
                    {linkedContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center justify-between p-[0.4rem_0.6rem] bg-slate-50 rounded-sm border border-border-color"
                      >
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[0.8rem] text-text-primary font-bold">{contact.name}</strong>
                          {contact.linkedinUrl && (
                            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <Linkedin size={10} color="#2563eb" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnlinkContact(activeJob.id, contact.id, activeJob)}
                          className="bg-transparent border-none text-text-muted cursor-pointer p-0.5 hover:text-accent-rose transition-colors"
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
                  <div className="flex items-center gap-2 mt-1.5">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleLinkContact(activeJob.id, e.target.value, activeJob);
                          e.target.value = '';
                        }
                      }}
                      className={INPUT_FIELD}
                      className="text-[0.725rem] p-[0.25rem_0.45rem] min-h-[30px]"
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
            <div className="p-[0.85rem_1.25rem] border-t border-border-color bg-slate-50 flex justify-end">
              <button className={BTN_SM_SECONDARY} onClick={() => setSelectedDescriptionJob(null)}>
                Close Details
              </button>
            </div>
          </div>
        );
      })()}

      {/* Manual Quick Add Form */}
      <div className="bg-bg-card rounded-lg p-6 shadow-card border border-border-color">
        <h4 className="text-[1rem] font-bold mb-3 flex items-center gap-1.5">
          <PlusCircle size={16} color="var(--accent-blue)" />
          <span>Add Single Job Application</span>
        </h4>
        <form onSubmit={handleQuickSubmit} className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 items-end">
          <div>
            <label htmlFor="quick-company" className="text-[0.75rem] font-semibold text-text-secondary block mb-1">Company *</label>
            <input
              id="quick-company"
              type="text"
              className={INPUT_FIELD}
              placeholder="e.g. Google"
              value={quickCompany}
              onChange={(e) => setQuickCompany(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quick-role" className="text-[0.75rem] font-semibold text-text-secondary block mb-1">Role / Title *</label>
            <input
              id="quick-role"
              type="text"
              className={INPUT_FIELD}
              placeholder="e.g. Product Designer"
              value={quickRole}
              onChange={(e) => setQuickRole(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quick-link" className="text-[0.75rem] font-semibold text-text-secondary block mb-1">Posting Link</label>
            <input
              id="quick-link"
              type="text"
              className={INPUT_FIELD}
              placeholder="e.g. careers.google.com"
              value={quickLink}
              onChange={(e) => setQuickLink(e.target.value)}
            />
          </div>
          <button type="submit" className={`${BTN_PRIMARY} min-h-[44px]`}>
            Add Application
          </button>
        </form>
      </div>

      {activeBreakdownJob && (() => {
        const breakdown = activeBreakdownJob.atsMatch;
        return (
          <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-5 animate-fadeIn" onClick={() => setActiveBreakdownJob(null)}>
            <div className="bg-bg-card border border-border-color rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col gap-4.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles color="var(--accent-blue)" size={22} />
                  <h2 className="text-[1.2rem] font-bold text-text-primary">ATS Match Breakdown</h2>
                </div>
                <button className={CLOSE_BTN} onClick={() => setActiveBreakdownJob(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5 mt-2">
                <div>
                  <h3 className="text-[1.1rem] font-extrabold text-text-primary">{activeBreakdownJob.company}</h3>
                  <div className="text-[0.9rem] text-text-secondary">{activeBreakdownJob.role}</div>
                </div>

                {!breakdown ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <Sparkles size={32} className="text-text-muted" />
                    <p className="text-sm text-text-secondary">Run the ATS Matcher to see a detailed breakdown of matching keywords and suggestions.</p>
                    <button 
                      className={BTN_PRIMARY}
                      onClick={() => runAtsMatch(activeBreakdownJob.id, activeBreakdownJob)}
                      disabled={isRunningMatchId === activeBreakdownJob.id}
                    >
                      {isRunningMatchId === activeBreakdownJob.id ? 'Analyzing...' : 'Run ATS Match'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 border border-border-color rounded-md p-4 flex items-center justify-between">
                      <div>
                        <div className="text-[0.8rem] text-text-secondary font-semibold">AI Match Score</div>
                        <div className="text-[1.1rem] font-extrabold" style={{ color: getScoreColor(breakdown.match_percentage) }}>
                          {breakdown.match_percentage >= 80 
                            ? 'Strong Match'
                            : breakdown.match_percentage >= 50
                            ? 'Good Match'
                            : 'Low Match'}
                        </div>
                      </div>
                      <div className="text-[2rem] font-black" style={{ color: getScoreColor(breakdown.match_percentage) }}>
                        {breakdown.match_percentage}%
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-accent-emerald">
                          <CheckCircle2 size={18} />
                          <strong className="text-[0.95rem] font-bold text-text-primary">Matched Skills ({breakdown.matching_skills?.length || 0})</strong>
                        </div>
                        <div className="flex flex-wrap gap-1.5 bg-[#fafdfb] border border-[#e6f6ec] rounded-md p-3 max-h-[150px] overflow-y-auto">
                          {breakdown.matching_skills?.length > 0 ? (
                            breakdown.matching_skills.map((word, i) => (
                              <span key={i} className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald p-[0.2rem_0.45rem] text-[0.75rem] font-semibold`}>
                                {word}
                              </span>
                            ))
                          ) : (
                            <span className="text-[0.8rem] text-text-muted">No matching skills found.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-accent-rose">
                          <AlertTriangle size={18} />
                          <strong className="text-[0.95rem] font-bold text-text-primary">Missing Keywords ({breakdown.missing_keywords?.length || 0})</strong>
                        </div>
                        <div className="flex flex-wrap gap-1.5 bg-[#fffbfa] border border-[#fdeee9] rounded-md p-3 max-h-[150px] overflow-y-auto">
                          {breakdown.missing_keywords?.length > 0 ? (
                            breakdown.missing_keywords.map((word, i) => (
                              <span key={i} className={`${BADGE_BASE} bg-accent-rose/8 text-[#e11d48] p-[0.2rem_0.45rem] text-[0.75rem] font-semibold`}>
                                {word}
                              </span>
                            ))
                          ) : (
                            <span className="text-[0.8rem] text-text-muted">No missing keywords found!</span>
                          )}
                        </div>
                      </div>
                      
                      {breakdown.profile_summary && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 text-accent-blue">
                            <Sparkles size={18} />
                            <strong className="text-[0.95rem] font-bold text-text-primary">Profile Summary</strong>
                          </div>
                          <div className="bg-[#f8fafc] border border-border-color rounded-md p-3 text-sm text-text-secondary leading-relaxed">
                            {breakdown.profile_summary}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
