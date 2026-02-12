import React from 'react';
import { VerificationResponse } from '../types';

interface VerificationResultsProps {
  result: VerificationResponse;
  imagePreview?: string;
}

export const VerificationResults: React.FC<VerificationResultsProps> = ({ result, imagePreview }) => {
  const { overallPass, processingTimeSeconds, extracted, verification, mismatches } = result;

  const fields = [
    { key: 'brandName', label: 'Brand Name', icon: '🏷️' },
    { key: 'classType', label: 'Class/Type', icon: '📋' },
    { key: 'alcoholContent', label: 'Alcohol Content', icon: '🍷' },
    { key: 'netContents', label: 'Net Contents', icon: '📏' },
    { key: 'governmentWarning', label: 'Government Warning', icon: '⚠️' },
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className={`p-6 ${overallPass ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Verification Results</h2>
              {overallPass ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-white">PASS</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-white">FAIL</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Processing time: {processingTimeSeconds}s</span>
            </div>
          </div>

          {imagePreview && (
            <div className="ml-4">
              <img
                src={imagePreview}
                alt="Label preview"
                className="w-24 h-24 object-contain bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mismatches Summary */}
      {!overallPass && mismatches.length > 0 && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-800 mb-2">Issues Found:</h3>
              <ul className="space-y-1.5">
                {mismatches.map((mismatch, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{mismatch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Field-by-Field Results */}
      <div className="p-6 space-y-3">
        {fields.map(({ key, label, icon }) => {
          const fieldVerification = verification[key];
          const extractedValue = extracted[key];

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                fieldVerification.match
                  ? 'border-green-200 bg-green-50 hover:shadow-md'
                  : 'border-red-200 bg-red-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <h4 className="font-bold text-gray-900">{label}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      {fieldVerification.confidence}%
                    </span>
                  </div>
                  {fieldVerification.match ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-1 flex-shrink-0">
                    Extracted:
                  </span>
                  <span className={`text-sm flex-1 ${
                    key === 'governmentWarning' ? 'font-mono text-xs' : 'font-medium'
                  } ${
                    extractedValue === 'NOT FOUND' ? 'text-red-600 font-bold' : 'text-gray-900'
                  }`}>
                    {extractedValue}
                  </span>
                </div>

                {fieldVerification.note && (
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600 italic">{fieldVerification.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};