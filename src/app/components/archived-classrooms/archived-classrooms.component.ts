import { Component, Input } from '@angular/core';
import { ClassModel } from '@app/models/class/class';

@Component({
  selector: 'archived-classrooms',
  templateUrl: './archived-classrooms.component.html',
  styleUrls: ['./archived-classrooms.component.scss'],
})
export class ArchivedClassroomsComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public searchText: string;
  @Input() public isLoaded: boolean;
  @Input() public archivedClass: Array<ClassModel>;
  @Input() public isOnline: boolean;
}
