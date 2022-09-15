import { Injectable } from '@angular/core';
import { LocationProvider } from '@providers/apis/location/location';

@Injectable({
  providedIn: 'root'
})

export class LocationService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private locationProvider: LocationProvider
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentCurrentLocation
   * This method is used to fetch student current location
   */
  public getStudentCurrentLocation(classId, courseId, fwCode, userId) {
    return this.locationProvider.fetchStudentCurrentLocation(classId, courseId, fwCode, userId);
  }
}
