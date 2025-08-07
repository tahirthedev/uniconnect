'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock, 
  Check,
  FileText,
  Settings,
  Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface JobFormData {
  // Step 1: Job Type & Company
  jobType: string;
  company: string;
  companySize: string;
  workLocation: string;
  remote: boolean;
  
  // Step 2: Job Details
  title: string;
  department: string;
  experienceLevel: string;
  requirements: string[];
  skills: string[];
  
  // Step 3: Salary & Benefits
  salaryMin: string;
  salaryMax: string;
  salaryType: string;
  currency: string;
  benefits: string[];
  
  // Step 4: Description & Application
  description: string;
  responsibilities: string;
  applicationProcess: string;
  applicationDeadline: string;
  contactEmail: string;
  
  // Step 5: Location (if not remote)
  address: string;
  city: string;
  state: string;
  country: string;
}

const initialFormData: JobFormData = {
  // Step 1
  jobType: '',
  company: '',
  companySize: '',
  workLocation: 'on-site',
  remote: false,
  
  // Step 2
  title: '',
  department: '',
  experienceLevel: '',
  requirements: [],
  skills: [],
  
  // Step 3
  salaryMin: '',
  salaryMax: '',
  salaryType: 'yearly',
  currency: 'GBP',
  benefits: [],
  
  // Step 4
  description: '',
  responsibilities: '',
  applicationProcess: '',
  applicationDeadline: '',
  contactEmail: '',
  
  // Step 5
  address: '',
  city: '',
  state: '',
  country: 'United Kingdom',
};

