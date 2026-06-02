import type { IStorageService } from '../domain/interfaces/IStorageService';

export class StorageServiceImpl implements IStorageService {
  async uploadImage(base64DataUrl: string): Promise<string> {
    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // On Vercel, we call the relative path '/api/upload'
      // On localhost, we call the deployed Vercel function to bypass local DNS blocks.
      const uploadUrl = isLocalhost 
        ? 'https://photoboost-cyan.vercel.app/api/upload' 
        : '/api/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64DataUrl }),
      });

      if (!response.ok) {
        // Fallback for local development if the Vercel function is not deployed/accessible
        if (isLocalhost) {
          console.warn('Vercel serverless function not accessible on localhost, falling back to direct upload...');
          return this.uploadDirectToTmpFiles(base64DataUrl);
        }
        const errorText = await response.text();
        throw new Error(`Upload server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.url) {
        throw new Error(result.error || 'Invalid response structure from proxy');
      }

      return result.url;
    } catch (error: any) {
      console.error('Error uploading image to cloud storage:', error);
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
  }

  private async uploadDirectToTmpFiles(base64DataUrl: string): Promise<string> {
    const blob = this.dataURLtoBlob(base64DataUrl);
    const formData = new FormData();
    formData.append('file', blob, `photobooth-${Date.now()}.png`);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Direct upload error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (result.status !== 'success' || !result.data || !result.data.url) {
      throw new Error(result.message || 'Invalid response structure from direct upload');
    }

    const originalUrl = result.data.url;
    const directDownloadUrl = originalUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
    return directDownloadUrl;
  }

  private dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }
}
