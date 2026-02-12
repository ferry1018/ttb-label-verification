import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { UploadZone } from './components/UploadZone';
import { ExpectedValueForm } from './components/ExpectedValueForm';
import { VerificationResults } from './components/VerificationResults';
import { BatchResults } from './components/BatchResults';
import { BatchDataTable, BatchRowData } from './components/BatchDataTable';
import { CSVUpload, CSVRowData } from './components/CSVUpload';
import { apiService, fileToBase64 } from './services/api';
import { SAMPLE_LABELS, loadAllSamplesForBatch } from './data/samples';
import { ExpectedValues, VerificationResponse, BatchVerificationResponse } from './types';

type Mode = 'single' | 'batch';

function App() {
  const [mode, setMode] = useState<Mode>('single');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [batchResult, setBatchResult] = useState<BatchVerificationResponse | null>(null);

  // Batch-specific state
  const [batchData, setBatchData] = useState<BatchRowData[]>([]);
  const [showBatchTable, setShowBatchTable] = useState(false);

  const [expectedValues, setExpectedValues] = useState<ExpectedValues>({
    brandName: '',
    classType: '',
    alcoholContent: '',
    netContents: '',
    governmentWarning: '',
  });

  const handleSingleFileSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMultipleFilesSelect = (files: File[]) => {
    if (files.length > 50) {
      toast.error('Maximum 50 files allowed');
      return;
    }

    setSelectedFiles(files);
    setBatchResult(null);

    const newBatchData: BatchRowData[] = [];
    const previews: string[] = [];
    let loaded = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;

        previews.push(preview);
        newBatchData.push({
          file,
          preview,
          brandName: '',
          classType: '',
          alcoholContent: '',
          netContents: '',
          useStandardWarning: false,
          customWarning: '',
        });

        loaded++;
        if (loaded === files.length) {
          setImagePreviews(previews);
          setBatchData(newBatchData);
          setShowBatchTable(false); // Hide table until they choose CSV or manual
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCSVParsed = (csvData: CSVRowData[]) => {
    const updatedBatchData = batchData.map((row) => {
      const csvMatch = csvData.find((csv) => csv.filename === row.file.name);
      if (!csvMatch) return row;

      return {
        ...row,
        brandName: csvMatch.brandName,
        classType: csvMatch.classType,
        alcoholContent: csvMatch.alcoholContent,
        netContents: csvMatch.netContents,
        useStandardWarning: csvMatch.useStandardWarning,
        customWarning: csvMatch.customWarning || '',
      };
    });

    setBatchData(updatedBatchData);
    setShowBatchTable(true);
    toast.success('CSV data loaded into table');
  };

  const handleBatchDataChange = (
    index: number,
    field: keyof BatchRowData,
    value: string | boolean
  ) => {
    setBatchData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplyStandardToAll = () => {
    setBatchData((prev) =>
      prev.map((row) => ({
        ...row,
        useStandardWarning: true,
        customWarning: '',
      }))
    );
    toast.success('Applied standard warning to all labels');
  };

  const handleClearAllWarnings = () => {
    setBatchData((prev) =>
      prev.map((row) => ({
        ...row,
        useStandardWarning: false,
        customWarning: '',
      }))
    );
    toast.success('Cleared all warnings');
  };

  const handleSampleClick = async (sampleId: string) => {
    const sample = SAMPLE_LABELS.find((s) => s.id === sampleId);
    if (!sample) return;

    try {
      const response = await fetch(sample.image);
      const blob = await response.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });

      setSelectedFile(file);
      setImagePreview(sample.image);
      setExpectedValues(sample.data);
      setResult(null);

      toast.success(`Loaded sample: ${sample.name}`);
    } catch (error) {
      console.error('Error loading sample:', error);
      toast.error('Failed to load sample image');
    }
  };

  const handleBatchSampleLoad = async () => {
    try {
      toast.loading('Loading sample labels...');

      const { files, data } = await loadAllSamplesForBatch();

      if (files.length === 0) {
        toast.error('Failed to load sample images');
        return;
      }

      setSelectedFiles(files);
      setBatchResult(null);

      const previews: string[] = [];
      const newBatchData: BatchRowData[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sampleData = data[i];

        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        previews.push(preview);
        newBatchData.push({
          file,
          preview,
          brandName: sampleData.brandName,
          classType: sampleData.classType,
          alcoholContent: sampleData.alcoholContent,
          netContents: sampleData.netContents,
          useStandardWarning: true,
          customWarning: '',
        });
      }

      setImagePreviews(previews);
      setBatchData(newBatchData);
      setShowBatchTable(true);

      toast.dismiss();
      toast.success(`Loaded ${files.length} sample labels with data`);
    } catch (error) {
      toast.dismiss();
      console.error('Error loading batch samples:', error);
      toast.error('Failed to load sample labels');
    }
  };

  const validateForm = (): boolean => {
    if (!expectedValues.brandName.trim()) return toast.error('Brand name is required'), false;
    if (!expectedValues.classType.trim()) return toast.error('Class/Type is required'), false;
    if (!expectedValues.alcoholContent.trim()) return toast.error('Alcohol content is required'), false;
    if (!expectedValues.netContents.trim()) return toast.error('Net contents is required'), false;
    if (!expectedValues.governmentWarning.trim()) return toast.error('Government warning is required'), false;
    return true;
  };

  const handleSingleVerification = async () => {
    if (!selectedFile) {
      toast.error('Please select a label image');
      return;
    }
    if (!validateForm()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const base64Image = await fileToBase64(selectedFile);

      const response = await apiService.verifyLabel({
        image: base64Image,
        expected: expectedValues,
      });

      setResult(response);

      if (response.overallPass) toast.success('Label verification passed!');
      else toast.error('Label verification failed');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify label');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchVerification = async () => {
    if (batchData.length === 0) {
      toast.error('Please select label images');
      return;
    }

    const invalidRows: number[] = [];
    batchData.forEach((row, index) => {
      if (!row.brandName || !row.classType || !row.alcoholContent || !row.netContents) {
        invalidRows.push(index + 1);
      }
      if (!row.useStandardWarning && !row.customWarning) {
        invalidRows.push(index + 1);
      }
    });

    if (invalidRows.length > 0) {
      toast.error(`Missing required data in rows: ${[...new Set(invalidRows)].join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setBatchResult(null);

    try {
      const base64Images = await Promise.all(batchData.map((row) => fileToBase64(row.file)));

      const STANDARD_WARNING =
        'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.';

      const expectedValuesArray = batchData.map((row) => ({
        brandName: row.brandName,
        classType: row.classType,
        alcoholContent: row.alcoholContent,
        netContents: row.netContents,
        governmentWarning: row.useStandardWarning ? STANDARD_WARNING : row.customWarning,
      }));

      const response = await apiService.verifyBatch({
        images: base64Images,
        expectedValues: expectedValuesArray,
      });

      setBatchResult(response);
      toast.success(`Batch verification complete: ${response.summary.passed}/${response.summary.total} passed`);
    } catch (error) {
      console.error('Batch verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify batch');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFiles([]);
    setImagePreview('');
    setImagePreviews([]);
    setResult(null);
    setBatchResult(null);
    setBatchData([]);
    setShowBatchTable(false);
    setExpectedValues({
      brandName: '',
      classType: '',
      alcoholContent: '',
      netContents: '',
      governmentWarning: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <button onClick={resetForm} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M28 4L16 24H24L20 44L36 20H28L32 4H28Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M18 22L22 26L30 16" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  QuickCheck
                </h1>
                <p className="text-sm text-gray-600">AI Label Verification</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Powered by GPT-4 Vision
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Fast, Accurate Label Verification</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Verify alcohol beverage labels against TTB compliance requirements in seconds
            </p>
          </div>

          {/* Quick Demo - Single */}
          {mode === 'single' && !selectedFile && (
            <div className="mb-12 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Try a Sample Label</h3>
                  <p className="text-gray-600">Click any sample below to load it with pre-filled data</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAMPLE_LABELS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleClick(sample.id)}
                      className="group relative bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <img src={sample.image} alt={sample.name} className="w-full h-48 object-contain rounded-lg" />
                        <div className="text-center w-full">
                          <p className="font-semibold text-gray-900 mb-1">{sample.name}</p>
                          <p className="text-sm text-gray-500">Click to load sample data</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">Or upload your own label below</p>
                </div>
              </div>
            </div>
          )}

          {/* Batch Sample Demo */}
          {mode === 'batch' && selectedFiles.length === 0 && (
            <div className="mb-12 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Try Batch Processing</h3>
                  <p className="text-gray-600">Load all 3 sample labels with pre-filled data</p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleBatchSampleLoad}
                    className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-8 py-4 hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-semibold">Load All 3 Sample Labels</span>
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SAMPLE_LABELS.map((sample) => (
                    <div key={sample.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={sample.image} alt={sample.name} className="w-12 h-12 object-contain rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sample.name}</p>
                        <p className="text-xs text-gray-500">With pre-filled data</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">Or upload your own labels below</p>
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => {
                  setMode('single');
                  resetForm();
                }}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  mode === 'single'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single Label
              </button>
              <button
                onClick={() => {
                  setMode('batch');
                  resetForm();
                }}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                  mode === 'batch'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Batch Processing
              </button>
            </div>
          </div>

          {/* Single Mode */}
          {mode === 'single' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transform transition-all hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Upload Label</h3>
                  </div>

                  <UploadZone onFilesSelected={handleSingleFileSelect} multiple={false} disabled={isProcessing} />

                  {selectedFile && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-14 h-14 object-contain rounded-lg border-2 border-blue-200"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreview('');
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transform transition-all hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Enter Expected Values</h3>
                  </div>

                  <ExpectedValueForm values={expectedValues} onChange={setExpectedValues} disabled={isProcessing} />
                </div>

                <button
                  onClick={handleSingleVerification}
                  disabled={isProcessing || !selectedFile}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {isProcessing ? 'Processing Verification...' : 'Start Verification'}
                </button>
              </div>

              <div className="lg:sticky lg:top-32 lg:self-start">
                {result ? (
                  <div className="animate-fade-in">
                    <VerificationResults result={result} imagePreview={imagePreview} />
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Verify</h3>
                    <p className="text-gray-600">Upload a label and enter expected values to begin</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Batch Mode */}
          {mode === 'batch' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Upload Labels</h3>
                </div>

                <UploadZone onFilesSelected={handleMultipleFilesSelect} multiple={true} disabled={isProcessing} />

                {selectedFiles.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="font-semibold text-gray-900">{selectedFiles.length} files ready for processing</p>
                  </div>
                )}
              </div>

              {selectedFiles.length > 0 && !showBatchTable && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Provide Application Data</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-1">Option A: Upload CSV</h4>
                      <p className="text-sm text-gray-600 mb-4">Recommended for bulk processing</p>
                      <CSVUpload onCSVParsed={handleCSVParsed} disabled={isProcessing} />
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                      <h4 className="font-bold text-gray-900 mb-1">Option B: Manual Entry</h4>
                      <p className="text-sm text-gray-600 mb-4">Enter data directly in table</p>
                      <button
                        onClick={() => setShowBatchTable(true)}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Open Data Entry Table
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && showBatchTable && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Review & Edit Data</h3>
                    <p className="text-sm text-gray-600">{batchData.length} labels loaded</p>
                  </div>

                  <BatchDataTable
                    data={batchData}
                    onChange={handleBatchDataChange}
                    onApplyStandardToAll={handleApplyStandardToAll}
                    onClearAllWarnings={handleClearAllWarnings}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {selectedFiles.length > 0 && showBatchTable && (
                <button
                  onClick={handleBatchVerification}
                  disabled={isProcessing || batchData.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {isProcessing ? 'Processing Verification...' : `Verify ${batchData.length} Labels`}
                </button>
              )}

              {batchResult && (
                <div className="animate-fade-in">
                  <BatchResults result={batchResult} imagePreviews={imagePreviews} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">QuickCheck Prototype</p>
            <p className="text-sm text-gray-600">Built for TTB Compliance Review • U.S. Department of the Treasury</p>
            <p className="text-xs text-gray-500 mt-4">Powered by GPT-4 Vision • {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
