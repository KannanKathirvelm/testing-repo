import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'itterateObject',  pure: false })
export class IterateObjectPipe implements PipeTransform {
  public transform(value: any, args: any[] = null): any {
    return Object.keys(value).map(key => value[key]);
  }
}
