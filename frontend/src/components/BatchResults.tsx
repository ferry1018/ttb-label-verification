import React, { useState } from 'react';
import { BatchVerificationResponse } from '../types';

interface BatchResultsProps {
  result: BatchVerificationResponse;
  imagePreviews: string[];
}

export const BatchResults: React.FC<BatchResultsProps> = ({ result, imagePreviews }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { summary, results, processingTimeSeconds } = result;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const passRate = Math.round((summary.passed / summary.total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Batch Verification Results</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-white/80 font-medium mb-1">Total Labels</p>
            <p className="text-3xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-white/80 font-medium mb-1">Passed</p>
            <p className="text-3xl font-bold text-white">{summary.passed}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-white/80 font-medium mb-1">Failed</p>
            <p className="text-3xl font-bold text-white">{summary.failed}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm text-white/80 font-medium mb-1">Time</p>
            <p className="text-3xl font-bold text-white">{processingTimeSeconds}s</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/90">Pass Rate</span>
            <span className="text-sm font-bold text-white">{passRate}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Individual Results */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Individual Results
        </h3>
        
        <div className="space-y-3">
          {results.map((labelResult, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                labelResult.overallPass 
                  ? 'border-green-200 hover:border-green-300 hover:shadow-md' 
                  : 'border-red-200 hover:border-red-300 hover:shadow-md'
              }`}
            >
              {/* Summary Row */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {imagePreviews[index] && (
                    <img
                      src={imagePreviews[index]}
                      alt={`Label ${index + 1}`}
                      className="w-14 h-14 object-contain bg-gray-100 border border-gray-200 rounded-lg"
                    />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">Label {index + 1}</p>
                      {labelResult.overallPass ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Failed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {labelResult.mismatches.length > 0 &&
                        `${labelResult.mismatches.length} issue${
                          labelResult.mismatches.length > 1 ? 's' : ''
                        }`}
                      {labelResult.mismatches.length === 0 && 'All checks passed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">
                    {labelResult.processingTimeSeconds}s
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedIndex === index && (
                <div className="px-5 pb-5 border-t border-gray-200 bg-gray-50 animate-fade-in">
                  {labelResult.mismatches.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-red-800 mb-2">Issues:</h4>
                          <ul className="space-y-1">
                            {labelResult.mismatches.map((mismatch, mIndex) => (
                              <li key={mIndex} className="text-sm text-red-700 flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span>{mismatch}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {Object.entries(labelResult.verification).map(([field, verification]) => (
                      <div
                        key={field}
                        className={`p-3 rounded-lg ${
                          verification.match ? 'bg-white border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">
                              {verification.confidence}%
                            </span>
                            {verification.match ? (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {verification.note && (
                          <p className="text-xs text-gray-600 mt-1">{verification.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};