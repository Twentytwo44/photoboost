declare module 'gifshot' {
  interface Options {
    images: string[];
    interval?: number;
    gifWidth?: number;
    gifHeight?: number;
    numWorkers?: number;
    frameDuration?: number;
    keepAspectRatio?: boolean;
    loop?: number;
  }

  interface ResponseObject {
    error: boolean;
    errorMsg: string;
    image: string;
  }

  export function createGIF(
    options: Options,
    callback: (obj: ResponseObject) => void
  ): void;
}
