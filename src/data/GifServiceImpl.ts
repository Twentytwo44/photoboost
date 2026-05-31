import type { IGifService } from '../domain/interfaces/IGifService';
import gifshot from 'gifshot';

export class GifServiceImpl implements IGifService {
  createGif(imageUrls: string[], delayMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      // gifshot expects the interval (frame delay) in seconds
      const intervalSec = delayMs / 1000;

      gifshot.createGIF(
        {
          images: imageUrls,
          interval: intervalSec,
          gifWidth: 480,
          gifHeight: 640,
          numWorkers: 2,
          frameDuration: 1,
          keepAspectRatio: true,
        },
        (obj: any) => {
          if (obj.error) {
            reject(new Error(obj.errorMsg || 'Failed to generate GIF.'));
          } else {
            resolve(obj.image); // base64 encoded data URL
          }
        }
      );
    });
  }
}
