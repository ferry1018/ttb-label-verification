// Shared types between frontend and backend

export interface ExpectedValues {
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  governmentWarning: string;
}

export interface ExtractedValues {
  brandName: string;
  classType: string;
  alcoholContent: string;
  netContents: string;
  governmentWarning: string;
}

export interface FieldVerification {
  match: boolean;
  confidence: number;
  note?: string;
}

export interface VerificationResult {
  brandName: FieldVerification;
  classType: FieldVerification;
  alcoholContent: FieldVerification;
  netContents: FieldVerification;
  governmentWarning: FieldVerification;
}

export interface VerificationResponse {
  success: boolean;
  overallPass: boolean;
  processingTimeSeconds: number;
  extracted: ExtractedValues;
  verification: VerificationResult;
  mismatches: string[];
  error?: string;
}

export interface BatchVerificationRequest {
  images: string[]; // base64 encoded images
  expectedValues: ExpectedValues[]; // one per image
}

export interface BatchVerificationResponse {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  results: VerificationResponse[];
  processingTimeSeconds: number;
}

export interface VerificationRequest {
  image: string; // base64 encoded
  expected: ExpectedValues;
}
