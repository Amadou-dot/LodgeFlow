'use client';
import CabinCard from '@/components/CabinCard';
import StandardFilters from '@/components/StandardFilters';
import { PageHeader } from '@/components/ui';
import { useCabins } from '@/hooks/useCabins';
import { Spinner } from '@heroui/spinner';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import type { Cabin, CabinsQueryParams } from '@/types';

interface CabinsFilters extends CabinsQueryParams {}

export default function CabinsPage() {
  const [filters, setFilters] = useState<CabinsFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Combine filters with search
  const queryParams = {
    ...filters,
    search: searchTerm || undefined,
  };
  
  const { data: cabins, isLoading, error } = useCabins(queryParams);

  // Sort options for the filters
  const sortOptions = [
    { key: 'name', label: 'Name', value: 'name' },
    { key: 'price', label: 'Price', value: 'price' },
    { key: 'capacity', label: 'Capacity', value: 'capacity' },
  ];

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
  };

  // Handle sort order change
  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
  };

  // Sort the data based on current sort settings
  const sortedCabins = cabins ? [...cabins].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Cabin];
    let bValue: any = b[sortBy as keyof Cabin];
    
    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  // Additional filters component
  const additionalFilters = (
    <div className="flex flex-wrap gap-2">
      <Select
        placeholder="Capacity"
        className="w-40"
        size="sm"
        selectedKeys={filters.capacity ? [filters.capacity.toString()] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const capacity = selected ? parseInt(selected) : undefined;
          setFilters(prev => ({ ...prev, capacity }));
        }}
      >
        <SelectItem key="1">1+ guests</SelectItem>
        <SelectItem key="2">2+ guests</SelectItem>
        <SelectItem key="4">4+ guests</SelectItem>
        <SelectItem key="6">6+ guests</SelectItem>
        <SelectItem key="8">8+ guests</SelectItem>
      </Select>
      
      <Select
        placeholder="Min Price"
        className="w-40"
        size="sm"
        selectedKeys={filters.minPrice ? [filters.minPrice.toString()] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const minPrice = selected ? parseInt(selected) : undefined;
          setFilters(prev => ({ ...prev, minPrice }));
        }}
      >
        <SelectItem key="50">$50+</SelectItem>
        <SelectItem key="100">$100+</SelectItem>
        <SelectItem key="150">$150+</SelectItem>
        <SelectItem key="200">$200+</SelectItem>
      </Select>
      
      <Select
        placeholder="Max Price"
        className="w-40"
        size="sm"
        selectedKeys={filters.maxPrice ? [filters.maxPrice.toString()] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const maxPrice = selected ? parseInt(selected) : undefined;
          setFilters(prev => ({ ...prev, maxPrice }));
        }}
      >
        <SelectItem key="100">Up to $100</SelectItem>
        <SelectItem key="150">Up to $150</SelectItem>
        <SelectItem key="200">Up to $200</SelectItem>
        <SelectItem key="300">Up to $300</SelectItem>
      </Select>
      
      <Button
        size="sm"
        variant="bordered"
        onPress={() => {
          setFilters({});
          setSearchTerm('');
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: CabinsFilters = {
      capacity: urlParams.get('capacity')
        ? parseInt(urlParams.get('capacity')!)
        : undefined,
      minPrice: urlParams.get('minPrice')
        ? parseInt(urlParams.get('minPrice')!)
        : undefined,
      maxPrice: urlParams.get('maxPrice')
        ? parseInt(urlParams.get('maxPrice')!)
        : undefined,
    };
    setFilters(initialFilters);
  }, []);

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <h2 className='text-xl font-bold text-red-500 mb-2'>
            Error Loading Cabins
          </h2>
          <p className='text-default-500'>
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading cabins'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto py-8'>
      {/* Header */}
      <div className='text-center mb-8'>
        <PageHeader
          title='Our'
          titleAccent='Cabins'
          subtitle='Discover our collection of beautiful cabins, each offering unique experiences in the heart of nature. From cozy retreats to spacious family accommodations.'
        />
      </div>

      {/* Filters */}
      <StandardFilters
        searchPlaceholder="Search cabins by name, amenities, or description..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        sortOptions={sortOptions}
        currentSort={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        additionalFilters={additionalFilters}
        totalCount={sortedCabins?.length}
        itemName="cabin"
      />

      {/* Loading State */}
      {isLoading && (
        <div className='flex flex-col justify-center items-center py-12 gap-4'>
          <Spinner size='lg' label='Loading cabins...' />
        </div>
      )}

      {/* Cabins Grid */}
      {!isLoading && sortedCabins && (
        <>
          {sortedCabins.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {sortedCabins.map(cabin => (
                <CabinCard key={cabin._id} cabin={cabin} />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <h3 className='text-xl font-semibold mb-2'>No cabins found</h3>
              <p className='text-default-500 mb-4'>
                Try adjusting your search or filters to see more options.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
