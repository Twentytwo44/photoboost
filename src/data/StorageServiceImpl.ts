import type { IStorageService } from '../domain/interfaces/IStorageService';

export class StorageServiceImpl implements IStorageService {
  async uploadImage(base64DataUrl: string): Promise<string> {
    try {
      const blob = this.dataURLtoBlob(base64DataUrl);
      const formData = new FormData();
      formData.append('file', blob, `photobooth-${Date.now()}.png`);

      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success' || !result.data || !result.data.url) {
        throw new Error(result.message || 'Invalid response structure from upload service');
      }

      // Convert standard tmpfiles.org link to direct download link
      // E.g., 'https://tmpfiles.org/168285/photobooth-123.png' -> 'https://tmpfiles.org/dl/168285/photobooth-123.png'
      const originalUrl = result.data.url;
      const directDownloadUrl = originalUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      
      return directDownloadUrl;
    } catch (error: any) {
      console.error('Error uploading image to cloud storage:', error);
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
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
