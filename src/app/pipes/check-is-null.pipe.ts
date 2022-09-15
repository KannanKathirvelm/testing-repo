import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkIsNull'
})
export class CheckIsNullPipe implements PipeTransform {
  public transform(value, operator?) {
    if (operator === 'eq') {
      return value === null;
    } else {
      return value !== null;
    }
  }
}
