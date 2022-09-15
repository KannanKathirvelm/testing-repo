import { Component, OnDestroy } from '@angular/core';
import { ClassModel } from '@app/models/class/class';
import { ClassService } from '@app/providers/service/class/class.service';
import { AnonymousSubscription } from 'rxjs-compat/Subscription';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.page.html',
  styleUrls: ['./add-course.page.scss'],
})
export class AddCoursePage implements OnDestroy{

  public classDetailSubscription: AnonymousSubscription;
  public classDetail: ClassModel;
  constructor(
    private classService: ClassService
  ) { }

  public ionViewDidEnter() {
    this.classDetailSubscription = this.classService.fetchClassDetails
      .subscribe((classDetail) => {
        this.classDetail = classDetail;
      });
  }

  public ngOnDestroy() {
    this.classDetailSubscription.unsubscribe();
  }
}
