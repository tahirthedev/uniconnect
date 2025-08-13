'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  Users, 
  DollarSign,
  Briefcase,
  Mail,
  MessageCircle,
  Globe,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MessagingModal from '@/components/messaging-modal';

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
    type?: string;
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
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getPost(id as string);
        
        if (response && response.post) {
          setJob(response.post);
        } else {
          // Job not found
          router.push('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSalary = (price: Job['price']) => {
    if (!price) return 'Salary not specified';
    
    const symbol = price.currency === 'GBP' ? '£' : price.currency === 'USD' ? '$' : '€';
    if (price.range) {
      return `${symbol}${price.range.min?.toLocaleString()}-${price.range.max?.toLocaleString()}${price.type === 'hourly' ? '/hr' : price.type === 'monthly' ? '/month' : '/year'}`;
    }
    return `${symbol}${price.amount?.toLocaleString()}${price.type === 'hourly' ? '/hr' : price.type === 'monthly' ? '/month' : '/year'}`;
  };

  const handleContactEmployer = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to contact employers');
      window.location.href = '/auth';
      return;
    }
    
    setShowMessagingModal(true);
  };

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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h1>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link href="/jobs">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getTypeColor(job.details?.job?.type || 'full-time')}>
                    {job.details?.job?.type ? 
                      job.details.job.type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join('-') : 
                      'Full-time'
                    }
                  </Badge>
                  {job.details?.job?.remote && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Globe className="h-3 w-3 mr-1" />
                      Remote
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{job.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  {job.details?.job?.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[200px]" title={job.details.job.company}>
                        {job.details.job.company}
                      </span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {job.location.state ? `${job.location.city}, ${job.location.state}` : job.location.city}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                </div>

                <div className="text-xl md:text-2xl font-bold text-orange-600 mb-4">
                  {formatSalary(job.price)}
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <div className="max-h-32 overflow-hidden relative group">
                    <p className="whitespace-pre-wrap break-words">{job.description}</p>
                    {job.description.length > 300 && (
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent group-hover:opacity-0 transition-opacity"></div>
                    )}
                  </div>
                  {job.description.length > 300 && (
                    <button 
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 focus:outline-none"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const desc = target.closest('.text-gray-700')?.querySelector('.max-h-32');
                        if (desc) {
                          desc.classList.toggle('max-h-32');
                          desc.classList.toggle('max-h-none');
                          target.textContent = desc.classList.contains('max-h-32') ? 'Read more' : 'Read less';
                        }
                      }}
                    >
                      Read more
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            {job.details?.job?.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed">
                    <div className="max-h-48 overflow-hidden relative group">
                      <p className="whitespace-pre-line break-words">
                        {job.details.job.responsibilities}
                      </p>
                      {job.details.job.responsibilities.length > 500 && (
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent group-hover:opacity-0 transition-opacity"></div>
                      )}
                    </div>
                    {job.details.job.responsibilities.length > 500 && (
                      <button 
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 focus:outline-none"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          const container = target.closest('.text-gray-700')?.querySelector('.max-h-48');
                          if (container) {
                            container.classList.toggle('max-h-48');
                            container.classList.toggle('max-h-none');
                            target.textContent = container.classList.contains('max-h-48') ? 'Show more' : 'Show less';
                          }
                        }}
                      >
                        Show more
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {job.details?.job?.requirements && job.details.job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.details.job.requirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 break-words leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.details?.job?.skills && job.details.job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.details.job.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.details.job.skills.length > 8 && (
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        +{job.details.job.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                  {job.details.job.skills.length > 8 && (
                    <details className="mt-3">
                      <summary className="text-orange-600 hover:text-orange-700 text-sm font-medium cursor-pointer focus:outline-none">
                        View all skills
                      </summary>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.details.job.skills.slice(8).map((skill, index) => (
                          <Badge key={index + 8} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.details?.job?.benefits && job.details.job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.details.job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-3 text-orange-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 break-words leading-relaxed">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Process */}
            {job.details?.job?.applicationProcess && (
              <Card>
                <CardHeader>
                  <CardTitle>How to Apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed">
                    <div className="max-h-32 overflow-hidden relative group">
                      <p className="whitespace-pre-line break-words">
                        {job.details.job.applicationProcess}
                      </p>
                      {job.details.job.applicationProcess.length > 200 && (
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent group-hover:opacity-0 transition-opacity"></div>
                      )}
                    </div>
                    {job.details.job.applicationProcess.length > 200 && (
                      <button 
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 focus:outline-none"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          const container = target.closest('.text-gray-700')?.querySelector('.max-h-32');
                          if (container) {
                            container.classList.toggle('max-h-32');
                            container.classList.toggle('max-h-none');
                            target.textContent = container.classList.contains('max-h-32') ? 'Show more' : 'Show less';
                          }
                        }}
                      >
                        Show more
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Apply for this job</h3>
                
                <div className="space-y-3 mb-6">
                  {job.details?.job?.applicationDeadline && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">Deadline: {formatDate(job.details.job.applicationDeadline)}</span>
                    </div>
                  )}
                  
                  {job.details?.job?.experienceLevel && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{job.details.job.experienceLevel} level</span>
                    </div>
                  )}
                  
                  {job.details?.job?.workLocation && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{job.details.job.workLocation}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleContactEmployer}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Employer
                  </Button>
                  
                  {job.details?.job?.contactEmail && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${job.details.job.contactEmail}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email Directly
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.details?.job && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.details.job.company && (
                    <div>
                      <div className="font-medium text-gray-900 break-words leading-tight">
                        {job.details.job.company}
                      </div>
                    </div>
                  )}
                  
                  {job.details.job.companySize && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{job.details.job.companySize}</span>
                    </div>
                  )}
                  
                  {job.details.job.department && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{job.details.job.department} Department</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessagingModal && job && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          recipientId={job.author?._id}
          recipientName={job.author?.name || 'Job Poster'}
          rideTitle={job.title}
          rideId={job._id}
        />
      )}
    </div>
  );
}
