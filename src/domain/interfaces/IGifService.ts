export interface IGifService {
  createGif(imageUrls: string[], delayMs: number): Promise<string>; // returns base64 gif url
}
