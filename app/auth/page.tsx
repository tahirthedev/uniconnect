'use client';

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleGoogleAuth = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await apiClient.login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);
          // Store user info if available
          if (response.user) {
            localStorage.setItem('userInfo', JSON.stringify(response.user));
          }
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
          window.location.href = '/';
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } else {
        const response = await apiClient.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);
          // Store user info if available
          if (response.user) {
            localStorage.setItem('userInfo', JSON.stringify(response.user));
          }
          toast({
            title: "Account created!",
            description: "Welcome to SayDone! Your account has been successfully created.",
          });
          window.location.href = '/';
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // The API client stores the server error message in error.message
      let errorMessage = error.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`;
      
      // Provide user-friendly messages for common errors
      if (errorMessage.includes('User already exists')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead or use a different email.';
        toast({
          title: "Account already exists",
          description: errorMessage,
          variant: "destructive",
        });
        // Automatically switch to login mode for better UX
        if (!isLogin) {
          setTimeout(() => {
            if (confirm('Would you like to switch to login mode?')) {
              setIsLogin(true);
            }
          }, 2000);
        }
      } else if (errorMessage.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.includes('Validation errors')) {
        errorMessage = 'Please check your information and ensure all fields are filled correctly.';
        toast({
          title: "Validation error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: isLogin ? "Login failed" : "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="UniConnect Logo" 
            width={80} 
            height={80} 
            className="rounded-xl"
          />
        </div>

        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Join UniConnect'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {/* Google Login - Primary */}
          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name field for registration */}
            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
