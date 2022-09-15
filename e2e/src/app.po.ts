import { browser, by, element } from 'protractor';

export class AppPage {
  public navigateTo(destination) {
    return browser.get(destination);
  }

  public getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}
