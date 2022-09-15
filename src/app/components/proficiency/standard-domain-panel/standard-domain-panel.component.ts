import { Component, Input } from '@angular/core';
import { TopicInfoComponent } from '@components/proficiency/topic-info/topic-info.component';
import { ModalController } from '@ionic/angular';
import { CompetencyMatrixModel, DomainModel, FwCompetenciesModel } from '@models/competency/competency';
import { SubjectModel } from '@models/taxonomy/taxonomy';

@Component({
  selector: 'app-standard-domain-panel',
  templateUrl: './standard-domain-panel.component.html',
  styleUrls: ['./standard-domain-panel.component.scss'],
})
export class StandardDomainPanelComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public domains: Array<CompetencyMatrixModel>;
  @Input() public activeSubject: SubjectModel;
  @Input() public fwCompetencies: Array<FwCompetenciesModel>;
  @Input() public fwDomains: Array<DomainModel>;
  @Input() public frameworkId: string;
  @Input() public classId: string;
  public searchText: string;

  // -------------------------------------------------------------------------
  // Properties

  constructor(
    private modalController: ModalController
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function selectedTopic
   * Method to open selected topic
   */
  public selectedTopic(domain, topic) {
    const params = {
      activeSubject: this.activeSubject,
      content: {
        domain,
        topic
      },
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      classId: this.classId
    };
    this.openModalReport(
      TopicInfoComponent,
      params,
      'topic-info-component'
    );
  }

  /**
   * @function openModalReport
   * Method to open modal report
   */
  public async openModalReport(component, componentProps, cssClass) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass
    });
    await modal.present();
  }


  /**
   * @function closeModal
   * Method to close modal
   */
  public closeModal() {
    this.modalController.dismiss();
  }

  /**
   * @function handleInputEvent
   * Method to handle input event when search functionality
   */
  public handleInputEvent(event) {
    this.searchText = event.target.value.toLowerCase();
  }
}
