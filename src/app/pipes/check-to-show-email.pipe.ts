import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkToShowEmail'
})
export class CheckToShowEmailPipe implements PipeTransform {
  public transform(showEmail: boolean | any, label: string) {
    if (showEmail) {
      return true;
    } else if (showEmail === null || showEmail === undefined) {
      if (label === 'email') {
        return true;
      }
    }
    return false;
  }
}