export default function JobPostingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const steps = [
    { number: 1, title: 'Job Type & Company', icon: Building2 },
    { number: 2, title: 'Job Details', icon: Briefcase },
    { number: 3, title: 'Salary & Benefits', icon: DollarSign },
    { number: 4, title: 'Description', icon: FileText },
    { number: 5, title: 'Review', icon: Eye }
  ];

  const jobTypes = [
    'full-time', 'part-time', 'contract', 'internship', 'freelance'
  ];

  const companySizes = [
    'startup (1-10 employees)',
    'small (11-50 employees)', 
    'medium (51-200 employees)',
    'large (201-1000 employees)',
    'enterprise (1000+ employees)'
  ];

  const experienceLevels = [
    'entry-level', 'junior', 'mid-level', 'senior', 'lead', 'executive'
  ];

  const commonBenefits = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance',
    'Pension/401k', 'Paid Time Off', 'Flexible Hours',
    'Remote Work', 'Professional Development', 'Gym Membership',
    'Free Lunch', 'Stock Options', 'Bonus Scheme'
  ];

  const updateFormData = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof JobFormData, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        updateFormData(field, [...currentArray, value.trim()]);
        setter('');
      }
    }
  };

  const removeFromArray = (field: keyof JobFormData, index: number) => {
    const currentArray = formData[field] as string[];
    updateFormData(field, currentArray.filter((_, i) => i !== index));
  };

  const toggleBenefit = (benefit: string) => {
    const currentBenefits = formData.benefits;
    if (currentBenefits.includes(benefit)) {
      updateFormData('benefits', currentBenefits.filter(b => b !== benefit));
    } else {
      updateFormData('benefits', [...currentBenefits, benefit]);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.jobType && formData.company && formData.companySize);
      case 2:
        return !!(formData.title && formData.title.length >= 5 && formData.experienceLevel);
      case 3:
        return !!(formData.salaryMin && formData.salaryMax);
      case 4:
        return !!(formData.description && formData.description.length >= 10 && formData.applicationProcess);
      case 5:
        return formData.remote || !!(formData.city && formData.city.length >= 2);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to match backend Post schema
      const jobData = {
        category: 'jobs',
        title: formData.title,
        description: formData.description,
        price: {
          amount: parseInt(formData.salaryMax) || 0,
          type: formData.salaryType,
          currency: formData.currency,
          range: {
            min: parseInt(formData.salaryMin) || 0,
            max: parseInt(formData.salaryMax) || 0
          }
        },
        location: formData.remote ? {
          type: 'remote',
          city: 'Remote',
          country: formData.country
        } : {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        details: {
          job: {
            type: formData.jobType,
            company: formData.company,
            companySize: formData.companySize,
            department: formData.department,
            experienceLevel: formData.experienceLevel,
            requirements: formData.requirements,
            skills: formData.skills,
            benefits: formData.benefits,
            remote: formData.remote,
            workLocation: formData.workLocation,
            responsibilities: formData.responsibilities,
            applicationProcess: formData.applicationProcess,
            applicationDeadline: formData.applicationDeadline,
            contactEmail: formData.contactEmail
          }
        }
      };

      const result = await apiClient.createPost(jobData);
      
      alert('🎉 Job posted successfully! Your listing is now live.');
      window.location.href = '/jobs?success=true';
      
    } catch (error) {
      console.error('Error posting job:', error);
      alert('❌ Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {jobTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateFormData('jobType', type)}
                    className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                      formData.jobType === type
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. Tech Solutions Ltd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => updateFormData('companySize', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select company size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Location
              </label>
              <div className="space-y-3">
                {['on-site', 'remote', 'hybrid'].map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="radio"
                      name="workLocation"
                      value={location}
                      checked={formData.workLocation === location}
                      onChange={(e) => {
                        updateFormData('workLocation', e.target.value);
                        updateFormData('remote', e.target.value === 'remote');
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. Frontend Developer"
                minLength={5}
                maxLength={200}
              />
              {formData.title && formData.title.length < 5 && (
                <p className="text-red-600 text-sm mt-1">Title must be at least 5 characters long</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => updateFormData('department', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. Engineering, Marketing, Sales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => updateFormData('experienceLevel', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select experience level</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level} className="capitalize">{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('requirements', newRequirement, setNewRequirement)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. 2+ years React experience"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <button
                      onClick={() => removeFromArray('requirements', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills & Technologies
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('skills', newSkill, setNewSkill)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. React, Node.js, TypeScript"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('skills', newSkill, setNewSkill)}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <button
                      onClick={() => removeFromArray('skills', index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary *
                </label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => updateFormData('salaryMin', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary *
                </label>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => updateFormData('salaryMax', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="45000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Type
                </label>
                <select
                  value={formData.salaryType}
                  onChange={(e) => updateFormData('salaryType', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateFormData('currency', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Benefits & Perks
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonBenefits.map(benefit => (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => toggleBenefit(benefit)}
                    className={`p-2 border rounded-lg text-sm ${
                      formData.benefits.includes(benefit)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {benefit}
                  </button>
                ))}
              </div>
              
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addToArray('benefits', newBenefit, setNewBenefit)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Add custom benefit"
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('benefits', newBenefit, setNewBenefit)}
                    variant="outline"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                minLength={10}
                maxLength={2000}
              />
              {formData.description && formData.description.length < 10 && (
                <p className="text-red-600 text-sm mt-1">Description must be at least 10 characters long</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Responsibilities
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => updateFormData('responsibilities', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="• Develop and maintain web applications
• Collaborate with design and product teams
• Write clean, maintainable code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How to Apply *
              </label>
              <textarea
                value={formData.applicationProcess}
                onChange={(e) => updateFormData('applicationProcess', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Please send your CV and cover letter to careers@company.com or apply through our website..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => updateFormData('applicationDeadline', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="hr@company.com"
                />
              </div>
            </div>

            {!formData.remote && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Office Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="123 Business Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Region
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="England"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{formData.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Company</span>
                  <p className="font-medium">{formData.company}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type</span>
                  <Badge className="mt-1 capitalize">{formData.jobType}</Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium">{formData.remote ? 'Remote' : `${formData.city}, ${formData.state}`}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Salary</span>
                  <p className="font-medium">
                    £{formData.salaryMin} - £{formData.salaryMax} {formData.salaryType}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
            </div>

            {formData.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge key={index} variant="outline">{req}</Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">{benefit}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Apply</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.applicationProcess}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                    Step {step.number}
                  </p>
                  <p className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep - 1] && (() => {
              const Icon = steps[currentStep - 1].icon;
              return <Icon className="h-5 w-5 text-orange-500" />;
            })()}
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
