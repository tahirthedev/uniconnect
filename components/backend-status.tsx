'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

interface ApiDocumentation {
  endpoints: {
    auth: Record<string, string>;
    posts: Record<string, string>;
    messages: Record<string, string>;
    reports: Record<string, string>;
    admin: Record<string, string>;
  };
  authentication: {
    type: string;
    header: string;
  };
  userRoles: string[];
  postCategories: string[];
}

interface ApiInfoResponse {
  success: boolean;
  message: string;
  documentation: ApiDocumentation;
}

interface BackendInfo {
  healthCheck: HealthCheckResponse;
  apiInfo: ApiInfoResponse;
}

export default function BackendStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);

  const testConnection = async () => {
    setStatus('loading');
    try {
      const healthCheck = await apiClient.healthCheck();
      const apiInfo = await apiClient.getApiInfo();
      
      if (healthCheck && apiInfo) {
        setBackendInfo({ healthCheck, apiInfo });
        setStatus('connected');
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendInfo(null);
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Backend Status
          <Badge 
            variant={status === 'connected' ? 'default' : status === 'disconnected' ? 'destructive' : 'secondary'}
          >
            {status === 'loading' ? 'Testing...' : status === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={status === 'loading'} className="w-full">
          Test Connection
        </Button>
        
        {backendInfo && status === 'connected' && (
          <div className="space-y-2 text-sm">
            <div>
              <strong>Backend:</strong> {backendInfo.healthCheck.message}
            </div>
            <div>
              <strong>Version:</strong> {backendInfo.apiInfo.message}
            </div>
            <div>
              <strong>Environment:</strong> {backendInfo.healthCheck.environment}
            </div>
            <div>
              <strong>API Endpoints:</strong> {
                backendInfo.apiInfo.documentation?.endpoints ? 
                Object.values(backendInfo.apiInfo.documentation.endpoints).reduce((total, category) => 
                  total + Object.keys(category).length, 0
                ) : 0
              }
            </div>
            <div>
              <strong>Features:</strong> {
                backendInfo.apiInfo.documentation?.postCategories ? 
                backendInfo.apiInfo.documentation.postCategories.length : 0
              }
            </div>
          </div>
        )}
        
        {status === 'disconnected' && (
          <div className="text-sm text-red-600">
            Unable to connect to backend server. Please ensure the backend is running on port 5000.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
