import { Component, Input } from '@angular/core';
import { ClassModel } from '@models/class/class';

@Component({
  selector: 'nav-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
})
export class ClassroomComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public searchText: string;
  @Input() public isLoaded: boolean;
  @Input() public classList: Array<ClassModel>;
  @Input() public isOnline: boolean;
}
