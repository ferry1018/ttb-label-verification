export const SAMPLE_LABELS = [
  {
    id: 'weller',
    name: 'Weller Bourbon',
    image: '/sample-weller.jpg',
    data: {
      brandName: 'Weller',
      classType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45% Alc./Vol. (90 Proof)',
      netContents: '750 ML',
      governmentWarning: 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
    },
  },
  {
    id: 'abc',
    name: 'ABC Distillery',
    image: '/sample-abc.jpg',
    data: {
      brandName: 'ABC DISTILLERY',
      classType: 'Whisky',
      alcoholContent: '50% ALC/VOL',
      netContents: '750 ML',
      governmentWarning: 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
    },
  },
  {
    id: 'el-tesoro',
    name: 'El Tesoro',
    image: '/sample-el-tesoro.jpg',
    data: {
      brandName: 'EL TESORO',
      classType: 'TEQUILA BLANCO',
      alcoholContent: '40% ALC./VOL.',
      netContents: '750ml',
      governmentWarning: 'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.',
    },
  },
];

// Helper function to load all samples for batch mode
export const loadAllSamplesForBatch = async () => {
  const sampleFiles: File[] = [];
  const sampleData: any[] = [];

  for (const sample of SAMPLE_LABELS) {
    try {
      const response = await fetch(sample.image);
      const blob = await response.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
      sampleFiles.push(file);
      sampleData.push(sample.data);
    } catch (error) {
      console.error(`Failed to load sample: ${sample.name}`, error);
    }
  }

  return { files: sampleFiles, data: sampleData };
};