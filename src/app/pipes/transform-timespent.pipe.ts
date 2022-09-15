import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'transformTimeSpent' })
export class TransformTimeSpent implements PipeTransform {
  public transform(timeInMillis) {
    let result = '';
    if (timeInMillis) {
      const portions: string[] = [];
      const msInHour = 1000 * 60 * 60;
      const hours = Math.trunc(timeInMillis / msInHour);
      if (hours > 0) {
        portions.push(hours + 'h');
        timeInMillis = timeInMillis - (hours * msInHour);
      }
      const msInMinute = 1000 * 60;
      const minutes = Math.trunc(timeInMillis / msInMinute);
      if (minutes > 0) {
        portions.push(minutes + 'm');
        timeInMillis = timeInMillis - (minutes * msInMinute);
      }
      const seconds = Math.trunc(timeInMillis / 1000);
      if (seconds > 0) {
        portions.push(seconds + 's');
      }
      return portions.join(' ');
    } else {
      result = '---';
    }
    return result;
  }
}
