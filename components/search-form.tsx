'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  className?: string;
}

export default function SearchForm({ className = "" }: SearchFormProps) {
  const [location, setLocation] = useState('London');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const ukCities = [
    'London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 
    'Leeds', 'Liverpool', 'Bristol', 'Oxford', 'Cambridge',
    'Newcastle', 'Sheffield', 'Nottingham', 'Cardiff', 'Belfast'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    // Build search URL with parameters
    const searchParams = new URLSearchParams({
      q: searchQuery.trim(),
      location: location,
    });

    // Navigate to posts page with search parameters
    router.push(`/posts?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={`bg-white rounded-xl p-4 shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {ukCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rides, jobs, items..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>
        <button 
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  );
}
