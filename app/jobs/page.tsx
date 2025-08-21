'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Briefcase, Building, Users, BookOpen, Search, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from '@/lib/auth';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationFilter from "@/components/location-filter";
import MessagingModal from '@/components/messaging-modal';
import { useLocationData, useLocation } from '@/contexts/LocationContext';
import { usePostsByCategory, usePosts } from '@/contexts/PostsContext';
import { apiClient } from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  price?: {
    amount: number;
    type: string;
    currency: string;
    range?: {
      min: number;
      max: number;
    };
  };
  location?: {
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  details?: {
    job?: {
      type: string;
      company: string;
      companySize: string;
      department: string;
      experienceLevel: string;
      requirements: string[];
      skills: string[];
      benefits: string[];
      remote: boolean;
      workLocation: string;
      responsibilities: string;
      applicationProcess: string;
      applicationDeadline: string;
      contactEmail: string;
    };
  };
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    preferredMethod: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likeCount?: number;
  isLiked?: boolean;
  distance?: number;
  distanceKm?: number;
}

export default function JobsPage() {
  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  const router = useRouter();
  
  // Use PostsContext for jobs posts
  const { posts: jobsPosts, loading, error } = usePostsByCategory('jobs');
  const { updatePost, allPosts } = usePosts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [locationInfo, setLocationInfo] = useState<any>(null);

  // Get available cities from jobs posts
  const availableCities = useMemo(() => {
    const jobCities = jobsPosts.map(post => post.location?.city).filter(Boolean);
    return Array.from(new Set(jobCities)).sort();
  }, [jobsPosts]);

  // Transform posts into jobs format
  const jobs = useMemo(() => {
    return jobsPosts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      price: post.price,
      location: post.location,
      details: post.details,
      author: post.author,
      contact: post.contact,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      views: post.views,
      likeCount: post.likeCount,
      isLiked: post.isLiked,
      distance: post.distance,
      distanceKm: post.distanceKm
    }));
  }, [jobsPosts]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleLocationFilterChange = useCallback((data: any) => {
    // Only update radius if it has changed and is a valid number
    if (data.radius !== undefined && data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
  }, [locationData.radius, updateRadius]);

  // Handle post job click with authentication check
  const handlePostClick = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    router.push('/jobs/post');
  };

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.details?.job?.company && job.details.job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      (job.location && job.location.city.toLowerCase().includes(locationFilter.toLowerCase()));
    
    const matchesCity = selectedCity === 'all' || 
      (job.location && job.location.city === selectedCity);
    
    const matchesType = !typeFilter || job.details?.job?.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType && matchesCity;
  });

  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'internship': 'bg-purple-100 text-purple-800',
      'freelance': 'bg-orange-100 text-orange-800'
    };
    return colors[type?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
          <div className="flex items-center">
            <Link href="/" className="mr-3 sm:mr-4">
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-500 mr-2 sm:mr-3" />
                Jobs & Internships
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Find student-friendly job opportunities across the UK</p>
            </div>
          </div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base px-4 sm:px-6"
            onClick={handlePostClick}
          >
            Post a Job
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Location Filter */}
          <div className="lg:col-span-1">
            <LocationFilter
              onFilterChange={handleLocationFilterChange}
              defaultRadius={locationData.radius || 20}
              compact={true}
            />
          </div>

          {/* Search and Type Filters */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search jobs, companies, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* City Filter */}
        {availableCities.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by City</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                      selectedCity === 'all'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Cities
                  </button>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ${
                        selectedCity === city
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
                <Link href="/">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              </div>
              {filteredJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <div 
                    onClick={() => router.push(`/jobs/${job._id}`)}
                    className="block group-hover:scale-[1.02] transition-transform duration-200"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={getTypeColor(job.details?.job?.type || 'full-time')}>
                                {job.details?.job?.type ? 
                                  job.details.job.type.split('-').map((word: string) => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join('-') : 
                                  'Full-time'
                                }
                              </Badge>
                            </div>
                            {job.price && (
                              <span className="text-lg font-bold text-orange-600 flex-shrink-0">
                                {job.price.currency === 'GBP' ? '£' : job.price.currency === 'USD' ? '$' : '€'}
                                {job.price.amount}
                                {job.price.type === 'hourly' ? '/hr' : job.price.type === 'monthly' ? '/month' : '/year'}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words line-clamp-2">
                            {job.title}
                          </h3>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                            {job.details?.job?.company && (
                              <div className="flex items-center min-w-0">
                                <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{job.details.job.company}</span>
                              </div>
                            )}
                            {job.location && (
                              <div className="flex items-center min-w-0">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {job.location.state ? `${job.location.city}, ${job.location.state}` : job.location.city}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{formatDate(job.createdAt)}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3 break-words line-clamp-3">{job.description}</p>
                          
                          {job.details?.job?.requirements && job.details.job.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {job.details.job.requirements.slice(0, 6).map((req: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs break-all">
                                  {req}
                                </Badge>
                              ))}
                              {job.details.job.requirements.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.details.job.requirements.length - 6} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  
                  {/* Action buttons - Prevent stretching on desktop */}
                  <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row gap-2 sm:justify-start">
                    <Button 
                      size="sm" 
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                        setShowMessagingModal(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Employer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessagingModal && selectedJob && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => {
            setShowMessagingModal(false);
            setSelectedJob(null);
          }}
          recipientId={selectedJob.author?._id}
          recipientName={selectedJob.author?.name || 'Job Poster'}
          rideTitle={selectedJob.title}
          rideId={selectedJob._id}
        />
      )}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center animate-fade-in">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Login Required</h3>
            <p className="text-gray-600 mb-6 text-sm">You must be logged in to post a job.</p>
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 rounded-xl mb-2"
              onClick={() => { window.location.href = '/auth'; }}
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              className="w-full py-2 rounded-xl"
              onClick={() => setShowAuthModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
