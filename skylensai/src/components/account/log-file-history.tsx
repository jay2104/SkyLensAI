/**
 * Log File History Component
 * Displays user's uploaded log files with basic information
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, HardDrive, Activity } from 'lucide-react';

interface LogFileRecord {
  id: string;
  fileName: string;
  fileType: 'BIN' | 'LOG' | 'TLOG' | 'ULG';
  uploadStatus: 'PENDING' | 'UPLOADED' | 'PROCESSED' | 'ERROR';
  fileSize: number;
  createdAt: string;
  flightDuration?: number;
  maxAltitude?: number;
  analysisResult?: {
    id: string;
    status: 'PENDING' | 'COMPLETE' | 'ERROR';
    healthScore?: number;
  };
}

export default function LogFileHistory() {
  const [logFiles, setLogFiles] = useState<LogFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogFiles = async () => {
      try {
        const response = await fetch('/api/user/log-files');
        if (!response.ok) {
          throw new Error('Failed to fetch log files');
        }
        const data = await response.json();
        setLogFiles(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load log files');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogFiles();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAltitude = (meters?: number) => {
    if (!meters) return 'N/A';
    return `${Math.round(meters)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'BIN':
        return 'bg-blue-100 text-blue-800';
      case 'LOG':
        return 'bg-green-100 text-green-800';
      case 'TLOG':
        return 'bg-purple-100 text-purple-800';
      case 'ULG':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log File History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log File History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Log File History
        </CardTitle>
        <CardDescription>
          Your uploaded flight logs and analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logFiles.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No log files uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload your first flight log to get started with analysis
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/dashboard'}>
              Upload Log File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {logFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{file.fileName}</h4>
                      <Badge className={getFileTypeColor(file.fileType)}>
                        {file.fileType}
                      </Badge>
                      <Badge className={getStatusColor(file.uploadStatus)}>
                        {file.uploadStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(file.fileSize)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                      
                      {file.flightDuration && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {formatDuration(file.flightDuration)}
                        </div>
                      )}
                      
                      {file.maxAltitude && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">📈</span>
                          {formatAltitude(file.maxAltitude)}
                        </div>
                      )}
                    </div>

                    {file.analysisResult && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Analysis:</span>
                        <Badge className={getStatusColor(file.analysisResult.status)}>
                          {file.analysisResult.status}
                        </Badge>
                        {file.analysisResult.healthScore && (
                          <span className="text-xs text-gray-600">
                            Health Score: {file.analysisResult.healthScore}/100
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/${file.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}