import { customAlphabet } from "nanoid";

// Custom alphabet excluding confusing characters (0/O, 1/I/L)
const SAFE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Create a nanoid generator with our safe alphabet
const generateSegment = customAlphabet(SAFE_ALPHABET, 4);

/**
 * Generate a single film code in format: KODAYAK-XXXX-XXXX
 */
export function generateFilmCode(): string {
  return `KODAYAK-${generateSegment()}-${generateSegment()}`;
}

/**
 * Generate multiple unique film codes
 */
export function generateBulkCodes(quantity: number): string[] {
  const codes = new Set<string>();

  while (codes.size < quantity) {
    codes.add(generateFilmCode());
  }

  return Array.from(codes);
}

/**
 * Validate code format (for input validation)
 */
export function isValidCodeFormat(code: string): boolean {
  const pattern = /^KODAYAK-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;
  return pattern.test(code.toUpperCase());
}
