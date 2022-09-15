import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nav-number-increment',
  templateUrl: './number-increment.component.html',
  styleUrls: ['./number-increment.component.scss'],
})
export class NumberIncrementComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public minScore: number;
  @Input() public maxScore: number;
  @Input() public increment: number;
  @Output() public scoreIncrement = new EventEmitter();
  @Input() public score: number;
  public prevInputValue: number;

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function updateScore
   * This method is used to update score
   */
  public updateScore(event) {
    let value = Number(event.target.value) || 0;
    if (value < this.minScore || value > this.maxScore) {
      value = this.prevInputValue;
    }
    event.target.value = value;
    this.prevInputValue = value;
    this.scoreIncrement.emit({ score: value || 0, isIncrement: true });
  }
}
