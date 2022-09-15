import { Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT_KEYS } from '@app/constants/database-constants';
import { FileTransfer, FileTransferObject} from '@ionic-native/file-transfer/ngx'
import {
  ATTEMP_STATUS,
  CONTENT_TYPES,
  PLAYER_TOOLBAR_OPTIONS,
  QUESTION_TYPES,
  VIDEO_RESOURCE_TYPES,
} from '@constants/helper-constants';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { CollectionEventModel } from '@models/player/player';
import { TranslateService } from '@ngx-translate/core';
import { PlayerProvider } from '@providers/apis/player/player';
import { UtilsService } from '@providers/service/utils.service';
import { checkHttpUrl, checkUrlisPDF } from '@utils/global';
import Player from '@vimeo/player';
import CryptoJS from 'crypto-js';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from '../database.service';


@Injectable({
  providedIn: 'root',
})
export class CollectionPlayerService implements OnDestroy {
  // -------------------------------------------------------------------------
  // Properties
  private collectionEventSubject: BehaviorSubject<CollectionEventModel>;
  private resourceEventSubject: BehaviorSubject<any>;
  private questionStartTime: number;
  private questionEndTime: number;
  private readonly YOUTUBEPATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  private readonly VIMEOPATTERN = /vimeo.*\/(\d+)/;
  public player: Player;
  private readonly ALLOWED_STRUGGLES_QUESTION_TYPES = ['multiple_choice_question'];
  public readonly PLAYED_COLLECTION = 'played_collection';
  private currentQuestionEventId: string;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private spinnerDialog: SpinnerDialog,
    private dialogs: Dialogs,
    private inAppBrowser: InAppBrowser,
    private playerProvider: PlayerProvider,
    private translate: TranslateService,
    private utilsService: UtilsService,
    private databaseService: DatabaseService,
    private fileOpener: FileOpener,
    private transfer: FileTransfer,
    private file: File
  ) {
    this.collectionEventSubject = new BehaviorSubject<CollectionEventModel>(
      null
    );
    this.resourceEventSubject = new BehaviorSubject<any>(null);
  }

  get collectionEventContext() {
    return this.collectionEventSubject
      ? this.collectionEventSubject.value
      : null;
  }

  get resourceEventContext() {
    return this.resourceEventSubject
      ? this.resourceEventSubject.value
      : null;
  }

  get resourceTime() {
    return this.questionEndTime - this.questionStartTime;
  }

  /**
   * @function onCollectionPlay
   * This method is used to start play event for collection
   */
  public onCollectionPlay(collection, params, sessionId?) {
    this.playerProvider
      .collectionPlayEvent(collection, params, sessionId)
      .then((collectionEventContext: CollectionEventModel) => {
        this.collectionEventSubject.next(collectionEventContext);
      });
  }

  /**
   * @function getInlineVideoResourceType
   * This method is used to check the inline videos
   */
  public getInlineVideoResourceType(url) {
    if (this.YOUTUBEPATTERN.test(url)) {
      return VIDEO_RESOURCE_TYPES.YOUTUBE;
    }
    if (this.VIMEOPATTERN.test(url)) {
      return VIDEO_RESOURCE_TYPES.VIMEO;
    }
    return null;
  }

  /**
   * @function getYoutubePlayer
   * This method is used to get the youTube play instance
   */
  public getYoutubePlayer() {
    if (!this.player) {
      this.player = new Promise((resolve) => {
        (window as any).onYouTubeIframeAPIReady = () =>
          resolve((window as any).YT);
      });
      return this.player;
    }
    return this.player;
  }

  /**
   * @function getYoutubeVideoId
   * This method is used to get the youtube video id
   */
  public getYoutubeVideoId(url) {
    const urls = url.match(this.YOUTUBEPATTERN);
    return urls[1];
  }

  /**
   * @function getVimeoVideoId
   * This method is used to get the vimeo video id
   */
  public getVimeoVideoId(url) {
    const parseUrl = this.VIMEOPATTERN.exec(url);
    return parseUrl[1];
  }

  /**
   * @function onCollectionStop
   * This method is used to stop play event for collection
   */
  public onCollectionStop() {
    return new Promise((resolve, reject) => {
      this.playerProvider
        .collectionStopEvent(this.collectionEventContext)
        .then(() => {
          const sessionId = this.collectionEventContext.session
            .sessionId;
          this.collectionEventSubject.next(null);
          resolve(sessionId);
        }, reject);
    });
  }

  /**
   * @function getOfflineResourceContent
   * This method is used to open the offline resource content
   */
  public getOfflineResourceContent(collectionId, resourceId) {
    const databaseKey = this.databaseService.documentKeyParser(DOCUMENT_KEYS.COLLECTION_MEDIA, {
      collectionId
    });
    return this.databaseService.getDocument(databaseKey).then((result) => {
      const resourceMedia = result.value.find((media) => {
        return media.id === resourceId;
      });
      return resourceMedia;
    });
  }

  /**
   * @function openOfflineResourceContent
   * This method is used to open the offline resource content
   */
  public async openOfflineResourceContent(collectionId, resource) {
    const resourceMedia = await this.getOfflineResourceContent(collectionId, resource.id);
    await this.fileOpener.open(resourceMedia.filePath, resourceMedia.mimeType);
  }

  /**
   * @function openResourceContent
   * This method is used to open the resource content
   */
  public async openResourceContent(collectionId, resource) {
    const isOnline = this.utilsService.isNetworkOnline();
    if (!isOnline) {
      this.openOfflineResourceContent(collectionId, resource)
      return;
    }
    const url = resource.url;
    const isPdfResource = checkUrlisPDF(resource.url);
    if (isPdfResource) {
      this.downloadPdf(url);
    } else {
      const target = '_blank';
      const options = this.getInAppBrowserOptions();
      const browser = this.inAppBrowser.create(
        url,
        target,
        options
      );
      const alertMessage = this.translate.instant(
        'IN_APP_BROWSER_ALERT_MSG'
      );
      browser.on('loadstart').subscribe(() => {
        this.spinnerDialog.show();
      });
      browser.on('loadstop').subscribe(() => {
        this.spinnerDialog.hide();
      });
      browser.on('loaderror').subscribe(() => {
        this.spinnerDialog.hide();
        this.dialogs.alert(alertMessage).then(() => {
          browser.hide();
        });
      });
    }
  }

  /**
   * @function getInAppBrowserOptions
   * This method is used to get the in app browser options
   */
  public getInAppBrowserOptions() {
    const options: InAppBrowserOptions = {
      location: 'yes',
      hidden: 'no',
      zoom: 'yes',
      hideurlbar: 'yes',
      toolbarcolor: PLAYER_TOOLBAR_OPTIONS.BACKGROUND_COLOR,
      navigationbuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
      closebuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
    };
    return options;
  }

  /**
   * @function stopResourcePlayEvent
   * This method is used to get play event for resource
   */
  public stopResourcePlayEvent() {
    this.playerProvider
      .collectionResourceStopEvent(this.resourceEventContext)
      .then(() => {
        this.resourceEventSubject.next(null);
      });
  }

  /**
   * @function stopResourcePlayEvent
   * This method is used to get play event for resource
   */
  public reactionCreateEvent(
    collection,
    params,
    resource,
    eventId,
    reaction
  ) {
    this.playerProvider.reactionEvent(
      collection,
      params,
      resource,
      eventId,
      reaction
    );
  }

  /**
   * @function startResourcePlayEvent
   * This method is used to get play event for resource
   */
  public startResourcePlayEvent(collection, params, resource, eventId) {
    params.sessionId = this.collectionEventContext.session.sessionId;
    params.parentEventId = this.collectionEventContext.eventId;
    params.startTime = moment().valueOf();
    this.playerProvider
      .collectionResourcePlayEvent(collection, params, resource, eventId)
      .then((resourceEventContext) => {
        this.resourceEventSubject.next(resourceEventContext);
      });
  }

  /**
   * @function playQuestionResourceContent
   * This method is used to start play event for question
   */
  public playQuestionResourceContent(eventId) {
    this.currentQuestionEventId = eventId;
    this.questionStartTime = moment().valueOf();
  }

  /**
   * @function postSelfReport
   * This method is used to post self report for external collections/assessments
   */
  public postSelfReport(collection, context, score, timespent) {
    return this.playerProvider.postSelfReport(
      collection,
      context,
      score,
      timespent
    );
  }

  /**
   * @function stopQuestionResourceContent
   * This method is used to stop play event for question
   */
  public stopQuestionResourceContent(
    collection,
    params,
    resource,
    selectedAnswers,
    isSkipped?
  ) {
    return new Promise((resolve, reject) => {
      const questionType = QUESTION_TYPES[resource.contentSubformat];
      this.questionEndTime = moment().valueOf();
      params.sessionId = this.collectionEventContext.session.sessionId;
      params.parentEventId = this.collectionEventContext.eventId;
      const startTime = isSkipped ? 0 : this.questionStartTime; // if question is skipped start time will be 0
      params.startTime = startTime; // on question start event start and end time will be same
      params.endTime = startTime;
      params.payLoadObject = { questionType };
      this.playerProvider
        .collectionResourcePlayEvent(
          collection,
          params,
          resource,
          this.currentQuestionEventId
        )
        .then((resourceEventContext) => {
          this.resourceEventSubject.next(resourceEventContext);
          const answerPayLoad = this.createAnswerPayLoadObject(
            resource,
            questionType,
            selectedAnswers,
            isSkipped
          );
          const payLoadObject = this.playerProvider.createPayLoadObject(
            answerPayLoad
          );
          this.resourceEventContext.payLoadObject = payLoadObject;
          this.playerProvider
            .collectionResourceStopEvent(
              this.resourceEventContext,
              isSkipped
            )
            .then(() => {
              this.resourceEventSubject.next(null);
              resolve();
            }, reject);
        }, reject);
    });
  }

  /**
   * @function createAnswerPayLoadObject
   * This method is used to create answer payload object
   */
  public createAnswerPayLoadObject(
    resource,
    questionType,
    selectedAnswers,
    isSkipped
  ) {
    const isOpendedQuestion =
      questionType === QUESTION_TYPES.openEnded;
    const answerObject = selectedAnswers.map((answer, index) => {
      const status = answer.is_correct
        ? ATTEMP_STATUS.CORRECT
        : ATTEMP_STATUS.INCORRECT;
      const answerId =
        questionType !== QUESTION_TYPES.multipleAnswer
          ? index.toString()
          : `answer_${index + 1}`;
      return {
        text: answer.answer_text,
        order: answer.sequence,
        answerId,
        timeStamp: this.resourceTime,
        status: !isOpendedQuestion ? status : undefined, // No need to pass status for OE question
        skip: false,
      };
    });
    let attemptStatus = ATTEMP_STATUS.CORRECT;
    if (isSkipped) {
      attemptStatus = ATTEMP_STATUS.SKIPPED;
    } else if (isOpendedQuestion) {
      attemptStatus = ATTEMP_STATUS.ATTEMPTED;
    } else {
      const inCorrectAnswer = answerObject.find((answer) => {
        return answer.status === ATTEMP_STATUS.INCORRECT;
      });
      if (inCorrectAnswer) {
        attemptStatus = ATTEMP_STATUS.INCORRECT;
      }
    }
    return { attemptStatus, questionType, answerObject };
  }

  /**
   * @function getResourceStrugglesContext
   * This method is used to get struggles context
   */
  public getResourceStrugglesContext(assessment, selectedQuestionAnswers) {
    if (assessment.content && selectedQuestionAnswers) {
      return assessment.content.map((question) => {
        if (this.ALLOWED_STRUGGLES_QUESTION_TYPES.includes(question.contentSubformat)) {
          const userSelectedQuestionAnswer = selectedQuestionAnswers.find((questionAnswer) => {
            return questionAnswer.questionId === question.id;
          });
          if (userSelectedQuestionAnswer) {
            const questionType = QUESTION_TYPES[question.contentSubformat];
            let answerPayload = userSelectedQuestionAnswer;
            if (!answerPayload.alreadyPlayedQuestions) {
              answerPayload = this.createAnswerPayLoadObject(question, questionType, userSelectedQuestionAnswer.selectedAnswers, false);
            }
            const answers = answerPayload.alreadyPlayedQuestions ? answerPayload.alreadyPlayedQuestions : answerPayload;
            const answer = question.answer.map((payload) => {
              const userSelected = answers.answerObject.find((userAnswer) => {
                return payload.sequence === userAnswer.order;
              });
              return {
                is_correct: payload.is_correct,
                struggles: payload.struggles ? payload.struggles : [],
                user_selected: userSelected ? 1 : 0
              };
            });
            return {
              resource_id: question.id,
              resource_type: userSelectedQuestionAnswer.contentFormat,
              status: answers.attemptStatus,
              answer
            };
          } else {
            return {};
          }
        } else {
          return {};
        }
      });
    }
    return [];
  }

  /**
   * @function checkUserAnswers
   * This method is used to integrate user answer status
   */
  public checkUserAnswers(answers, userAnswers, showCorrectAnswer?) {
    if (!answers) {
      return [];
    }
    return answers.map((answer, index) => {
      const performance =
        userAnswers && userAnswers.answerObject
          ? userAnswers.answerObject.find((performanceAnswer) => {
            return userAnswers.questionType === QUESTION_TYPES.multipleAnswer ? performanceAnswer.order === answer.sequence : performanceAnswer.answer_text === answer.answer_text;
          })
          : null;
      if (performance) {
        answer.status = performance.status;
      } else {
        answer.status = ATTEMP_STATUS.SKIPPED;
        if (showCorrectAnswer) {
          answer.status = answer.is_correct
            ? ATTEMP_STATUS.CORRECT
            : null;
        }
      }
      return answer;
    });
  }

  /**
   * @function checkSerpAudioAnswers
   * This method is used to integrate serp user answer
   */
  public checkSerpAudioAnswers(answers, userAnswers, showCorrectAnswer?, hintExplanationDetail?) {
    if (!answers) {
      return [];
    }
    return answers.map((answer, index) => {
      const performance =
        userAnswers && userAnswers.answerObject
          ? userAnswers.answerObject.find((performanceAnswer) => {
            return performanceAnswer.order === answer.sequence;
          })
          : null;
      if (performance) {
        const pattern = checkHttpUrl(performance.answer_text);
        if (pattern) {
          answer.audioUrl = performance.answer_text;
        }
      } else {
        const exemplarDocs = hintExplanationDetail && hintExplanationDetail.exemplar_docs;
        if (showCorrectAnswer && exemplarDocs && exemplarDocs.length) {
          answer.audioUrl = exemplarDocs[index].audio_url;
        } else {
          answer.audioUrl = null;
        }
      }
      return answer;
    });
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnDestroy() {
    this.currentQuestionEventId = null;
    this.collectionEventSubject.next(null);
    this.resourceEventSubject.next(null);
  }

  /*
   * @function checkEvidenceIsEnabled
   * This method is used to check evidence is enable
   */
  public checkEvidenceIsEnabled(classDetails, tenantSettings, content) {
    let isShowEvidence = false;
    if (content.contentFormat === CONTENT_TYPES.QUESTION) {
      isShowEvidence = classDetails ? classDetails.setting['show.evidence'] : false;
      if (tenantSettings) {
        const questionEvidenceVisibilityList = tenantSettings.uiElementVisibilitySettings ? tenantSettings.uiElementVisibilitySettings.questionEvidenceVisibility : null;
        if (isShowEvidence) {
          if (questionEvidenceVisibilityList) {
            isShowEvidence = questionEvidenceVisibilityList[content.contentSubformat];
          }
        }
        if (!isShowEvidence && questionEvidenceVisibilityList && questionEvidenceVisibilityList.default) {
          isShowEvidence = questionEvidenceVisibilityList[content.contentSubformat];
        }
        if (!isShowEvidence && !questionEvidenceVisibilityList) {
          isShowEvidence = content?.player_metadata?.isEvidenceEnabled;
        }
      }
    }
    return isShowEvidence;
  }

  /**
   * @function downloadPdf
   * This method is used to download the pdf file
   */
  public downloadPdf(pdfUrl) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const fileName = `${CryptoJS.SHA1(pdfUrl)}.pdf`;
    let fileDirectory;
    let fileUrl;
    if (this.utilsService.isAndroid()) {
      fileDirectory = `${this.file.dataDirectory}`;
      fileUrl = `${this.file.dataDirectory}${fileName}`;
    } else {
      fileDirectory = this.file.dataDirectory;
      fileUrl = `${this.file.dataDirectory}/${fileName}`
    }
    const fileCheckPromise = fileDirectory ? this.file.checkFile(fileDirectory, fileName) : Promise.reject(null);
    fileCheckPromise.then(() => {
      this.openPdf(fileUrl);
    }).catch(() => {
      fileTransfer.download(pdfUrl, fileUrl).then((entry) => {
        this.openPdf(entry.toURL());
      });
    });
  }

  /**
   * @function openPdf
   * This method is used to open the pdf file
   */
  public openPdf(pdfUrl) {
    this.fileOpener.open(pdfUrl, 'application/pdf');
  }
}
