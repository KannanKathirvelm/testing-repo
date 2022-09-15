import { NgModule } from '@angular/core';
import { DataVisibilityDirective } from '@directives/data-visibility.directive';
import { DropdownScrollIntoViewDirective } from '@directives/drop-down-scroll-into-view.directive';
import { InAppBrowserDirective } from '@directives/in-app-browser.directive';
import { IntegerInputDirective } from '@directives/integer-input.directive';
import { ScorePointsTooltipDirective } from '@directives/score-points-tooltip.directive';
import { ImageLoaderDirective } from '@directives/image-loader.directive';

const DIRECTIVES = [
  DropdownScrollIntoViewDirective,
  IntegerInputDirective,
  InAppBrowserDirective,
  ScorePointsTooltipDirective,
  DataVisibilityDirective,
  ImageLoaderDirective
];

@NgModule({
  declarations: [DIRECTIVES],
  exports: [DIRECTIVES]
})
export class ApplicationDirectivesModule { }
