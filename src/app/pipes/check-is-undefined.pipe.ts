import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkIsUndefined'
})
export class CheckIsUndefinedPipe implements PipeTransform {
  public transform(value, operator?) {
    if (operator === 'eq') {
      return value === undefined;
    } else {
      return value !== undefined;
    }
  }
}
