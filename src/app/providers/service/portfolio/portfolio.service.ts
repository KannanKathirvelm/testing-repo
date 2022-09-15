import { Injectable } from '@angular/core';
import { PortfolioProvider } from '@providers/apis/portfolio/portfolio';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private portfolioProvider: PortfolioProvider) {
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchUserPortfolioUniqueItems
   * This method is used to load the portfolio Items
   */
  public fetchUserPortfolioUniqueItems(requestParam, contentBase) {
    return this.portfolioProvider.fetchUserPortfolioUniqueItems(requestParam, contentBase);
  }

  /**
   * @function fetchUniversalUserPortfolioUniqueItems
   * This method is used to load the universal portfolio Items
   */
  public fetchUniversalUserPortfolioUniqueItems(requestParam) {
    return this.portfolioProvider.fetchUniversalUserPortfolioUniqueItems(requestParam);
  }
}
