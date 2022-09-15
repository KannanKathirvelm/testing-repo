import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[dataVisibility]'
})

export class DataVisibilityDirective implements AfterViewInit {

  @Input() public showLearnerData: boolean;
  @Input() public asteriskInLeft: boolean;

  constructor(private elementRef: ElementRef) {
  }

  public ngAfterViewInit() {
    const element = this.elementRef.nativeElement;
    if (!this.showLearnerData) {
      element.innerText = this.asteriskInLeft && `* ${element.innerText}` || `${element.innerText} *`;
    }
  }
}
