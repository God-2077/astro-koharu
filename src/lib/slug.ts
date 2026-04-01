/**
 * Slug Generation Utility
 *
 * Generates URL-friendly slugs from titles containing mixed languages.
 * Handles Chinese, Japanese, and other non-ASCII characters using transliteration.
 * Preserves path structure while converting non-ASCII parts to URL-friendly format.
 */

import { slugify } from 'transliteration';

/**
 * Generate a URL-friendly slug from a title or path.
 * Converts non-ASCII characters to Latin equivalents while preserving path structure.
 *
 * @example
 * generateSlug('test123')           // 'test123'
 * generateSlug('Hello World')       // 'hello-world'
 * generateSlug('你好')              // 'ni-hao'
 * generateSlug('文件夹/你好')       // 'wen-jian-jia/ni-hao'
 * generateSlug('React学习笔记')     // 'react-xue-xi-bi-ji'
 * generateSlug('teset1234刀急急急') // 'teset1234-dao-ji-ji-ji'
 */
export function generateSlug(title: string): string {
  if (!title) return '';

  // Split the title into path segments
  const segments = title.split('/');

  // Process each segment individually
  const processedSegments = segments.map((segment) => {
    if (!segment) return segment;

    // Add spaces between ASCII and non-ASCII characters to ensure proper separation
    const processedSegment = segment
      // Add space between ASCII word characters and non-ASCII characters
      .replace(/([a-zA-Z0-9])([^a-zA-Z0-9])/g, '$1 $2')
      .replace(/([^a-zA-Z0-9])([a-zA-Z0-9])/g, '$1 $2');

    // Use transliteration library to convert non-ASCII characters
    return slugify(processedSegment, {
      lowercase: true,
      separator: '-',
    });
  });

  // Join the segments back together
  return (
    processedSegments
      .join('/')
      // Ensure valid URL characters
      .replace(/[^a-z0-9-/]/g, '-')
      // Collapse multiple dashes
      .replace(/-+/g, '-')
      // Collapse multiple slashes
      .replace(/\/+/g, '/')
      // Remove leading/trailing dashes and slashes
      .replace(/^-|-$|^\/|\/$/g, '')
  );
}
