'use client';

import { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  Image as ImageIcon, 
  ExternalLink,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DescriptionStepProps {
  data: any;
  updateData: (updates: any) => void;
  validationErrors?: string[];
}

export default function DescriptionStep({ data, updateData, validationErrors = [] }: DescriptionStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDescriptionChange = (description: string) => {
    updateData({ description });
  };

  const handleVirtualTourChange = (virtualTourUrl: string) => {
    updateData({ virtualTourUrl });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (newFiles: File[]) => {
    const currentImages = data.images || [];
    const updatedImages = [...currentImages, ...newFiles];
    updateData({ images: updatedImages });
  };

  const removeImage = (index: number) => {
    const currentImages = data.images || [];
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index);
    updateData({ images: updatedImages });
  };

  const wordCount = (data.description || '').split(/\s+/).filter(Boolean).length;
  const charCount = (data.description || '').length;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Description & Photos
        </h2>
        <p className="text-gray-600">
          Tell potential tenants about your property and showcase it with photos
        </p>
      </div>

      {/* Property Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Property Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your property *
            </label>
            <textarea
              value={data.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe your property in detail. Include information about the location, nearby amenities, transportation links, what makes it special, house rules, and any other important details potential tenants should know..."
              className={`w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                validationErrors.includes('description') 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {validationErrors.includes('description') && (
              <p className="text-sm text-red-600 mt-1">Description must be at least 50 characters long</p>
            )}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{wordCount} words, {charCount} characters</span>
              <span className={charCount < 50 ? 'text-red-500' : 'text-green-600'}>
                {charCount < 50 ? 'Minimum 50 characters required' : 'Good length!'}
              </span>
            </div>
          </div>

          {/* Description Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Writing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mention nearby universities, transport links, and amenities</li>
              <li>• Describe the neighborhood and what makes it special</li>
              <li>• Include any house rules or important information</li>
              <li>• Be honest and detailed to attract the right tenants</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Property Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Property Photos
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WEBP (Max 10MB each)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          {(data.images || []).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Uploaded Photos ({(data.images || []).length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(data.images || []).map((file: File, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-orange-600">
                        Main Photo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Tips */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">📸 Photo Tips</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Take photos in good lighting (preferably natural light)</li>
              <li>• Include all rooms, common areas, and exterior views</li>
              <li>• The first photo will be used as the main listing image</li>
              <li>• Clean and declutter spaces before photographing</li>
              <li>• Show unique features and selling points</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Tour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Virtual Tour (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Tour URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={data.virtualTourUrl || ''}
                onChange={(e) => handleVirtualTourChange(e.target.value)}
                placeholder="https://example.com/virtual-tour"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {data.virtualTourUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(data.virtualTourUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add a link to a virtual tour, 360° photos, or video walkthrough
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">📋 Content Summary</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Description:</span>
            <span className={charCount >= 50 ? 'text-green-600' : 'text-red-500'}>
              {charCount >= 50 ? '✅ Complete' : '❌ Too short'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Photos:</span>
            <span className={(data.images || []).length > 0 ? 'text-green-600' : 'text-orange-600'}>
              {(data.images || []).length > 0 ? `✅ ${(data.images || []).length} uploaded` : '⚠️ No photos yet'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Virtual Tour:</span>
            <span className={data.virtualTourUrl ? 'text-green-600' : 'text-gray-500'}>
              {data.virtualTourUrl ? '✅ Added' : '➖ Optional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
