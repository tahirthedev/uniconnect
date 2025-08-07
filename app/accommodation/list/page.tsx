'use client';

import { useState } from 'react';
import Navigation from '@/components/navigation';
import ListingWizard from '@/components/accommodation/listing-wizard';

export default function ListAccommodationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <ListingWizard />
    </div>
  );
}
