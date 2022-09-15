import { Pipe, PipeTransform } from '@angular/core';
import { GRADING_SCALE } from '@constants/helper-constants';

@Pipe({
  name: 'gradeColor'
})
export class TransformGradeColor implements PipeTransform {
  public transform(grade) {
    let bracket = GRADING_SCALE.length - 1;
    let color = '#E3E5EA'; // Default color

    if (this.isNumeric(grade)) {
      for (; bracket >= 0; bracket--) {
        if (grade >= GRADING_SCALE[bracket].LOWER_LIMIT) {
          color = GRADING_SCALE[bracket].COLOR;
          break;
        }
      }
    }
    return color;
  }

  public isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}
