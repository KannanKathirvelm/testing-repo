// Providers
import { AuthProvider } from '@providers/apis/auth/auth';
import { HttpService } from '@providers/apis/http';
import { TranslationService } from '@providers/service/translation.service';
import { AppAuthGuard } from './app.auth.guard';
import { AppLogout } from './app.logout';

// Ionic native providers
// Modules
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from '@components/components.module';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Market } from '@ionic-native/market/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { TransformGradeColor } from '@pipes/transform-grade-color.pipe';
import { TransformTimeSpent } from '@pipes/transform-timespent.pipe';
import { AppService } from '@providers/service/app.service';
import { DownloadService } from '@providers/service/download.service';
import { LoadingService } from '@providers/service/loader.service';
import { LocalNotificationService } from '@providers/service/local-notification.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { StudentModalService } from '@providers/service/modal/student-modal/student-modal.service';
import { ReportService } from '@providers/service/report/report.service';
import { SessionService } from '@providers/service/session/session.service';
import { StorageService } from '@providers/service/store.service';
import { StudentService } from '@providers/service/student/student.service';
import { ToastService } from '@providers/service/toast.service';
import { UtilsService } from '@providers/service/utils.service';
import { VideoConferenceService } from '@providers/service/video-conference/video-conference.service';
import { SyncService } from './providers/service/sync.service';

import { AppStoreModule } from '@stores/store.module';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { AvatarModule } from 'ngx-avatar';
import { CalendarModule } from 'primeng/calendar';
import { AppRoutingModule } from './app-routing.module';

// Ionic native providers
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AppLauncher } from '@ionic-native/app-launcher/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx'
import { File } from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Media } from '@ionic-native/media/ngx';
import { Network } from '@ionic-native/network/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { PopoverService } from '@providers/service/popover.service';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

export const MODULES = [
  AppRoutingModule,
  BrowserModule,
  HttpClientModule,
  ApplicationPipesModule,
  AppStoreModule,
  AvatarModule,
  CalendarModule,
  BrowserAnimationsModule,
  ComponentsModule,
  DragulaModule
];

export const PROVIDERS = [
  Market,
  TranslationService,
  HttpService,
  LoadingService,
  ToastService,
  UtilsService,
  SpinnerDialog,
  ScreenOrientation,
  InAppBrowser,
  Dialogs,
  AppService,
  ModalService,
  AppLogout,
  AppAuthGuard,
  DragulaService,
  Diagnostic,
  SplashScreen,
  StatusBar,
  Clipboard,
  Device,
  AuthProvider,
  SessionService,
  StorageService,
  File,
  FileTransfer,
  AndroidPermissions,
  FileOpener,
  ReportService,
  TransformTimeSpent,
  TransformGradeColor,
  StudentModalService,
  StudentService,
  AppLauncher,
  PopoverService,
  VideoConferenceService,
  Media,
  HTTP,
  Network,
  LocalNotifications,
  DownloadService,
  LocalNotificationService,
  SyncService,
  Deeplinks,
  FileTransfer,
  PDFGenerator,
];
