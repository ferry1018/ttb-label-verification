import { ratio, partial_ratio } from 'fuzzball';
import {
  ExpectedValues,
  ExtractedValues,
  VerificationResult,
  FieldVerification,
} from '../types';

export class VerificationService {
  /**
   * Compare extracted values against expected values
   */
  verify(extracted: ExtractedValues, expected: ExpectedValues): VerificationResult {
    return {
      brandName: this.verifyBrandName(extracted.brandName, expected.brandName),
      classType: this.verifyClassType(extracted.classType, expected.classType),
      alcoholContent: this.verifyAlcoholContent(extracted.alcoholContent, expected.alcoholContent),
      netContents: this.verifyNetContents(extracted.netContents, expected.netContents),
      governmentWarning: this.verifyGovernmentWarning(
        extracted.governmentWarning,
        expected.governmentWarning
      ),
    };
  }

  /**
   * Verify brand name with fuzzy matching
   * Handles case differences like "STONE'S THROW" vs "Stone's Throw"
   */
  private verifyBrandName(extracted: string, expected: string): FieldVerification {
    if (extracted === 'NOT FOUND') {
      return {
        match: false,
        confidence: 0,
        note: 'Brand name not found on label',
      };
    }

    // Exact match (case-insensitive)
    if (extracted.toLowerCase() === expected.toLowerCase()) {
      return {
        match: true,
        confidence: 100,
        note: extracted !== expected ? 'Case difference acceptable' : undefined,
      };
    }

    // Fuzzy matching
    const similarity = ratio(extracted.toLowerCase(), expected.toLowerCase());
    const partialSimilarity = partial_ratio(extracted.toLowerCase(), expected.toLowerCase());

    if (similarity >= 90) {
      return {
        match: true,
        confidence: similarity,
        note: 'Minor differences detected but within acceptable range',
      };
    }

    if (partialSimilarity >= 95) {
      return {
        match: true,
        confidence: partialSimilarity,
        note: 'Partial match - one may be substring of other',
      };
    }

    return {
      match: false,
      confidence: similarity,
      note: `Expected "${expected}", found "${extracted}"`,
    };
  }

  /**
   * Verify class/type with fuzzy matching
   */
  private verifyClassType(extracted: string, expected: string): FieldVerification {
    if (extracted === 'NOT FOUND') {
      return {
        match: false,
        confidence: 0,
        note: 'Class/type not found on label',
      };
    }

    // Exact match (case-insensitive)
    if (extracted.toLowerCase() === expected.toLowerCase()) {
      return {
        match: true,
        confidence: 100,
      };
    }

    // Fuzzy matching with slightly lower threshold
    const similarity = ratio(extracted.toLowerCase(), expected.toLowerCase());

    if (similarity >= 85) {
      return {
        match: true,
        confidence: similarity,
        note: 'Minor differences in wording',
      };
    }

    return {
      match: false,
      confidence: similarity,
      note: `Expected "${expected}", found "${extracted}"`,
    };
  }

  /**
   * Verify alcohol content
   * Handles variations like "45%" vs "45% Alc./Vol." vs "90 Proof"
   */
  private verifyAlcoholContent(extracted: string, expected: string): FieldVerification {
    if (extracted === 'NOT FOUND') {
      return {
        match: false,
        confidence: 0,
        note: 'Alcohol content not found on label',
      };
    }

    // Exact match
    if (extracted === expected) {
      return {
        match: true,
        confidence: 100,
      };
    }

    // Extract numeric values
    const extractedNum = this.extractAlcoholPercentage(extracted);
    const expectedNum = this.extractAlcoholPercentage(expected);

    if (extractedNum !== null && expectedNum !== null) {
      // Allow 0.5% tolerance
      if (Math.abs(extractedNum - expectedNum) <= 0.5) {
        return {
          match: true,
          confidence: 98,
          note: 'ABV matches (formatting differences acceptable)',
        };
      }
    }

    // Fuzzy match on the full string
    const similarity = ratio(extracted.toLowerCase(), expected.toLowerCase());
    if (similarity >= 85) {
      return {
        match: true,
        confidence: similarity,
        note: 'Format differs but content similar',
      };
    }

    return {
      match: false,
      confidence: similarity,
      note: `Expected "${expected}", found "${extracted}"`,
    };
  }

