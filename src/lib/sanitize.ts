import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe formatting tags
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'span', 'div', 'a'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
    KEEP_CONTENT: true,
    // Ensure links open safely
    ADD_ATTR: ['target', 'rel'],
  });
};
