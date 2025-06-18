"use client";
import { FC, useState, useEffect } from 'react';
import { Control, useController } from 'react-hook-form';
import { debounce } from 'lodash';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import { searchClients } from '@/services/clientService';
import type { ServiceReportFormValues } from '@/schemas/serviceReportSchema';
import { ClientHit } from '@/models/Client';

interface Props {
  control: Control<ServiceReportFormValues>;
  name: 'client';
}

const ClientSelect: FC<Props> = ({ control, name }) => {
  const { field } = useController({ control, name });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Array<ClientHit>>([]);
  const [selectedClient, setSelectedClient] = useState<ClientHit | null>(null);
  
  const [loading, setLoading] = useState(false);

  const debouncedSearch = debounce(async (value: string) => {
    setLoading(true);
    const results = await searchClients(value);
    setHits(results);
    setLoading(false);
  }, 300);

  useEffect(() => {
    if (query) debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedClient ? selectedClient.clientName : 'Select a client...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search clients..."
            value={query}
            onValueChange={val => setQuery(val)}
          />
          <CommandList>
            {loading && <div className="p-4 text-center">Loading...</div>}
            {!loading && hits.length === 0 && <CommandEmpty>No clients found.</CommandEmpty>}
            {!loading && hits.length > 0 && (
              <CommandGroup>
                {hits.map(hit => (
                  <CommandItem
                    key={hit.objectID}
                    onSelect={() => {
                      field.onChange({ id: hit.objectID, clientName: hit.clientName });
                      setSelectedClient(hit);
                      setOpen(false);
                    }}
                  >
                    {hit.clientName}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandItem
              onSelect={() => {
                field.onChange(null);
                setQuery('');
                setOpen(false);
              }}
            >
              <ChevronsUpDown className="mr-2 rotate-180" />
              Clear
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ClientSelect;