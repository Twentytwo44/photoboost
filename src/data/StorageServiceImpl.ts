import type { IStorageService } from '../domain/interfaces/IStorageService';

export class StorageServiceImpl implements IStorageService {
  async uploadImage(base64DataUrl: string): Promise<string> {
    try {
      const blob = this.dataURLtoBlob(base64DataUrl);
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('time', '72h'); // 72 hours (3 days) of temporary storage
      formData.append('fileToUpload', blob, `photobooth-${Date.now()}.png`);

      const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload server error: ${response.status} - ${errorText}`);
      }

      const fileUrl = await response.text();
      if (!fileUrl || !fileUrl.startsWith('https://')) {
        throw new Error(`Invalid response from upload service: ${fileUrl}`);
      }

      return fileUrl.trim();
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
