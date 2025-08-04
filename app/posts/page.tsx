'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { apiClient } from "@/lib/api";

export default function PostsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Posts</h1>
            <p className="text-gray-600">All posts from the community</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <select className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option value="">All Categories</option>
                <option value="ridesharing">Ridesharing</option>
                <option value="jobs">Jobs</option>
                <option value="marketplace">Marketplace</option>
              </select>
              <input
                type="text"
                placeholder="Location..."
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-blue-100 text-blue-800">ridesharing</Badge>
                    <span className="text-lg font-bold text-orange-600">£8</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Central London to UCL Campus</h3>
                  <p className="text-gray-700 mb-3">Daily commute with space for 3 passengers</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <img
                        src="/placeholder-user.jpg"
                        alt="Emma Johnson"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      Emma Johnson
                    </div>
                    <span>•</span>
                    <span>London</span>
                    <span>•</span>
                    <span>Today</span>
                  </div>
                </div>
                
                <div className="ml-6">
                  <Link href="/ridesharing">
                    <Button variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
