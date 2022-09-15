import { Injectable } from '@angular/core';
import { MEETING_TOOLS } from '@constants/helper-constants';
import { environment } from '@environment/environment';
import { VideoConferenceProvider } from '@providers/apis/video-conference/video-conference';
import { AuthService } from '@providers/service/auth/auth.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';
import * as moment from 'moment';

@Injectable()
export class VideoConferenceService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private videoConferenceProvider: VideoConferenceProvider,
    private sessionService: SessionService,
    private authService: AuthService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchConferenceToken
   * This Method is used to fetch meet token
   */
  public fetchConferenceToken() {
    return this.authService.getAccessToken().then((token) => {
      return new Promise((resolve, reject) => {
        this.sessionService.getConferenceTokenFromSession().then((tokenFromSession) => {
          if (!tokenFromSession) {
            return this.videoConferenceProvider.fetchConferenceToken(token).then((response) => {
              const conferenceToken = response.accessToken;
              this.sessionService.setConferenceToken(conferenceToken);
              resolve(conferenceToken);
            }, reject);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * @function fetchZoomToken
   * This Method is used to fetch zoom token
   */
  public fetchZoomToken() {
    return this.authService.getAccessToken().then((token) => {
      return new Promise((resolve, reject) => {
        this.sessionService.getZoomTokenFromSession().then((tokenFromSession) => {
          if (!tokenFromSession) {
            return this.videoConferenceProvider.fetchZoomToken(token).then((response) => {
              const zoomToken = response.accessToken;
              this.sessionService.setZoomToken(zoomToken);
              resolve(zoomToken);
            }, reject);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * @function createZoomMeeting
   * This Method is used to fetch zoom meeting
   */
  public createZoomMeeting(meetingInfo) {
    return new Promise((resolve, reject) => {
      return this.videoConferenceProvider.createZoomMeeting(meetingInfo).then((info) => {
        resolve({
          meetingId: `${info.id}`,
          meetingUrl: info.join_url
        });
      }, reject);
    });
  }

  /**
   * @function createConference
   * This Method is used to create conference
   */
  public createConference(meetingInfo) {
    return new Promise((resolve, reject) => {
      return this.videoConferenceProvider.createConferenceEvent(meetingInfo).then((info) => {
        resolve({
          meetingId: info.meetingEventId,
          meetingUrl: info.meetingHangoutUrl
        })
      }, reject);
    });
  }

  /**
   * @function updateConferenceEvent
   * This Method is used to update conference event
   */
  public updateConference(classId, contentId, params) {
    return this.videoConferenceProvider.updateConferenceEvent(classId, contentId, params);
  }

  /**
   * @function updateZoomMeeting
   * This Method is used to update zoom meeting
   */
  public updateZoomMeeting(meetingId, params) {
    return this.videoConferenceProvider.updateZoomMeeting(meetingId, params);
  }

  /**
   * @function updateConferenceCalendarEvent
   * This Method is used to update zoom conference calender
   */
  public updateConferenceCalendarEvent(meetingId, params) {
    return this.videoConferenceProvider.updateConferenceCalendarEvent(meetingId, params);
  }

  /**
   * @function authorizeZoom
   * This Method is used to authorize zoom
   */
  public authorizeZoom(redirectionUrl) {
    return this.videoConferenceProvider.authorizeZoom(redirectionUrl).then((response) => {
      return response.headers.location;
    });
  }

  /**
   * @function authorizeConference
   * This Method is used to authorize conference
   */
  public authorizeConference(redirectionUrl) {
    return this.videoConferenceProvider.authorizeConference(redirectionUrl).then((response) => {
      return response.headers.location;
    });
  }

  /**
   * @function authorizeMeetingTool
   * This Method is used to authorize meeting tool
   */
  public async authorizeMeetingTool() {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    if (meetingTool === MEETING_TOOLS.zoom) {
      return this.fetchZoomToken();
    } else {
      return this.fetchConferenceToken();
    }
  }

  /**
   * @function createVideoConferenceList
   * This method is used to create video conference list
   */
  public createVideoConferenceList(activity, studentsEmailIds) {
    return this.createConferenceEvent(activity, studentsEmailIds).then((eventDetails: { meetingUrl: string; meetingId: string; }) => {
      activity.meetingId = eventDetails.meetingId;
      activity.meetingUrl = eventDetails.meetingUrl;
      if (eventDetails.meetingUrl) {
        const updateParams = {
          meeting_id: eventDetails.meetingId,
          meeting_url: eventDetails.meetingUrl,
          meeting_endtime: activity.meetingEndTime,
          meeting_starttime: activity.meetingStartTime,
          meeting_timezone: moment.tz.guess()
        }
        return this.updateConference(activity.classId, activity.id, updateParams).then(() => {
          return updateParams;
        });
      }
    });
  }

  /**
   * @function createConferenceEvent
   * This method is used to create conference event
   */
  public async createConferenceEvent(activity, emailIDs) {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    if (meetingTool === MEETING_TOOLS.zoom) {
      const params = {
        topic: `${activity.title}: ${activity.title}`,
        type: 2,
        start_time: activity.meetingStartTime,
        duration: moment(activity.meetingEndTime).diff(moment(activity.meetingStartTime), 'minutes'),
        timezone: moment.tz.guess(),
        password: environment.ZOOM_PASSWORD
      }
      return this.createZoomMeeting(params);
    } else {
      const params = {
        summary: `${activity.title} : ${activity.title}`,
        startDateTime: activity.meetingStartTime,
        endDateTime: activity.meetingEndTime,
        attendees: emailIDs,
        timeZone: moment.tz.guess()
      };
      return this.createConference(params);
    }
  }

  /**
   * @function updateConferenceCalenderEvent
   * This method is used to update conference calender
   */
  public async updateConferenceCalenderEvent(content) {
    const meetingTool = await this.utilsService.preferredMeetingTool();
    if (meetingTool === MEETING_TOOLS.zoom) {
      const params = {
        topic: `${content.title} : ${content.title}`,
        type: 2,
        start_time: content.meetingStartTime,
        duration: moment(content.meetingEndTime).diff(moment(content.meetingStartTime), 'minutes'),
        timezone: moment.tz.guess(),
        password: environment.ZOOM_PASSWORD
      }
      return this.updateZoomMeeting(content.meetingId, params)
    } else {
      const params = {
        summary: `${content.title}: ${content.title}`,
        startDateTime: content.meetingStartTime,
        endDateTime: content.meetingEndTime,
        timeZone: moment.tz.guess()
      }
      return this.updateConferenceCalendarEvent(content.meetingId, params);
    }
  }
}
