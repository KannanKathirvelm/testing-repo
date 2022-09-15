import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {
  public transform(list, filterText: string, arg1?: string, arg2?: string) {
    return list && list.filter((item) => {
      return this.searchElement(filterText, item[`${arg1}`]) || this.searchElement(filterText, item[`${arg2}`]);
    });
  }

  private searchElement(filterText, item) {
    if (item) {
      return item.search(new RegExp(filterText, 'i')) > -1;
    }
    return;
  }
}
