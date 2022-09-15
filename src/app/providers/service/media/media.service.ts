import { Injectable } from '@angular/core';
import { MediaAPI } from '@providers/apis/media/media';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private mediaAPI: MediaAPI) { }

  // -------------------------------------------------------------------------
  // Actions

  public uploadContentFile(file: any, type?: string, isAudio?: boolean) {
    return new Promise((resolve, reject) => {
      this.mediaAPI.uploadContentFile(file, type, isAudio).then((response) => {
        resolve(response.data.filename);
      }, reject);
    });
  }
}
