import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface CSVRowData {
  filename: string;
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  useStandardWarning: boolean;
  customWarning?: string;
}

interface CSVUploadProps {
  onCSVParsed: (data: CSVRowData[]) => void;
  disabled?: boolean;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onCSVParsed, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CSVRowData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate headers
    const requiredHeaders = [
      'filename',
      'brand_name',
      'class_type',
      'alcohol_content',
      'net_contents',
      'use_standard_warning'
    ];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: CSVRowData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Map to CSVRowData
      const useStandard = row.use_standard_warning?.toLowerCase() === 'yes';
      
      data.push({
        filename: row.filename,
        brandName: row.brand_name,
        classType: row.class_type,
        alcoholContent: row.alcohol_content,
        netContents: row.net_contents,
        useStandardWarning: useStandard,
        customWarning: useStandard ? '' : (row.custom_warning_text || '')
      });
    }

    return data;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        onCSVParsed(data);
        toast.success(`CSV parsed successfully: ${data.length} rows loaded`);
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = (withFilenames: boolean = false) => {
    const headers = [
      'filename',
      'brand_name',
      'class_type',
      'alcohol_content',
      'net_contents',
      'use_standard_warning',
      'custom_warning_text'
    ];

    let csvContent = headers.join(',') + '\n';

    if (withFilenames) {
      // Add example rows
      csvContent += 'sample1.jpg,Weller,Kentucky Straight Bourbon Whiskey,45% Alc./Vol.,750 mL,yes,\n';
      csvContent += 'sample2.jpg,ABC DISTILLERY,Whisky,50% ALC/VOL,750 ML,yes,\n';
      csvContent += 'sample3.jpg,Custom Brand,Custom Type,40%,750 mL,no,Custom warning text here\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = withFilenames ? 'batch_template_example.csv' : 'batch_template_blank.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-4">
      {/* CSV Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">Upload CSV File</p>
            <p className="text-sm text-gray-600 mt-1">Click to select or drag & drop</p>
          </div>
        </div>
      </div>

      {/* Template Download Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => downloadTemplate(false)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Blank Template
        </button>
        <button
          onClick={() => downloadTemplate(true)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Template with Examples
        </button>
      </div>

      {/* CSV Format Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>filename:</strong> Must match uploaded image filename exactly</li>
          <li>• <strong>brand_name:</strong> Brand name as it appears on label</li>
          <li>• <strong>class_type:</strong> Product type (e.g., "Bourbon", "Wine")</li>
          <li>• <strong>alcohol_content:</strong> ABV percentage (e.g., "45%")</li>
          <li>• <strong>net_contents:</strong> Volume (e.g., "750 mL")</li>
          <li>• <strong>use_standard_warning:</strong> "yes" or "no"</li>
          <li>• <strong>custom_warning_text:</strong> Only if use_standard_warning is "no"</li>
        </ul>
      </div>
    </div>
  );
};