'use client';

import Link from 'next/link';
import Navigation from '@/components/navigation';
import { ArrowLeft } from 'lucide-react';
import JobPostingWizard from '@/components/jobs/job-posting-wizard';

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/jobs" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600 mt-2">
            Reach thousands of talented students and recent graduates across UK universities
          </p>
        </div>

        {/* Job Posting Wizard */}
        <JobPostingWizard />
      </div>
    </div>
  );
}
