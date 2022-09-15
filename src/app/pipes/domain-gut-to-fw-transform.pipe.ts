import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'domainGutToFwTransform' })
export class DomainGutToFwTransform implements PipeTransform {
  public transform(fwDomains = [], gutCode, gutValue, lookupKeyName, doTransform) {
    const fwDomain = fwDomains.find((domain) => {
      return domain[gutCode];
    });
    if (doTransform) {
      return fwDomain ? fwDomain[gutCode][`${lookupKeyName}`] : gutValue;
    } else {
      return gutValue;
    }
  }
}
