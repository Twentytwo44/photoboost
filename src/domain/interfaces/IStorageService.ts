export interface IStorageService {
  uploadImage(base64DataUrl: string): Promise<string>; // returns public url of uploaded image
}
