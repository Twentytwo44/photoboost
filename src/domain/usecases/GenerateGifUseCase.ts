import type { IGifService } from '../interfaces/IGifService';

export class GenerateGifUseCase {
  private gifService: IGifService;

  constructor(gifService: IGifService) {
    this.gifService = gifService;
  }

  async execute(imageUrls: string[], delayMs: number = 800): Promise<string> {
    if (imageUrls.length === 0) {
      throw new Error('No photos captured to generate GIF.');
    }
    return this.gifService.createGif(imageUrls, delayMs);
  }
}
