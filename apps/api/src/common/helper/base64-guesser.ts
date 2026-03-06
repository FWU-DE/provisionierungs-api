export type ImageMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp'
  | 'image/svg+xml'
  | 'application/octet-stream';

/**
 * Detects image MIME type from a Base64 string (no decoding)
 */
export function detectImageMimeType(base64: string): ImageMimeType {
  const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
  const prefix = cleaned.substring(0, 16);

  if (prefix.startsWith('iVBORw0KGgo')) return 'image/png';
  if (prefix.startsWith('/9j/')) return 'image/jpeg';
  if (prefix.startsWith('R0lGOD')) return 'image/gif';
  if (prefix.startsWith('UklGR')) return 'image/webp';
  if (prefix.startsWith('Qk')) return 'image/bmp';
  if (prefix.startsWith('PHN2Zy') || prefix.startsWith('PD94bWw')) return 'image/svg+xml';

  return 'application/octet-stream';
}

/**
 * Ensures a Base64 image string has a proper data URL prefix.
 * - Returns the string as-is if already prefixed with "data:"
 * - Otherwise, prepends a detected MIME type
 */
export function ensureDataUrl(base64: string): string {
  if (base64.startsWith('data:')) {
    // Already has a data URL prefix
    return base64;
  }

  const mime: ImageMimeType = detectImageMimeType(base64);
  return `data:${mime};base64,${base64}`;
}
