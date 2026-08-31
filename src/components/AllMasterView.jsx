import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Database, Search, Trash2, ExternalLink } from 'lucide-react';
import Linkedin from './LinkedinIcon';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';

export default function AllMasterView() {
  const { allContacts: contacts, allResources: resources, allMeetings: meetings, deleteContact, deleteResource, deleteMeeting } = useTracker();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const allContacts = contacts.map(c => ({ ...c, itemType: 'Contact' }));
  const allResources = resources.map(r => ({ ...r, itemType: 'Resource' }));
  const allMeetings = meetings.map(m => ({ ...m, itemType: 'Meeting' }));

  let combined = [];
  if (typeFilter === 'all') combined = [...allContacts, ...allMeetings, ...allResources];
  else if (typeFilter === 'contacts') combined = allContacts;
  else if (typeFilter === 'meetings') combined = allMeetings;
  else if (typeFilter === 'resources') combined = allResources;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    combined = combined.filter(item => {
      const name = (item.name || '').toLowerCase();
      const org = (item.organization || '').toLowerCase();
      const notes = (item.notes || item.comments || '').toLowerCase();
      const cat = (item.category || item.kindOfContact || item.kindOfMeeting || '').toLowerCase();
      return name.includes(q) || org.includes(q) || notes.includes(q) || cat.includes(q);
    });
  }

  const handleDelete = (item) => {
    if (item.itemType === 'Contact') deleteContact(item.id);
    else if (item.itemType === 'Meeting') deleteMeeting(item.id);
    else if (item.itemType === 'Resource') deleteResource(item.id);
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Database size={22} className="text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">All Contacts & Resources Master Database</h3>
            <p className="text-xs text-muted-foreground">
              Unified master view of all recorded contacts, resources, and meetings across your job search.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'resources', label: 'Resources' }
          ].map(f => (
            <Button
              key={f.id}
              variant={typeFilter === f.id ? "default" : "outline"}
              size="xs"
              onClick={() => setTypeFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, organization, notes, or contact type..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {combined.length === 0 ? (
        <div className="text-center py-10 px-5 text-muted-foreground flex flex-col items-center gap-2.5">
          <Database className="w-11 h-11 text-muted-foreground opacity-50" />
          <p className="text-sm">No items found matching your filter or search query.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name / Resource</TableHead>
                <TableHead>Organization / Category</TableHead>
                <TableHead>Details / Notes</TableHead>
                <TableHead>Follow-up Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combined.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.itemType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    <div>{item.name}</div>
                    {item.linkedinUrl && (
                      <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline">
                        <Linkedin size={12} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {item.itemType === 'Resource' && item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline mt-1">
                        <ExternalLink size={12} />
                        <span className="ml-1">Link</span>
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{item.organization || item.category || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[280px]">
                    {item.comments || item.notes || '—'}
                  </TableCell>
                  <TableCell>
                    {item.followUpDate ? (
                      <span className="text-xs font-semibold text-primary">
                        {formatFriendlyDate(item.followUpDate)}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(item)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Delete item"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
