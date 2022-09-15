import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'competencyGutToFwTransform' })
export class CompetencyGutToFwTransform implements PipeTransform {
  public transform(fwCompetencies, gutCode, gutValue, lookupKeyName, showDefault, doTransform) {
    let fwCompetency = {};
    if (fwCompetencies) {
      fwCompetency = fwCompetencies.find(competency => {
        return competency[gutCode];
      });
    }
    if (doTransform) {
      const competencyStatement = !showDefault && fwCompetency && fwCompetency[gutCode] && fwCompetency[gutCode][lookupKeyName];
      return competencyStatement || gutValue;
    }
  }
}
