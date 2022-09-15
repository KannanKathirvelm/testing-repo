import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { AddClassCollaboratorsComponent } from '@components/class/class-settings/add-class-collaborators/add-class-collaborators.component';
import { AlertController } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { ProfileModel } from '@models/profile/profile';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '@providers/service/modal/modal.service';
import { SessionService } from '@providers/service/session/session.service';

@Component({
  selector: 'teacher-list',
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.scss'],
})
export class TeacherListComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classOwner: ProfileModel;
  @Input() public classCollaborators: Array<ProfileModel>;
  @Input() public classDetails: ClassModel;
  @Output() public updateCollaborator = new EventEmitter();
  @Output() public deleteCollaborator = new EventEmitter();
  @Output() public applySetting = new EventEmitter();
  public showNgxAvatar: boolean;
  public addTeacher: boolean;
  public isCheckboxSelected: boolean;
  public checkedValue: string;
  public userId: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    public alertController: AlertController,
    private translate: TranslateService,
    private sessionService: SessionService,
    private modalService: ModalService,
    private parseService: ParseService
  ) {
    this.addTeacher = false;
    this.isCheckboxSelected = false;
  }

  // -------------------------------------------------------------------------
  // life cycle

  public ngOnInit() {
    this.userId = this.sessionService.userSession.user_id;
    this.handleAvatarImage();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function handleAvatarImage
   * This Method is used to handle avatar image.
   */
  public handleAvatarImage() {
    this.showNgxAvatar = this.classOwner && !this.classOwner.avatarUrl;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function onAddTeacher
   * This Method is used to add teacher
   */
  public onAddTeacher() {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CLASS_SETTINGS_ADD_TEACHER, context);
    this.modalService.openModal(AddClassCollaboratorsComponent, {}, 'add-collabarator').then((collaboratorIds: Array<string>) => {
      if (collaboratorIds && collaboratorIds.length) {
        const existingCollaboratorIds = this.classCollaborators.map((item) => item.id);
        const newCollaboratorIds = existingCollaboratorIds.concat(collaboratorIds);
        this.updateCollaborator.emit(newCollaboratorIds);
      }
    });
  }

  /**
   * @function onClickCancleButton
   * This Method is used to cancel to add teacher
   */
  public onClickCancleButton() {
    this.addTeacher = false;
  }

  /**
   * @function onDeleteTeacher
   * This Method is used to delete a teacher
   */
  public async onDeleteTeacher(classCollaborator) {
    const alert = await this.alertController.create({
      cssClass: 'alert-popup-container',
      header: this.translate.instant('ARE_YOU_SURE'),
      message: this.translate.instant('DELETE_TEACHER'),
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'cancel-button'
        }, {
          text: this.translate.instant('DELETE'),
          role: 'delete',
          cssClass: 'delete-button',
          handler: () => {
            this.onConfirmDeleteTeacher(classCollaborator);
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * @function onConfirmDeleteTeacher
   * This Method is used to confirm delete a teacher
   */
  public onConfirmDeleteTeacher(classCollaborator) {
    this.deleteCollaborator.emit(classCollaborator.id);
  }

  /**
   * @function onSelectCheckbox
   * This Method is used to select co-teacher.
   */
  public onSelectCheckbox(event) {
    this.checkedValue = event.id;
    this.isCheckboxSelected = true;
  }


  /**
   * @function onApplySettings
   * This Method is used to update the settings regarding teachers.
   */
  public onApplySettings() {
    this.applySetting.emit(this.checkedValue);
  }

  /**
   * @function getEventContext
   * This method is used to get the context for add teacher event
   */
  public getEventContext() {
    return {
      classId: this.classDetails.id,
      className: this.classDetails.title,
      courseId: this.classDetails.courseId
    };
  }
}
