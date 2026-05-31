import type { IStorageService } from '../interfaces/IStorageService';

export class ShareStripUseCase {
  private storageService: IStorageService;

  constructor(storageService: IStorageService) {
    this.storageService = storageService;
  }

  async execute(base64Image: string): Promise<string> {
    if (!base64Image) {
      throw new Error('No composite image found to upload.');
    }
    return this.storageService.uploadImage(base64Image);
  }
}