  /**
   * Verify net contents
   * Handles "750 mL" vs "750mL" vs "750 ML"
   */
  private verifyNetContents(extracted: string, expected: string): FieldVerification {
    if (extracted === 'NOT FOUND') {
      return {
        match: false,
        confidence: 0,
        note: 'Net contents not found on label',
      };
    }

    // Normalize spacing and case
    const normalizedExtracted = extracted.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedExpected = expected.toLowerCase().replace(/\s+/g, ' ').trim();

    if (normalizedExtracted === normalizedExpected) {
      return {
        match: true,
        confidence: 100,
      };
    }

    // Extract numeric value and unit
    const extractedParsed = this.parseNetContents(extracted);
    const expectedParsed = this.parseNetContents(expected);

    if (extractedParsed && expectedParsed) {
      if (
        Math.abs(extractedParsed.value - expectedParsed.value) < 0.01 &&
        extractedParsed.unit === expectedParsed.unit
      ) {
        return {
          match: true,
          confidence: 99,
          note: 'Formatting difference acceptable',
        };
      }
    }

    const similarity = ratio(normalizedExtracted, normalizedExpected);
    if (similarity >= 90) {
      return {
        match: true,
        confidence: similarity,
      };
    }

    return {
      match: false,
      confidence: similarity,
      note: `Expected "${expected}", found "${extracted}"`,
    };
  }

  /**
   * Verify government warning - MUST BE EXACT
   * Case-sensitive, word-for-word match
   */
  private verifyGovernmentWarning(extracted: string, expected: string): FieldVerification {
    if (extracted === 'NOT FOUND') {
      return {
        match: false,
        confidence: 0,
        note: 'Government warning not found on label - REQUIRED',
      };
    }

    // Normalize whitespace but preserve case
    const normalizedExtracted = extracted.replace(/\s+/g, ' ').trim();
    const normalizedExpected = expected.replace(/\s+/g, ' ').trim();

    // Check exact match
    if (normalizedExtracted === normalizedExpected) {
      return {
        match: true,
        confidence: 100,
      };
    }

    // Check if "GOVERNMENT WARNING:" is properly capitalized
    if (extracted.includes('government warning:') && !extracted.includes('GOVERNMENT WARNING:')) {
      return {
        match: false,
        confidence: 0,
        note: 'Must be "GOVERNMENT WARNING:" in all caps',
      };
    }

    // Check for partial match to give helpful feedback
    const similarity = ratio(normalizedExtracted, normalizedExpected);

    if (similarity > 70) {
      return {
        match: false,
        confidence: similarity,
        note: 'Government warning text does not match exactly - must be word-for-word',
      };
    }

    return {
      match: false,
      confidence: similarity,
      note: 'Government warning is incorrect or missing required text',
    };
  }

  /**
   * Extract alcohol percentage from string
   */
  private extractAlcoholPercentage(str: string): number | null {
    // Match patterns like "45%", "45.5%", "45 %"
    const percentMatch = str.match(/(\d+\.?\d*)\s*%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }

    // Match "Alc./Vol." or "ABV" patterns
    const abvMatch = str.match(/(\d+\.?\d*)\s*(?:alc\.?\/vol\.?|abv)/i);
    if (abvMatch) {
      return parseFloat(abvMatch[1]);
    }

    // Match proof (divide by 2 to get ABV)
    const proofMatch = str.match(/(\d+\.?\d*)\s*proof/i);
    if (proofMatch) {
      return parseFloat(proofMatch[1]) / 2;
    }

    return null;
  }

  /**
   * Parse net contents into value and unit
   */
  private parseNetContents(str: string): { value: number; unit: string } | null {
    const match = str.match(/(\d+\.?\d*)\s*(ml|l|oz|fl\.?\s?oz|gal)/i);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2].toLowerCase().replace(/\s/g, ''),
      };
    }
    return null;
  }

  /**
   * Get list of mismatches from verification result
   */
  getMismatches(verification: VerificationResult): string[] {
    const mismatches: string[] = [];

    if (!verification.brandName.match) {
      mismatches.push(`Brand Name: ${verification.brandName.note || 'Mismatch'}`);
    }
    if (!verification.classType.match) {
      mismatches.push(`Class/Type: ${verification.classType.note || 'Mismatch'}`);
    }
    if (!verification.alcoholContent.match) {
      mismatches.push(`Alcohol Content: ${verification.alcoholContent.note || 'Mismatch'}`);
    }
    if (!verification.netContents.match) {
      mismatches.push(`Net Contents: ${verification.netContents.note || 'Mismatch'}`);
    }
    if (!verification.governmentWarning.match) {
      mismatches.push(`Government Warning: ${verification.governmentWarning.note || 'Mismatch'}`);
    }

    return mismatches;
  }

  /**
   * Check if overall verification passed
   */
  isOverallPass(verification: VerificationResult): boolean {
    return (
      verification.brandName.match &&
      verification.classType.match &&
      verification.alcoholContent.match &&
      verification.netContents.match &&
      verification.governmentWarning.match
    );
  }
}

export const verificationService = new VerificationService();
