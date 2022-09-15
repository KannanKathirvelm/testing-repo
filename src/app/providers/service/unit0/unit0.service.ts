import { Injectable } from '@angular/core';
import { Unit0Provider } from '@providers/apis/unit0/unit0';


@Injectable({
  providedIn: 'root'
})
export class Unit0Service {

  constructor(private unit0Provider: Unit0Provider) { }

  /**
   * @function fetchUnit0Contents
   * This Method is used to fetch unit0 contents
   */
  public fetchUnit0Contents(classId: string, courseId: string) {
    return this.unit0Provider.getUnit0List(classId, courseId).then((unit0Content: any) => {
        return unit0Content;
    }).catch((error) => {
      return null;
    });
  }
}