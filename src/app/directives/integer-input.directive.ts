import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[integerInput]'
})

export class IntegerInputDirective {

  @Input() public max: number;

  @HostListener('keypress', ['$event'])
  public onInput(event: any) {
    event.preventDefault();
    const input = event.target;
    let value = Number(input.value);
    const key = Number(event.key);
    if (Number.isInteger(key)) {
      value = Number('' + value + key);
      if (value > this.max) {
        return false;
      }
      input.value = value;
    }
  }
}
