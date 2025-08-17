'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingBag, Upload, MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { usePosts } from '@/contexts/PostsContext';

interface SellItemForm {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: string;
  city: string;
  contactMethod: string;
  phoneNumber: string;
  images: File[];
}

export default function SellItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addPost, forceRefreshPosts } = usePosts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SellItemForm>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    condition: '',
    city: '',
    contactMethod: 'message',
    phoneNumber: '',
    images: []
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const categories = [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Fashion', label: 'Fashion & Clothing' },
    { value: 'Furniture', label: 'Furniture & Home' },
    { value: 'Books', label: 'Books & Education' },
    { value: 'Sports', label: 'Sports & Fitness' },
    { value: 'Beauty', label: 'Beauty & Health' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Other', label: 'Other' }
  ];

  const conditions = [
    { value: 'Like New', label: 'Like New' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }
  ];

  const contactMethods = [
    { value: 'message', label: 'Platform Message' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'both', label: 'Message & Phone' }
  ];

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('title');
    if (!formData.description.trim()) errors.push('description');
    if (!formData.price || formData.price <= 0) errors.push('price');
    if (!formData.category) errors.push('category');
    if (!formData.condition) errors.push('condition');
    if (!formData.city.trim()) errors.push('city');
    if (formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp' || formData.contactMethod === 'both') {
      if (!formData.phoneNumber.trim()) errors.push('phoneNumber');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleInputChange = (field: keyof SellItemForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error !== field));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Please complete required fields",
        description: "The highlighted fields need to be filled before posting your item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Sign in required",
          description: "Please sign in to sell items.",
          variant: "destructive",
        });
        router.push('/auth');
        return;
      }

      // Prepare post data
      const postData = {
        category: 'buy-sell',
        title: formData.title,
        description: formData.description,
        content: formData.description,
        price: {
          amount: formData.price,
          currency: 'GBP',
          type: 'fixed'
        },
        location: {
          city: formData.city,
          country: 'UK'
        },
        details: {
          marketplace: {
            category: formData.category,
            condition: formData.condition,
            originalPrice: formData.originalPrice || undefined,
            contactMethod: formData.contactMethod,
            phoneNumber: formData.phoneNumber || undefined
          }
        },
        metadata: {
          itemCategory: formData.category,
          condition: formData.condition,
          originalPrice: formData.originalPrice,
          contactMethod: formData.contactMethod,
          phoneNumber: formData.phoneNumber,
          images: formData.images
        }
      };

      // Submit to backend
      const result = await apiClient.createPost(postData);
      
      // Add the new post to the context immediately if returned
      if (result && result.post) {
        addPost(result.post);
      } else {
        // Force refresh all posts to ensure the new post is included
        await forceRefreshPosts();
      }
      
      // Redirect to marketplace with success parameter
      router.push('/marketplace?success=true');
      
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Failed to list item",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/marketplace" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-orange-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="h-8 w-8 text-orange-500 mr-3" />
                Sell Your Item
              </h1>
              <p className="text-gray-600">Create a listing to sell your item to fellow students</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.includes('title') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., iPhone 14 Pro Max 256GB Space Black"
                />
                {validationErrors.includes('title') && (
                  <p className="text-sm text-red-600 mt-1">Item title is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.includes('description') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Describe your item in detail, including condition, features, and any defects..."
                />
                {validationErrors.includes('description') && (
                  <p className="text-sm text-red-600 mt-1">Description is required</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('category') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {validationErrors.includes('category') && (
                    <p className="text-sm text-red-600 mt-1">Category is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('condition') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select condition</option>
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                  {validationErrors.includes('condition') && (
                    <p className="text-sm text-red-600 mt-1">Condition is required</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (£) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('price') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="50.00"
                  />
                  {validationErrors.includes('price') && (
                    <p className="text-sm text-red-600 mt-1">Price is required and must be greater than 0</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (£) <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Show how much you originally paid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.includes('city') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Manchester, Birmingham, Leeds"
                />
                {validationErrors.includes('city') && (
                  <p className="text-sm text-red-600 mt-1">City is required</p>
                )}
                <p className="text-xs text-gray-500 mt-1">This will be shown publicly to help buyers find your item</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Contact Method *
                </label>
                <select
                  value={formData.contactMethod}
                  onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {contactMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              {(formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp' || formData.contactMethod === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.includes('phoneNumber') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="+44 7XXX XXXXXX"
                  />
                  {validationErrors.includes('phoneNumber') && (
                    <p className="text-sm text-red-600 mt-1">Phone number is required for this contact method</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Images (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload up to 5 images. Good photos help sell faster!</p>
                
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/marketplace">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 px-8"
            >
              {loading ? 'Posting...' : 'Post Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
