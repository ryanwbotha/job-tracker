import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Plus, Trash2, ExternalLink, Star, X, ArrowUpDown, ArrowUp, ArrowDown, Search, Grid, List } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function ResourceTracker() {
  const { resources, addResource, deleteResource, updateResource, allContacts } = useTracker();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Company Directory');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('To Explore');
  const [contactPerson, setContactPerson] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  
  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedResources, setSelectedResources] = useState([]);
  const [activeResourceId, setActiveResourceId] = useState(null);

  // Sorting and Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('index');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addResource({
      name,
      category,
      notes,
      url,
      rating: Number(rating),
      status,
      contactPerson
    });
    setName('');
    setNotes('');
    setUrl('');
    setRating(0);
    setStatus('To Explore');
    setContactPerson('');
    setShowAdd(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} className="ml-1 opacity-50 align-middle inline" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={12} className="ml-1 text-primary align-middle inline" />
      : <ArrowDown size={12} className="ml-1 text-primary align-middle inline" />;
  };

  // Filter resources
  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === 'All' || res.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || (res.status || 'To Explore') === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === 'index') return 0;
    
    let aVal = '';
    let bVal = '';
    
    if (sortBy === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortBy === 'category') {
      aVal = a.category.toLowerCase();
      bVal = b.category.toLowerCase();
    } else if (sortBy === 'status') {
      aVal = (a.status || 'To Explore').toLowerCase();
      bVal = (b.status || 'To Explore').toLowerCase();
    } else if (sortBy === 'rating') {
      aVal = a.rating || 0;
      bVal = b.rating || 0;
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const activeResource = resources.find(r => r.id === activeResourceId);

  return (
    <div className="flex flex-col gap-5">
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-2">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Compass size={22} className="text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Daily Resources Identified (Goal: 15)</h3>
            </div>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Grid/List Layout Toggle */}
          <div className="flex bg-muted p-1 rounded-lg items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className={viewMode === 'grid' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className={viewMode === 'list' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        <Sheet open={showAdd} onOpenChange={setShowAdd}>
          <SheetTrigger render={
            <Button className="gap-2">
              <Plus size={16} />
              <span>{showAdd ? 'Cancel' : 'Add Resource'}</span>
            </Button>
          } />
          <SheetContent>
            <div className="mx-auto w-full max-w-2xl px-4 pb-8">
              <SheetHeader>
                <SheetTitle>Add Resource</SheetTitle>
                <SheetDescription>Track a new company directory, job board, or network.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 px-4 mt-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Resource Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. TechCorp Careers, Tech Journal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Company Directory">Company Directory</SelectItem>
                        <SelectItem value="Job Board">Job Board</SelectItem>
                        <SelectItem value="Network Community">Network Community</SelectItem>
                        <SelectItem value="Target Employer">Target Employer</SelectItem>
                        <SelectItem value="Professional Association">Professional Association</SelectItem>
                        <SelectItem value="Recruitment Agency">Recruitment Agency</SelectItem>
                        <SelectItem value="Event/Conference">Event/Conference</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">URL</label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Explore">To Explore</SelectItem>
                        <SelectItem value="Exploring">Exploring</SelectItem>
                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-xs font-semibold text-muted-foreground">Linked Contact</label>
                    <Select value={contactPerson} onValueChange={setContactPerson}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- No Contact Linked --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- No Contact Linked --</SelectItem>
                        {allContacts.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name} {c.organization ? `(${c.organization})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Rating</label>
                    <div className="flex gap-1 py-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="bg-transparent border-none cursor-pointer p-0"
                        >
                          <Star
                            size={18}
                            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Notes / Context</label>
                  <Textarea
                    className="min-h-[70px]"
                    placeholder="Key findings, notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border">
                  <SheetClose render={
                    <Button variant="outline" type="button">Cancel</Button>
                  } />
                  <Button type="submit" className="gap-2">
                    <Plus size={16} />
                    <span>Save Resource</span>
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources by name, notes, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Category:</span>
            <Select
              className="w-auto h-9 text-xs"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Company Directory">Company Directory</option>
              <option value="Job Board">Job Board</option>
              <option value="Network Community">Network Community</option>
              <option value="Target Employer">Target Employer</option>
              <option value="Professional Association">Professional Association</option>
              <option value="Recruitment Agency">Recruitment Agency</option>
              <option value="Event/Conference">Event/Conference</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <Select
              className="w-auto h-9 text-xs"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="To Explore">To Explore</option>
              <option value="Exploring">Exploring</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Applied">Applied</option>
              <option value="Archived">Archived</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Grid or List View */}
      {sortedResources.length === 0 ? (
        <Card className="text-center p-12 text-muted-foreground flex flex-col items-center gap-2.5">
          <Compass className="w-11 h-11 text-muted-foreground opacity-50" />
          <p className="text-sm">No resources found. Try adjusting filters or click "Add Resource".</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {sortedResources.map(res => {
            const isSelected = selectedResources.includes(res.id);
            const isActive = activeResourceId === res.id;

            return (
              <Card
                key={res.id}
                className={`flex flex-col gap-3 p-5 relative cursor-pointer transition-all hover:border-primary ${isActive ? 'border-2 border-primary bg-accent/30' : isSelected ? 'border-primary' : ''}`}
                onClick={() => setActiveResourceId(res.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-base font-bold text-foreground leading-tight">{res.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{res.category}</p>
                  </div>
                  <Badge variant="secondary">
                    {res.status || 'To Explore'}
                  </Badge>
                </div>

                {res.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{res.notes}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border text-xs">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={star <= (res.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} />
                      <span>Visit</span>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedResources.map(res => {
            const isActive = activeResourceId === res.id;

            return (
              <Card
                key={res.id}
                className={`flex items-center justify-between p-4 cursor-pointer gap-4 flex-wrap transition-all ${isActive ? 'border-2 border-primary bg-accent/30' : ''}`}
                onClick={() => setActiveResourceId(res.id)}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-[240px]">
                  <div>
                    <strong className="text-sm text-foreground font-bold">{res.name}</strong>
                    <div className="text-xs text-muted-foreground">{res.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary">{res.status || 'To Explore'}</Badge>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={star <= (res.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Side Panel for Editing Active Resource */}
      {activeResource && (
        <Card className="w-[400px] shrink-0 flex flex-col fixed top-[60px] right-0 bottom-0 z-50 rounded-none border-l shadow-2xl p-5 overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-base font-bold text-foreground">{activeResource.name}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  deleteResource(activeResource.id);
                  setActiveResourceId(null);
                }}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setActiveResourceId(null)}
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Resource Name</label>
              <Input
                value={activeResource.name}
                onChange={(e) => updateResource(activeResource.id, { name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <Select
                value={activeResource.category}
                onChange={(e) => updateResource(activeResource.id, { category: e.target.value })}
              >
                <option value="Company Directory">Company Directory</option>
                <option value="Job Board">Job Board</option>
                <option value="Network Community">Network Community</option>
                <option value="Target Employer">Target Employer</option>
                <option value="Professional Association">Professional Association</option>
                <option value="Recruitment Agency">Recruitment Agency</option>
                <option value="Event/Conference">Event/Conference</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">URL</label>
              <Input
                type="url"
                value={activeResource.url || ''}
                onChange={(e) => updateResource(activeResource.id, { url: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select
                value={activeResource.status || 'To Explore'}
                onChange={(e) => updateResource(activeResource.id, { status: e.target.value })}
              >
                <option value="To Explore">To Explore</option>
                <option value="Exploring">Exploring</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Applied">Applied</option>
                <option value="Archived">Archived</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Notes</label>
              <Textarea
                className="min-h-[90px]"
                value={activeResource.notes || ''}
                onChange={(e) => updateResource(activeResource.id, { notes: e.target.value })}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
