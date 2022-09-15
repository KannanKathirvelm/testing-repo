import { Component, Input, OnInit } from '@angular/core';
import { NotificationModel } from '@models/notification/notification';

@Component({
  selector: 'notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public notification: NotificationModel;
  public translateParams: { occurrence: number };

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.translateParams = { occurrence: this.notification.occurrence }
  }
}
