import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TEACHER_ROLE } from '@constants/helper-constants';
import { ProfileModel } from '@models/profile/profile';
import { ModalService } from '@providers/service/modal/modal.service';
import { ProfileService } from '@providers/service/profile/profile.service';

@Component({
  selector: 'nav-add-class-collaborators',
  templateUrl: './add-class-collaborators.component.html',
  styleUrls: ['./add-class-collaborators.component.scss'],
})
export class AddClassCollaboratorsComponent {

  // -------------------------------------------------------------------------
  // Properties

  public addTeacherForm: FormGroup;
  public submitted: boolean;
  public noTeacherFound: boolean;
  public isThumbnailError: boolean;
  public collaborators: Array<ProfileModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private profileService: ProfileService,
  ) {
    this.addTeacherForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.collaborators = [];
    this.noTeacherFound = false;
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  /**
   * @function validateForm
   * This method is used to check the basic form validation
   */
  public get validateForm() {
    return this.addTeacherForm.controls;
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal(context?) {
    this.modalService.dismissModal(context);
  }

  /**
   * @function onIconClick
   * This method is used to add new collabarator.
   */
  public onIconClick() {
    this.submitted = true;
    if (this.addTeacherForm.valid) {
      const emailId = this.addTeacherForm.value.email;
      this.profileService.updateCollaborators(emailId).then((profile) => {
        if (profile.role === TEACHER_ROLE) {
          this.collaborators.push(profile);
          this.addTeacherForm.reset();
          this.submitted = false;
        } else {
          this.noTeacherFound = true;
        }
      });
    }
  }

  /**
   * @function removeCollaborator
   * This method is used to remove collaborator
   */
  public removeCollaborator(studentId) {
    const studentIndex = this.collaborators.findIndex((item) => item.id === studentId);
    this.collaborators.splice(studentIndex, 1);
  }

  /**
   * @function addTeacher
   * This method is used to add teacher
   */
  public addTeacher() {
    if (this.collaborators.length) {
      const collaboratorIds = this.collaborators.map((item) => item.id);
      this.closeModal(collaboratorIds);
    }
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
