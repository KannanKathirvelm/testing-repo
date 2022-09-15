import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { alertFadeAnimation, fadeSlowAnimation, fadeUpAnimation } from '@app/animation';

@Component({
  selector: 'nav-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
  animations: [alertFadeAnimation, fadeSlowAnimation, fadeUpAnimation]
})
export class CustomAlertComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public displayAlert: boolean;
  @Input() public successMessage1: string;
  @Input() public successMessage2: string;
  @Output() public dismissAlert = new EventEmitter();

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.displayAlert = true;
    setTimeout(() => {
      this.dismissAlert.emit(true);
      this.displayAlert = false;
    }, 3000);
  }
}
