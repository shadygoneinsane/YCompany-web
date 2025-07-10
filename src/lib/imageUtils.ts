/**
 * Utility functions for handling image URLs
 */

/**
 * Validates if a URL is likely to be a direct image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    
    // Check for known image hosting patterns
    const isKnownImageHost = 
      urlObj.hostname.includes('placehold.co') ||
      urlObj.hostname.includes('dummyimage.com') ||
      urlObj.hostname.includes('upload.wikimedia.org') ||
      urlObj.hostname.includes('imgur.com') ||
      urlObj.hostname.includes('unsplash.com') ||
      urlObj.hostname.includes('picsum.photos') ||
      urlObj.hostname.includes('pexels.com') ||
      urlObj.hostname.includes('amazonaws.com') ||
      urlObj.hostname.includes('cloudinary.com');
    
    return hasImageExtension || isKnownImageHost;
  } catch {
    return false;
  }
}

/**
 * Attempts to fix common image URL issues
 */
export function fixImageUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Fix Wikimedia URLs - convert page URLs to direct image URLs
    if (url.includes('commons.wikimedia.org/wiki/')) {
      // For URLs like: https://commons.wikimedia.org/wiki/Category:Electric_cables#/media/File:Electric_guide_3%C3%972.5_mm.jpg
      let filename = '';
      
      // Try to extract from #/media/File: pattern first
      const mediaMatch = url.match(/#\/media\/File:([^?&]+)/);
      if (mediaMatch) {
        filename = mediaMatch[1];
      } else {
        // Fallback to File: pattern
        const fileMatch = url.match(/File:([^#?&]+)/);
        if (fileMatch) {
          filename = fileMatch[1];
        }
      }
      
      if (filename) {
        // URL decode the filename
        filename = decodeURIComponent(filename);
        // Create MD5 hash for the directory structure (simplified approach)
        const firstChar = filename.charAt(0).toLowerCase();
        const secondChar = filename.length > 1 ? filename.charAt(1).toLowerCase() : 'a';
        
        // Convert to direct upload URL using simplified path
        return `https://upload.wikimedia.org/wikipedia/commons/${firstChar}/${firstChar}${secondChar}/${filename}`;
      }
    }
    
    return url;
  } catch {
    return url;
  }
}

/**
 * Gets a fallback placeholder image URL
 */
export function getPlaceholderImageUrl(): string {
  return "https://placehold.co/600x400.png";
}