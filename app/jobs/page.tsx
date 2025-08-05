'use client';

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MapPin, Clock, Briefcase, Building, Users, BookOpen, Search } from "lucide-react";
import Navigation from "@/components/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationFilter from "@/components/location-filter";
import { useLocationData, useLocation } from '@/contexts/LocationContext';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  logo: string;
  urgent?: boolean;
}

export default function JobsPage() {
  // Global location state
  const locationData = useLocationData();
  const { updateRadius } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Mock job data - in a real app this would come from API
  const mockJobs = [
    {
      id: 1,
      title: "Frontend React Developer",
      company: "TechStart UK",
      location: "London",
      type: "Full-time",
      salary: "£35,000 - £50,000",
      posted: "2 hours ago",
      description: "Looking for a passionate React developer to join our growing team in central London...",
      requirements: ["React", "TypeScript", "Node.js"],
      logo: "/placeholder.svg?height=50&width=50",
      urgent: true,
    },
    {
      id: 2,
      title: "Part-time Graphic Designer",
      company: "Creative Studio",
      location: "Manchester",
      type: "Part-time",
      salary: "£15 - £22/hour",
      posted: "4 hours ago",
      description: "Creative studio seeking talented designer for various projects in Manchester city centre...",
      requirements: ["Photoshop", "Illustrator", "Figma"],
      logo: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 3,
      title: "Campus Tour Guide",
      company: "University of Edinburgh",
      location: "Edinburgh",
      type: "Part-time",
      salary: "£11.50/hour",
      posted: "1 day ago",
      description: "Help prospective students discover our beautiful historic campus in Edinburgh...",
      requirements: ["Communication", "Campus Knowledge", "Enthusiasm"],
      logo: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 4,
      title: "Data Science Intern",
      company: "Analytics Pro",
      location: "Birmingham",
      type: "Internship",
      salary: "£12 - £16/hour",
      posted: "2 days ago",
      description: "Join our data science team as an intern and gain hands-on experience with real projects...",
      requirements: ["Python", "SQL", "Statistics"],
      logo: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 5,
      title: "Student Marketing Assistant",
      company: "University of Bristol",
      location: "Bristol",
      type: "Part-time",
      salary: "£10.50/hour",
      posted: "3 days ago",
      description: "Support our marketing team with social media and event promotion activities...",
      requirements: ["Social Media", "Communication", "Creativity"],
      logo: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 6,
      title: "Freelance Web Developer",
      company: "Various Clients",
      location: "Remote",
      type: "Freelance",
      salary: "£20 - £40/hour",
      posted: "1 week ago",
      description: "Flexible freelance opportunities for experienced web developers...",
      requirements: ["HTML/CSS", "JavaScript", "WordPress"],
      logo: "/placeholder.svg?height=50&width=50",
    }
  ];

  useEffect(() => {
    // Initialize with mock data - in real app would fetch from API
    setJobs(mockJobs);
    setLoading(false);
  }, []);

  const handleLocationFilterChange = useCallback((data: any) => {
    console.log('📍 Jobs location filter change requested:', {
      new: data,
      timestamp: new Date().toISOString()
    });
    
    // Only update radius if it has changed
    if (data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
    
    // In a real app, you would filter jobs based on location here
    // For now, we'll use the existing location text filter
    if (data?.location) {
      setLocationFilter(data.location);
    }
  }, [locationData.radius, updateRadius]);

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = !typeFilter || job.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
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
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Internship': 'bg-purple-100 text-purple-800',
      'Freelance': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="h-8 w-8 text-orange-500 mr-3" />
                Jobs & Internships
              </h1>
              <p className="text-gray-600">Find student-friendly job opportunities across the UK</p>
            </div>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            Post a Job
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getTypeColor(job.type)}>
                            {job.type}
                          </Badge>
                          {job.urgent && (
                            <Badge className="bg-red-100 text-red-800">
                              Urgent
                            </Badge>
                          )}
                          <span className="text-lg font-bold text-orange-600">
                            {job.salary}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.posted}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col gap-2">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                          Apply Now
                        </Button>
                        <Button variant="outline">
                          Save Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
