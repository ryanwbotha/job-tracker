import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import CavemanLoader from '../components/ui/CavemanLoader';
import {
  loadTrackerData,
  putContact,
  updateContactInDb,
  removeContact,
  putMeeting,
  updateMeetingInDb,
  removeMeeting,
  putResource,
  updateResourceInDb,
  removeResource,
  putEmail,
  putTarget,
  updateTargetInDb,
  removeTarget,
  putHistoryEntry,
  putSetting,
  exportAllData,
  importAllData
} from '../utils/storage';
import { getDefaultFollowUpForContactType, getDefaultFollowUpForMeetingType, calculateFollowUpDate } from '../utils/followUpRules';
import { analyzeEmailInteraction } from '../utils/emailAnalyzer';
import { useTracker } from './useTracker';

export const TrackerContext = createContext();
export { useTracker };

const generateUniqueId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export function TrackerProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null); // { item, type, index }

  // Async initial load from Firestore
  useEffect(() => {
    const fallbackData = {
      contacts: [], meetings: [], resources: [], targets: [], history: [], emails: [],
      selectedDate: new Date().toISOString().split('T')[0]
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadTrackerData()
          .then(loadedData => {
            setData(loadedData || fallbackData);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Failed to load tracker data:', err);
            setData(fallbackData);
            setIsLoading(false);
          });
      } else {
        setData(fallbackData);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to log history event
  const logActivity = (actionText, category = 'General') => {
    const newEntry = {
      id: generateUniqueId('h'),
      timestamp: new Date().toISOString(),
      dateString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionText,
      category,
      date: data.selectedDate
    };
    setData(prev => ({
      ...prev,
      history: [newEntry, ...(prev.history || [])]
    }));
    putHistoryEntry(newEntry).catch(err => console.error('DB: history write failed', err));
  };

  // Actions for Date
  const setSelectedDate = (dateString) => {
    setData(prev => ({ ...prev, selectedDate: dateString }));
    putSetting('selectedDate', dateString).catch(err => console.error('DB: setting write failed', err));
  };

  // Actions for Resources (15 Daily Target)
  const addResource = (resource) => {
    const newResource = {
      name: '',
      category: 'General',
      notes: '',
      ...resource,
      id: generateUniqueId('res'),
      date: data.selectedDate
    };
    setData(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
    putResource(newResource).catch(err => console.error('DB: resource write failed', err));
    if (newResource.name) {
      logActivity(`Identified resource "${newResource.name}"`, 'Resource');
    }
    return newResource;
  };

  const updateResource = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === id ? { ...r, ...updatedFields } : r)
    }));
    updateResourceInDb(id, updatedFields).catch(err => console.error('DB: resource update failed', err));
  };

  const updateResourceSlot = (slotIndex, updatedFields) => {
    const filteredResources = (data.resources || []).filter(r => r.date === data.selectedDate);
    const existingItem = filteredResources[slotIndex];

    if (existingItem) {
      setData(prev => ({
        ...prev,
        resources: prev.resources.map(r => r.id === existingItem.id ? { ...r, ...updatedFields } : r)
      }));
      updateResourceInDb(existingItem.id, updatedFields).catch(err => console.error('DB: resource update failed', err));
    } else {
      const newResource = {
        id: generateUniqueId('res'),
        name: '',
        category: 'Company Directory',
        notes: '',
        date: data.selectedDate,
        ...updatedFields
      };
      setData(prev => ({
        ...prev,
        resources: [...prev.resources, newResource]
      }));
      putResource(newResource).catch(err => console.error('DB: resource write failed', err));
    }
  };

  const deleteResource = (id) => {
    const target = data.resources.find(r => r.id === id);
    if (target) {
      setLastDeleted({ item: target, type: 'resource' });
      setData(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r.id !== id)
      }));
      removeResource(id).catch(err => console.error('DB: resource delete failed', err));
      logActivity(`Deleted resource "${target.name || 'Resource'}"`, 'Resource');
    }
  };

  // Actions for Contacts (10 Daily Target)
  const addContact = (contactData) => {
    const kind = contactData.kindOfContact || 'Network Call';
    const autoDays = getDefaultFollowUpForContactType(kind);
    const autoFollowUp = contactData.followUpDate || calculateFollowUpDate(autoDays);

    const newContact = {
      id: generateUniqueId('c'),
      name: contactData.name || '',
      organization: contactData.organization || '',
      emailPhone: contactData.emailPhone || '',
      linkedinUrl: contactData.linkedinUrl || '',
      comments: contactData.comments || '',
      kindOfContact: kind,
      followUpDate: autoFollowUp,
      status: contactData.status || 'Active',
      date: data.selectedDate
    };

    setData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
    putContact(newContact).catch(err => console.error('DB: contact write failed', err));
    if (newContact.name) {
      logActivity(`Added contact "${newContact.name}" (${newContact.organization || 'General'})`, 'Contact');
    }
    return newContact;
  };

  const updateContact = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    }));
    updateContactInDb(id, updatedFields).catch(err => console.error('DB: contact update failed', err));
  };

  const updateContactSlot = (slotIndex, updatedFields) => {
    const filteredContacts = (data.contacts || []).filter(c => c.date === data.selectedDate);
    const existingItem = filteredContacts[slotIndex];

    if (existingItem) {
      setData(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => c.id === existingItem.id ? { ...c, ...updatedFields } : c)
      }));
      updateContactInDb(existingItem.id, updatedFields).catch(err => console.error('DB: contact update failed', err));
    } else {
      const newContact = {
        id: generateUniqueId('c'),
        name: '',
        organization: '',
        emailPhone: '',
        linkedinUrl: '',
        comments: '',
        kindOfContact: 'Network Call',
        followUpDate: calculateFollowUpDate(3),
        status: 'Active',
        date: data.selectedDate,
        ...updatedFields
      };
      setData(prev => ({
        ...prev,
        contacts: [...prev.contacts, newContact]
      }));
      putContact(newContact).catch(err => console.error('DB: contact write failed', err));
    }
  };

  const deleteContact = (id) => {
    const target = data.contacts.find(c => c.id === id);
    if (target) {
      setLastDeleted({ item: target, type: 'contact' });
      setData(prev => ({
        ...prev,
        contacts: prev.contacts.filter(c => c.id !== id)
      }));
      removeContact(id).catch(err => console.error('DB: contact delete failed', err));
      logActivity(`Deleted contact "${target.name || 'Contact'}"`, 'Contact');
    }
  };

  // Actions for Meetings (2 Daily Target)
  const addMeeting = (meetingData) => {
    const kind = meetingData.kindOfMeeting || 'Informational Interview';
    const autoDays = getDefaultFollowUpForMeetingType(kind);
    const autoFollowUp = meetingData.followUpDate || calculateFollowUpDate(autoDays);

    const newMeeting = {
      id: generateUniqueId('m'),
      name: meetingData.name || '',
      organization: meetingData.organization || '',
      emailPhone: meetingData.emailPhone || '',
      linkedinUrl: meetingData.linkedinUrl || '',
      comments: meetingData.comments || '',
      kindOfMeeting: kind,
      followUpDate: autoFollowUp,
      status: meetingData.status || 'Upcoming',
      date: data.selectedDate
    };

    setData(prev => ({
      ...prev,
      meetings: [...prev.meetings, newMeeting]
    }));
    putMeeting(newMeeting).catch(err => console.error('DB: meeting write failed', err));
    if (newMeeting.name) {
      logActivity(`Scheduled meeting with "${newMeeting.name}" (${kind})`, 'Meeting');
    }
    return newMeeting;
  };

  const updateMeeting = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      meetings: prev.meetings.map(m => m.id === id ? { ...m, ...updatedFields } : m)
    }));
    updateMeetingInDb(id, updatedFields).catch(err => console.error('DB: meeting update failed', err));
  };

  const updateMeetingSlot = (slotIndex, updatedFields) => {
    const filteredMeetings = (data.meetings || []).filter(m => m.date === data.selectedDate);
    const existingItem = filteredMeetings[slotIndex];

    if (existingItem) {
      setData(prev => ({
        ...prev,
        meetings: prev.meetings.map(m => m.id === existingItem.id ? { ...m, ...updatedFields } : m)
      }));
      updateMeetingInDb(existingItem.id, updatedFields).catch(err => console.error('DB: meeting update failed', err));
    } else {
      const newMeeting = {
        id: generateUniqueId('m'),
        name: '',
        organization: '',
        emailPhone: '',
        linkedinUrl: '',
        comments: '',
        kindOfMeeting: 'Informational Interview',
        followUpDate: calculateFollowUpDate(3),
        status: 'Upcoming',
        date: data.selectedDate,
        ...updatedFields
      };
      setData(prev => ({
        ...prev,
        meetings: [...prev.meetings, newMeeting]
      }));
      putMeeting(newMeeting).catch(err => console.error('DB: meeting write failed', err));
    }
  };

  const deleteMeeting = (id) => {
    const target = data.meetings.find(m => m.id === id);
    if (target) {
      setLastDeleted({ item: target, type: 'meeting' });
      setData(prev => ({
        ...prev,
        meetings: prev.meetings.filter(m => m.id !== id)
      }));
      removeMeeting(id).catch(err => console.error('DB: meeting delete failed', err));
      logActivity(`Deleted meeting with "${target.name || 'Meeting'}"`, 'Meeting');
    }
  };

  // Actions for Target Companies
  const addTarget = (targetData) => {
    // To support old addTarget(string)
    const newTarget = typeof targetData === 'string' 
      ? { id: generateUniqueId('t'), name: targetData.toUpperCase(), website: '', summary: '', contacts: '', notes: '' }
      : { id: generateUniqueId('t'), name: '', website: '', summary: '', contacts: '', notes: '', ...targetData };

    if (!newTarget.name) return;
    
    // Avoid duplicate names if needed, but since we are using IDs, it's less critical.
    // We'll just add it.
    setData(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget]
    }));
    putTarget(newTarget).catch(err => console.error('DB: target write failed', err));
    logActivity(`Added target company "${newTarget.name}"`, 'Target');
  };

  const updateTarget = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      targets: prev.targets.map(t => t.id === id ? { ...t, ...updatedFields } : t)
    }));
    updateTargetInDb(id, updatedFields).catch(err => console.error('DB: target update failed', err));
  };

  const updateTargetSlot = (slotIndex, updatedFields) => {
    // Targets are global, not filtered by selectedDate
    const existingItem = data.targets[slotIndex];

    if (existingItem) {
      setData(prev => ({
        ...prev,
        targets: prev.targets.map(t => t.id === existingItem.id ? { ...t, ...updatedFields } : t)
      }));
      updateTargetInDb(existingItem.id, updatedFields).catch(err => console.error('DB: target update failed', err));
    } else {
      const newTarget = {
        id: generateUniqueId('t'),
        name: '',
        website: '',
        summary: '',
        contacts: '',
        notes: '',
        ...updatedFields
      };
      setData(prev => ({
        ...prev,
        targets: [...prev.targets, newTarget]
      }));
      putTarget(newTarget).catch(err => console.error('DB: target write failed', err));
    }
  };

  const deleteTarget = (id) => {
    const target = data.targets.find(t => t.id === id) || (typeof data.targets[0] === 'string' ? data.targets.find(t => t === id) : null);
    if (!target) return;
    
    setLastDeleted({ item: target, type: 'target' });
    setData(prev => ({
      ...prev,
      targets: prev.targets.filter(t => (t.id ? t.id !== id : t !== id))
    }));
    removeTarget(id).catch(err => console.error('DB: target delete failed', err));
    logActivity(`Deleted target "${target.name || target}"`, 'Target');
  };

  // Undo Restoration Action
  const restoreLastDeleted = () => {
    if (!lastDeleted) return;

    const { item, type } = lastDeleted;
    if (type === 'resource') {
      setData(prev => ({ ...prev, resources: [...prev.resources, item] }));
      putResource(item).catch(err => console.error('DB: restore failed', err));
    } else if (type === 'contact') {
      setData(prev => ({ ...prev, contacts: [...prev.contacts, item] }));
      putContact(item).catch(err => console.error('DB: restore failed', err));
    } else if (type === 'meeting') {
      setData(prev => ({ ...prev, meetings: [...prev.meetings, item] }));
      putMeeting(item).catch(err => console.error('DB: restore failed', err));
    } else if (type === 'target') {
      setData(prev => ({ ...prev, targets: [...prev.targets, item] }));
      putTarget(item).catch(err => console.error('DB: restore failed', err));
    }

    logActivity(`Restored deleted ${type} "${item.name || item}"`, 'Undo');
    setLastDeleted(null);
  };

  const clearLastDeleted = () => {
    setLastDeleted(null);
  };

  // Pseudo-Email Assistant Actions
  const processIncomingEmail = (emailContent, senderHint = '', subject = '') => {
    const analysis = analyzeEmailInteraction(emailContent, senderHint, subject);
    if (!analysis) return null;

    const emailEntry = {
      id: generateUniqueId('e'),
      sender: senderHint || analysis.contactName + ' <' + analysis.email + '>',
      subject: subject || 'Network Interaction / Opportunity Discussion',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      body: emailContent,
      analyzed: true,
      analysis
    };

    if (analysis.isMeeting) {
      addMeeting({
        name: analysis.contactName,
        organization: analysis.organization,
        emailPhone: analysis.email,
        linkedinUrl: analysis.linkedinUrl,
        comments: analysis.comments,
        kindOfMeeting: analysis.kindOfMeeting,
        followUpDate: analysis.followUpDate,
        status: 'Upcoming'
      });
    } else {
      addContact({
        name: analysis.contactName,
        organization: analysis.organization,
        emailPhone: analysis.email,
        linkedinUrl: analysis.linkedinUrl,
        comments: analysis.comments,
        kindOfContact: analysis.kindOfContact,
        followUpDate: analysis.followUpDate,
        status: 'Active'
      });
    }

    setData(prev => ({
      ...prev,
      emails: [emailEntry, ...prev.emails]
    }));
    putEmail(emailEntry).catch(err => console.error('DB: email write failed', err));

    logActivity(`Analyzed email thread from "${analysis.contactName}"`, 'Email');
    return emailEntry;
  };

  // Loading guard — don't render children until IndexedDB data is loaded
  if (isLoading || !data) {
    return <CavemanLoader />;
  }

  // Filter lists by selectedDate for daily views (or bypass if 'ALL')
  const isFilterAll = data.selectedDate === 'ALL';
  const filteredResources = isFilterAll ? (data.resources || []) : (data.resources || []).filter(r => r.date === data.selectedDate);
  const filteredContacts = isFilterAll ? (data.contacts || []) : (data.contacts || []).filter(c => c.date === data.selectedDate);
  const filteredMeetings = isFilterAll ? (data.meetings || []) : (data.meetings || []).filter(m => m.date === data.selectedDate);
  const filteredHistory = isFilterAll ? (data.history || []) : (data.history || []).filter(h => h.date === data.selectedDate);

  return (
    <TrackerContext.Provider value={{
      selectedDate: data.selectedDate,
      targets: data.targets,
      resources: filteredResources,
      contacts: filteredContacts,
      meetings: filteredMeetings,
      emails: data.emails,
      history: filteredHistory,
      allResources: data.resources,
      allContacts: data.contacts,
      allMeetings: data.meetings,
      allHistory: data.history || [],
      lastDeleted,
      isLoading,
      setSelectedDate,
      addResource,
      updateResource,
      updateResourceSlot,
      deleteResource,
      addContact,
      updateContact,
      updateContactSlot,
      deleteContact,
      addMeeting,
      updateMeeting,
      updateMeetingSlot,
      deleteMeeting,
      addTarget,
      updateTarget,
      updateTargetSlot,
      deleteTarget,
      restoreLastDeleted,
      clearLastDeleted,
      processIncomingEmail,
      exportAllData,
      importAllData
    }}>
      {children}
    </TrackerContext.Provider>
  );
}
