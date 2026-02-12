import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  multiple = false,
  disabled = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple,
    disabled,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative min-h-[240px] border-2 border-dashed rounded-xl p-10
        flex flex-col items-center justify-center
        transition-all duration-300 cursor-pointer
        ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-lg'
            : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className={`
        w-20 h-20 rounded-full mb-5 flex items-center justify-center transition-all duration-300
        ${isDragActive ? 'bg-indigo-100 scale-110' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}
      `}>
        <svg
          className={`w-10 h-10 transition-all duration-300 ${isDragActive ? 'text-indigo-600' : 'text-indigo-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      <div className="text-center">
        {isDragActive ? (
          <div className="space-y-2">
            <p className="text-xl font-semibold text-indigo-600 animate-pulse">
              Drop files here
            </p>
            <p className="text-sm text-indigo-500">
              Release to upload
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-semibold text-gray-700">
              {multiple ? 'Drop label images here' : 'Drop label image here'}
            </p>
            <p className="text-sm text-gray-500">
              or{' '}
              <span className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                click to browse
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-gray-600">JPG, PNG, WEBP</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-gray-600">Max 10MB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};