import React, { useState, useEffect } from 'react';
import { ExpectedValues } from '../types';

interface ExpectedValueFormProps {
  values: ExpectedValues;
  onChange: (values: ExpectedValues) => void;
  disabled?: boolean;
}

const STANDARD_WARNING = 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

export const ExpectedValueForm: React.FC<ExpectedValueFormProps> = ({
  values,
  onChange,
  disabled = false,
}) => {
  const [useStandardWarning, setUseStandardWarning] = useState(true);

  // Auto-fill standard warning when checkbox is checked
  useEffect(() => {
    if (useStandardWarning && values.governmentWarning !== STANDARD_WARNING) {
      onChange({ ...values, governmentWarning: STANDARD_WARNING });
    }
  }, [useStandardWarning]);

  const handleChange = (field: keyof ExpectedValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const handleWarningToggle = (checked: boolean) => {
    setUseStandardWarning(checked);
    if (checked) {
      onChange({ ...values, governmentWarning: STANDARD_WARNING });
    } else {
      onChange({ ...values, governmentWarning: '' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand Name */}
      <div>
        <label
          htmlFor="brandName"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="brandName"
          value={values.brandName}
          onChange={(e) => handleChange('brandName', e.target.value)}
          disabled={disabled}
          placeholder="e.g., OLD TOM DISTILLERY"
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        <p className="mt-1 text-xs text-gray-500">
          The brand name as it appears on the application
        </p>
      </div>

      {/* Class/Type */}
      <div>
        <label
          htmlFor="classType"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Class/Type <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="classType"
          value={values.classType}
          onChange={(e) => handleChange('classType', e.target.value)}
          disabled={disabled}
          placeholder="e.g., Kentucky Straight Bourbon Whiskey"
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        <p className="mt-1 text-xs text-gray-500">
          The product class or type designation
        </p>
      </div>

      {/* Alcohol Content and Net Contents - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alcohol Content */}
        <div>
          <label
            htmlFor="alcoholContent"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Alcohol Content (ABV) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="alcoholContent"
            value={values.alcoholContent}
            onChange={(e) => handleChange('alcoholContent', e.target.value)}
            disabled={disabled}
            placeholder="e.g., 45%"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">Alcohol by volume percentage</p>
        </div>

        {/* Net Contents */}
        <div>
          <label
            htmlFor="netContents"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Net Contents (mL) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="netContents"
            value={values.netContents}
            onChange={(e) => handleChange('netContents', e.target.value)}
            disabled={disabled}
            placeholder="e.g., 750 mL"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">Volume in milliliters</p>
        </div>
      </div>

      {/* Government Warning - Hybrid Approach */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Government Warning <span className="text-red-500">*</span>
        </label>

        {/* Checkbox Option */}
        <div className="mb-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={useStandardWarning}
              onChange={(e) => handleWarningToggle(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Use standard government warning text
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Required for all alcohol beverages sold in the U.S.
              </p>
            </div>
          </label>
        </div>

        {/* Custom Warning Textarea - Only shown when unchecked */}
        {!useStandardWarning && (
          <div className="animate-fade-in">
            <label htmlFor="governmentWarning" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Warning Text
            </label>
            <textarea
              id="governmentWarning"
              value={values.governmentWarning}
              onChange={(e) => handleChange('governmentWarning', e.target.value)}
              disabled={disabled}
              rows={5}
              placeholder="Enter custom government warning text..."
              className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm transition-all resize-none"
            />
            <p className="mt-1 text-xs text-amber-600 flex items-start gap-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Warning text must match exactly including capitalization and punctuation
            </p>
          </div>
        )}

        {/* Show preview of standard warning when checked */}
        {useStandardWarning && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              {STANDARD_WARNING}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};