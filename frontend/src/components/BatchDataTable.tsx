import React from 'react';

export interface BatchRowData {
  file: File;
  preview: string;
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  useStandardWarning: boolean;
  customWarning: string;
}

interface BatchDataTableProps {
  data: BatchRowData[];
  onChange: (index: number, field: keyof BatchRowData, value: string | boolean) => void;
  onApplyStandardToAll: () => void;
  onClearAllWarnings: () => void;
  disabled?: boolean;
}

const STANDARD_WARNING = 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

export const BatchDataTable: React.FC<BatchDataTableProps> = ({
  data,
  onChange,
  onApplyStandardToAll,
  onClearAllWarnings,
  disabled = false,
}) => {
  const handleWarningToggle = (index: number, checked: boolean) => {
    onChange(index, 'useStandardWarning', checked);
    if (checked) {
      onChange(index, 'customWarning', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Brand Name <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Class/Type <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ABV <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Volume <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Warning <span className="text-red-500">*</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {/* Image Preview */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <img
                      src={row.preview}
                      alt={row.file.name}
                      className="w-16 h-16 object-contain border border-gray-200 rounded"
                    />
                    <p className="text-xs text-gray-500 max-w-[100px] truncate">
                      {row.file.name}
                    </p>
                  </div>
                </td>

                {/* Brand Name */}
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={row.brandName}
                    onChange={(e) => onChange(index, 'brandName', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Weller"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                  />
                </td>

                {/* Class/Type */}
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={row.classType}
                    onChange={(e) => onChange(index, 'classType', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Bourbon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                  />
                </td>

                {/* ABV */}
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={row.alcoholContent}
                    onChange={(e) => onChange(index, 'alcoholContent', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., 45%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                  />
                </td>

                {/* Volume */}
                <td className="px-4 py-4">
                  <input
                    type="text"
                    value={row.netContents}
                    onChange={(e) => onChange(index, 'netContents', e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., 750 mL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
                  />
                </td>

                {/* Warning */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {/* Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={row.useStandardWarning}
                        onChange={(e) => handleWarningToggle(index, e.target.checked)}
                        disabled={disabled}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Standard</span>
                    </label>

                    {/* Custom Warning Textarea */}
                    {!row.useStandardWarning && (
                      <textarea
                        value={row.customWarning}
                        onChange={(e) => onChange(index, 'customWarning', e.target.value)}
                        disabled={disabled}
                        rows={3}
                        placeholder="Enter custom warning..."
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 text-xs font-mono"
                      />
                    )}

                    {/* Show preview when standard is checked */}
                    {row.useStandardWarning && (
                      <p className="text-xs text-gray-500 italic">Using standard warning</p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions Below Table */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bulk Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onApplyStandardToAll}
            disabled={disabled}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Apply Standard Warning to All
          </button>
          <button
            onClick={onClearAllWarnings}
            disabled={disabled}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Clear All Warnings
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600">
          Use bulk actions to quickly set warnings for all labels, then customize individual rows as needed.
        </p>
      </div>
    </div>
  );
};