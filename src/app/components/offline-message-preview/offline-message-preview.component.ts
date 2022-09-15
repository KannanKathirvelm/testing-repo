import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nav-offline-message-preview',
  templateUrl: './offline-message-preview.component.html',
  styleUrls: ['./offline-message-preview.component.scss'],
})
export class OfflineMessagePreviewComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public navigationPageTitle: string;
  @Output() public selectNavigationPage = new EventEmitter();

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function onClickNavigationPageUrl
   * This method is used redirect to navigation page url
   */
  public onClickNavigationPageUrl() {
    this.selectNavigationPage.emit();
  }
}
