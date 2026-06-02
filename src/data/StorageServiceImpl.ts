import type { IStorageService } from '../domain/interfaces/IStorageService';

export class StorageServiceImpl implements IStorageService {
  async uploadImage(base64DataUrl: string): Promise<string> {
    try {
      const blob = this.dataURLtoBlob(base64DataUrl);
      const binId = this.generateRandomBinId();
      const filename = `photobooth-${Date.now()}.png`;

      const response = await fetch(`https://filebin.net/${binId}/${filename}`, {
        method: 'POST',
        body: blob,
        headers: {
          'Content-Type': 'image/png',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.bin || !result.file) {
        throw new Error('Invalid response structure from upload service');
      }

      return `https://filebin.net/${result.bin.id}/${result.file.filename}`;
    } catch (error: any) {
      console.error('Error uploading image to cloud storage:', error);
      throw new Error(`Failed to upload image: ${error.message || error}`);
    }
  }

  private generateRandomBinId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
