import React, { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactCombobox({ contacts = [], onSelect, placeholder = "Link existing contact...", className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!search) return sortedContacts;
    const lowerSearch = search.toLowerCase();
    return sortedContacts.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) || 
      (c.organization && c.organization.toLowerCase().includes(lowerSearch))
    );
  }, [search, sortedContacts]);

  const handleSelect = (id) => {
    onSelect(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal text-muted-foreground", className)}
        >
          <span className="truncate">{placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <PopoverContent className="w-[300px] p-0 z-[10000]" align="start">
        <Command>
          <CommandInput
            placeholder="Search contacts..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredContacts.length === 0 ? (
              <CommandEmpty>No contacts found.</CommandEmpty>
            ) : (
              filteredContacts.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => handleSelect(c.id)}
                  className="flex flex-col items-start gap-0.5 py-2 px-3 cursor-pointer"
                >
                  <span className="font-medium text-foreground">{c.name}</span>
                  {c.organization && (
                    <span className="text-xs text-muted-foreground">{c.organization}</span>
                  )}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
