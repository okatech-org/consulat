'use client';

import { FileUpload } from '@/components/ui/FileUpload';
import { useState } from 'react';

export default function ExamplePage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      url: string;
      key: string;
      size: number;
    }>
  >([]);

  const handleUploadComplete = (file: { url: string; key: string; size: number }) => {
    setUploadedFiles((prev) => [...prev, file]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Vous pouvez ajouter ici une notification d'erreur avec votre système de notification préféré
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Upload Example</h1>

      <div className="max-w-xl">
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          accept="image/*,application/pdf"
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="grid gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.key}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center gap-4">
                  {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={file.url}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{file.key.split('/').pop()}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
