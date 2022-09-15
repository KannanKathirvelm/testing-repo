import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SplashPage } from '@pages/splash/splash.page';
import { HttpService } from '@providers/apis/http';
import { CustomTranslateLoader } from '@providers/service/custom-translateloader.service';
import { SessionService } from '@providers/service/session/session.service';
import { StorageService } from '@providers/service/store.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MODULES, PROVIDERS } from './app.imports';
import { GlobalErrorHandler } from './global-error';

export function sessionInit(sessionService: SessionService) {
  return () => sessionService.initSession();
}

@NgModule({
  declarations: [AppComponent, SplashPage],
  entryComponents: [SplashPage],
  imports: [
    MODULES,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpService, StorageService]
      }
    }),
    BrowserAnimationsModule,
  ],
  providers: [
    PROVIDERS,
    {
      provide: APP_INITIALIZER,
      useFactory: sessionInit,
      deps: [SessionService],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }
  ],
  exports: [SplashPage],
  bootstrap: [AppComponent]
})
export class AppModule { }
