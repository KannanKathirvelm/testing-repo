import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nav-ca-max-score',
  templateUrl: './ca-max-score.component.html',
  styleUrls: ['./ca-max-score.component.scss'],
})
export class CaMaxScoreComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public minScore: number;
  @Input() public maxScore: number;
  @Input() public scoreLabel: string;
  @Input() public buttonText: string;
  @Output() public userScore = new EventEmitter();
  public userEnterScore: number;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.userEnterScore = 0;
  }

  /**
   * @function onMaxScoreEnter
   * mthods to get max score enter
   */
  public onMaxScoreEnter(event) {
    this.userEnterScore = Number(event.target.value);
  }

  /**
   * @function submitScore
   * method to submit score
   */
  public submitScore() {
    this.userScore.emit(this.userEnterScore || 0);
  }
}
