import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  public transform(array: any, field: string): any[] {
    array.sort((a: any, b: any) => {
      const nameA = a[field]?.toLowerCase();
      const nameB = b[field]?.toLowerCase();
      if (nameA < nameB) // sort string ascending
        return -1
      if (nameA > nameB)
        return 1
      return 0 // default return value (no sorting)
    });
    return array;
  }
}
