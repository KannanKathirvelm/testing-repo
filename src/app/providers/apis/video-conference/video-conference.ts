import { Injectable } from '@angular/core';
import { HttpService } from '@providers/apis/http';

@Injectable({
  providedIn: 'root'
})

export class VideoConferenceProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/meeting-tools/v1/auth/google/calendar';
  private zoomAuthNamespace = 'api/meeting-tools/v1/auth/zoom';
  private zoomMeetingNamespace = 'api/meeting-tools/v1/zoom/meeting';
  private classNamespace = 'api/nucleus/v2/classes';

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchZoomToken
   * Method to fetch zoom token
   */
  public fetchZoomToken(token) {
    const endpoint = `${this.zoomAuthNamespace}/token`;
    const tokenHeaders = this.httpService.getTokenHeaders(token);
    return this.httpService.get(endpoint, null, tokenHeaders).then((response) => {
      return response.data;
    })
  }

  /**
   * @function fetchConferenceToken
   * Method to fetch conference token
   */
  public fetchConferenceToken(token) {
    const endpoint = `${this.namespace}/token`;
    const tokenHeaders = this.httpService.getTokenHeaders(token);
    return this.httpService.get(endpoint, null, tokenHeaders).then((response) => {
      return response.data;
    })
  }

  /**
   * @function createZoomMeeting
   * Method to create zoom meeting
   */
  public createZoomMeeting(meetingInfo) {
    const endpoint = `${this.zoomMeetingNamespace}`;
    return this.httpService.post(endpoint, meetingInfo).then((response) => {
      return response.data;
    });
  }

  /**
   * @function createConferenceEvent
   * Method to create conference event
   */
  public createConferenceEvent(meetingInfo) {
    const endpoint = `${this.namespace}/event`;
    return this.httpService.post(endpoint, meetingInfo).then((response) => {
      return response.data;
    });
  }

  /**
   * @function updateConferenceEvent
   * Method to update conference event
   */
  public updateConferenceEvent(classId, contentId, params) {
    const endpoint = `${this.classNamespace}/${classId}/contents/${contentId}/meeting`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function updateZoomMeeting
   * Method to update zoom meeting
   */
  public updateZoomMeeting(id, params) {
    const endpoint = `${this.zoomMeetingNamespace}/${id}`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function updateConferenceCalendarEvent
   * Method to update conference calender event
   */
  public updateConferenceCalendarEvent(id, params) {
    const endpoint = `${this.namespace}/event/${id}`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function authorizeZoom
   * Method to authorize zoom
   */
  public authorizeZoom(redirectUrl) {
    const endpoint = `${this.zoomAuthNamespace}/authorize`;
    const params = { redirectUrl };
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function authorizeConference
   * Method to authorize conference
   */
  public authorizeConference(redirectUrl) {
    const endpoint = `${this.namespace}/authorize`;
    const params = { redirectUrl };
    return this.httpService.post(endpoint, params);
  }
}
