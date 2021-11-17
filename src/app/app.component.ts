import { Storage } from '@ionic/storage';
import { MiscService } from './../services/misc-service';

import { LoggerService } from 'src/services/logger-service';
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy, QueryList, ViewChildren, Renderer2 } from '@angular/core';
import { AlertController, IonRouterOutlet, NavController, Platform, ModalController } from '@ionic/angular';
import { ApiSync } from '../providers/api-sync';
import { MigrationProvider } from '../providers/migration-provider';
import { AuthService } from '../services/auth-service';
import { Network } from '@ionic-native/network/ngx';
import { SyncService } from '../services/sync-service';

import { UserDb } from '../models/db/user-db';
import { TranslateConfigService } from '../services/translate-config.service';
import { AppSetting } from '../services/app-setting';
import { UserService } from '../services/user-service';

import { Router } from '@angular/router';
import { Location } from '@angular/common';


import { Plugins } from '@capacitor/core';
import { AuthDb } from 'src/models/db/auth-db';
import { interval, Subscription } from 'rxjs';

const { SplashScreen, App } = Plugins;

export enum ConnectionStatusEnum {
  Online,
  Offline,
  BeforeSet
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [];
  public versionNumber = '0.0.1';
  public showPageView = false;

  eventSubscription: Subscription;

  constructor(
    private platform: Platform,
    private apiSync: ApiSync,
    private authService: AuthService,
    private network: Network,
    private syncService: SyncService,
    private translateConfigService: TranslateConfigService,
    private changeDetectorRef: ChangeDetectorRef,
    private appSetting: AppSetting,
    private userService: UserService,
    public navCtrl: NavController,
    private ngZone: NgZone,
    private migrationProvider: MigrationProvider,
    private router: Router,
    private alertController: AlertController,
    private location: Location,
    private loggerService: LoggerService,
    private miscService: MiscService,
    private modalCtrl: ModalController,
    private storage: Storage
  ) {
    (async () => {
      await this.platform.ready();
      await this.initializeApp();
    })();
  }

  public userDb: UserDb;

  b: any;

  previousStatus = ConnectionStatusEnum.BeforeSet;
  periodicSync: any;
  checkAvailableSyncChanges: any;

  // hardware back button
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  backButtonEvent() {
    this.platform.backButton.subscribe(async (processNextHandler) => {
      const guideInfoModalOpen = await this.storage.get('guideInfoModalOpen');
      const pdfViewerComponentOpen = await this.storage.get('pdfViewerComponentOpen');
      const VideoModalComponentOpen = await this.storage.get('VideoModalComponentOpen');
      const Viewer3dModalComponentOpen = await this.storage.get('Viewer3dModalComponentOpen');
      const GuideAssetTextModalComponentOpen = await this.storage.get('GuideAssetTextModalComponentOpen');
      const CKEditorComponentOpen = await this.storage.get('CKEditorComponentOpen');
      const SyncModalComponentOpen = await this.storage.get('SyncModalComponentOpen');
      const ImageEditorComponentOpen = await this.storage.get('ImageEditorComponentOpen');

      // console.log("modal dismiss", guideInfoModalOpen
      //   || VideoModalComponentOpen
      //   || pdfViewerComponentOpen
      //   || Viewer3dModalComponentOpen
      //   || GuideAssetTextModalComponentOpen
      //   || CKEditorComponentOpen
      //   || SyncModalComponentOpen
      //   || ImageEditorComponentOpen
      // )
      if (
        guideInfoModalOpen
        || VideoModalComponentOpen
        || pdfViewerComponentOpen
        || Viewer3dModalComponentOpen
        || GuideAssetTextModalComponentOpen
        || CKEditorComponentOpen
        || SyncModalComponentOpen
        || ImageEditorComponentOpen
      ) {
        this.storage.set('guideInfoModalOpen', false);
        this.storage.set('pdfViewerComponentOpen', false);
        this.storage.set('Viewer3dModalComponentOpen', false);
        this.storage.set('GuideAssetTextModalComponentOpen', false);
        this.storage.set('VideoModalComponentOpen', false);
        this.storage.set('CKEditorComponentOpen', false);
        this.storage.set('SyncModalComponentOpen', false);
        this.storage.set('ImageEditorComponentOpen', false);
        this.modalCtrl.dismiss();
      }
      else {
        this.routerOutlets.forEach(async (r) => {
          if (!r.canGoBack()) {
            this.presentAlertConfirm();
          }
          else {
            this.location.back()
          }
        })
      }
    });

    this.platform.backButton.subscribeWithPriority(1, async (processNextHandler) => {
      processNextHandler();
    });

    this.platform.backButton.subscribeWithPriority(0, async (processNextHandler) => {
      processNextHandler();
    });

    this.platform.backButton.subscribeWithPriority(100, async (processNextHandler) => {

    });

    this.platform.backButton.subscribeWithPriority(99, async (processNextHandler) => {

    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: await this.translateConfigService.translate('exitApp'),
      buttons: [{
        text: await this.translateConfigService.translate('cancel'),
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => { }
      }, {
        text: await this.translateConfigService.translate('close'),
        handler: () => {
          App.exitApp();
        }
      }]
    });

    await alert.present();
  }

  //// TODO in future save device info via API in this place
  async initializeApp() {
    this.platform.ready().then(async () => {

      setTimeout(() => {
        SplashScreen.hide({
          fadeOutDuration: 1000
        });
      }, 2000)

      await this.migrationProvider.init();
      this.migrationProvider.checkAuthMigration();
      
      this.translateConfigService.setLanguage(this.translateConfigService.getDeviceLanguage());

      const result = await this.login();

      let currentLanguage = '';

      if (result) {
        try {
          await this.initUserDB();
          if (!this.userService.userDb) {
            return;
          }
          const user = await this.userService.getUser();
          if (user) {
            await this.ngZone.run(() => {
              this.navCtrl.navigateRoot('/guide-categories').then(() => {
                this.showPageView = true;
              });
            });
          } else {
            if (this.appSetting.isWasQrCodeSetup) {
              this.ngZone.run(() => {
                this.navCtrl.navigateRoot('/login').then(() => {
                  this.showPageView = true;
                });
              });
            }
          }
          if (this.userService.userDb.userSetting.language) {
            // console.log(this.userService.userDb.userSetting.language, "this.userService.userDb.userSetting.language") // always device lang
            // first time opening app?
            // const storedLang = await this.storage.get("storedLang");
            // console.log(storedLang, "storedLang")
            // if (storedLang != null) {
            //   currentLanguage = storedLang;
            //   if (this.userService.userDb.userSetting.language != storedLang) {
            //     this.userService.userDb.userSetting.language = storedLang;
            //     this.userService.userDb.save();
            //   }
            // }
            // else {
            //   currentLanguage = this.userService.userDb.userSetting.language;
            //   this.storage.set("storedLang", currentLanguage)
            // }
            currentLanguage = this.userService.userDb.userSetting.language;
          }
          this.syncService.syncMode.next(this.userService.userDb.userSetting.syncMode);
          if (this.userService.userDb.userSetting.syncLastElementNumber > 0 &&
            (this.userService.userDb.userSetting.syncStatus === 'resume' ||
              this.userService.userDb.userSetting.syncStatus === 'progress')
          ) {
            this.userService.userDb.userSetting.syncStatus = 'pause';
            this.userService.userDb.save().then(() => {
              this.apiSync.sendSyncProgress();
            });
          }
          this.apiSync.syncProgressStatus.next(this.userService.userDb.userSetting.syncStatus);
        } catch (e) {
        }
      } else {
        this.showPageView = true;
      }
      this.translateConfigService.setLanguage(currentLanguage);
      if (!this.appSetting.isMigratedDatabase()) {
        this.appSetting.showIsNotMigratedDbPopup();
      }

      this.setPages();
      this.initNetwork();
      this.registerEvents();
      this.backButtonEvent();
    })

    this.loggerService.createLogFile();
  }

  protected initUserDB() {
    return this.userService.getUser().then(result => {
      this.userService.userDb = result;
    });
  }

  protected registerEvents() {
    // this.events.subscribe('user:login', (userId) => {
    //   this.setPages();
    //   this.baseProjectSetup();
    //   this.detectChanges();
    // });
    // this.events.subscribe('qr-code:setup', () => {
    //   this.setPages();
    //   this.baseProjectSetup();
    //   this.detectChanges();
    // });
    // this.events.subscribe('user:logout', () => {
    //   this.setPages();
    // });
  }

  protected initNetwork() {
    if (this.network.type === 'none') {
      this.previousStatus = ConnectionStatusEnum.Offline;
    } else {
      this.previousStatus = ConnectionStatusEnum.Online;
    }

    this.initializeNetworkEvents();
  }

  protected initializeNetworkEvents(): void {
    this.network.onDisconnect().subscribe(() => {
      if (this.previousStatus === ConnectionStatusEnum.Online) {
        this.miscService.events.next({ TAG: 'network:offline' });
        // this.events.publish('network:offline', true);
        this.previousStatus = ConnectionStatusEnum.Offline;
      }
    });
    this.network.onConnect().subscribe(() => {
      if (this.previousStatus === ConnectionStatusEnum.Offline) {
        // this.events.publish('network:online', true);
        this.miscService.events.next({ TAG: 'network:online' });
        this.previousStatus = ConnectionStatusEnum.Online;
        if (this.authService.isLoggedin) {
          // this.apiSync.pushOneAtTime();
          if (this.syncService.syncMode.getValue() === 1) {
            let syncProcessName = this.apiSync.syncProgressStatus.getValue();
            if (syncProcessName === 'pause') {
              syncProcessName = 'resume';
            }
            this.apiSync.makeSyncProcess(syncProcessName);
          }
        }
      }
    });
  }

  protected async setPages() {
    this.appPages = this.getTopMenuPages();
    this.appPages.push(
      { title: this.translateConfigService.translateWord('about.header'), url: '/about', icon: 'information-circle' },
      { title: this.translateConfigService.translateWord('log.header'), url: '/logs', icon: 'hourglass' },
    );
  }

  protected getTopMenuPages() {
    const appPages = [];
    if (!this.appSetting.isWasQrCodeSetup || !this.authService.isLoggedin) {
      appPages.push(
        { title: this.translateConfigService.translateWord('start.header'), url: '/start', icon: 'home' }
      );
    }
    if (!this.appSetting.isWasQrCodeSetup) {
      return appPages;
    }
    if (!this.authService.isLoggedin) {
      appPages.push({ title: this.translateConfigService.translateWord('login.Login'), url: '/login', icon: 'person' });
      return appPages;
    }
    if (this.authService.isHaveUserRole('GuiderViewer') || this.authService.auth.isAuthority) {
      appPages.push({ title: this.translateConfigService.translateWord('guides.header'), url: '/guide-categories', icon: 'move' });
    }
    if (this.authService.isHaveUserRole('FeedbackViewer') || this.authService.auth.isAuthority) {
      appPages.push({ title: this.translateConfigService.translateWord('feedback.header'), url: '/feedback', icon: 'chatbox' });
    }
    if (this.authService.isHaveUserRole('ProtocolViewer') || this.authService.auth.isAuthority) {
      appPages.push({ title: this.translateConfigService.translateWord('protocol.Protocols'), url: '/protocol', icon: 'list' });
    }
    if ((this.authService.isHaveUserRole('GuiderAdmin') && this.authService.isHaveUserRole('Betatest')) || this.authService.auth.isAuthority) {
      appPages.push({ title: this.translateConfigService.translateWord('guider.header'), url: '/guidecapture', icon: 'camera' });
    }
    appPages.push({ title: this.translateConfigService.translateWord('profile.Profile'), url: '/profile', icon: 'person' });
    return appPages;
  }

  private login(): Promise<any> {
    return new Promise((resolve) => {
      this.authService.getLastUser().then((res) => {
        resolve(res);
        let lastUser: AuthDb = null;
        console.log("lastUser", res);
        if (res) {
          lastUser = res;
        }
      });
    });
  }

  protected baseProjectSetup() {
    this.initUserDB().then(() => {
      if (!this.userService.userDb) {
        return;
      }
      if (this.userService.userDb.userSetting.language &&
        this.translateConfigService.isLanguageAvailable(this.userService.userDb.userSetting.language)
      ) {
        this.translateConfigService.setLanguage(this.userService.userDb.userSetting.language);
      }
      if (this.userService.userDb.userSetting.syncLastElementNumber > 0 &&
        (this.userService.userDb.userSetting.syncStatus === 'resume' || this.userService.userDb.userSetting.syncStatus === 'progress')
      ) {
        this.userService.userDb.userSetting.syncStatus = 'pause';
        this.userService.userDb.save();
      }
      this.syncService.syncMode.next(this.userService.userDb.userSetting.syncMode);
      this.apiSync.syncProgressStatus.next(this.userService.userDb.userSetting.syncStatus);
      this.apiSync.syncedItemsCount.next(this.userService.userDb.userSetting.syncLastElementNumber);
      this.apiSync.syncAllItemsCount.next(this.userService.userDb.userSetting.syncAllItemsCount);
      this.apiSync.syncedItemsPercent.next(this.userService.userDb.userSetting.syncPercent);
      this.apiSync.isAvailableForSyncData.next(this.userService.userDb.userSetting.isSyncAvailableData);
      this.apiSync.isAvailableForPushData.next(this.userService.userDb.userSetting.isPushAvailableData);
      this.apiSync.checkAvailableChanges().then(() => {
        this.checkAvailableSyncChanges = interval(30000)
          .subscribe(() => {
            this.apiSync.checkAvailableChanges();
          });
      });
      this.detectChanges();
    });
  }

  protected logoutAction() {
    this.userService.userDb = null;
    this.translateConfigService.setLanguage();
    if (this.periodicSync) {
      this.periodicSync.unsubscribe();
      this.periodicSync = null;
    }
    if (this.checkAvailableSyncChanges) {
      this.checkAvailableSyncChanges.unsubscribe();
      this.periodicSync = null;
    }
  }

  protected changeSyncModeAction(syncMode) {
    if (syncMode !== 2 && this.periodicSync) {
      this.periodicSync.unsubscribe();
      this.periodicSync = null;
    }
    if (syncMode === 2) {
      this.periodicSync = interval(15000)
        .subscribe(() => {
          let syncProcessStatus = this.apiSync.syncProgressStatus.getValue();
          if (['pause'].includes(syncProcessStatus)) {
            syncProcessStatus = 'resume';
          } else {
            syncProcessStatus = 'progress';
          }
          this.apiSync.makeSyncProcess(syncProcessStatus);
        });
    }
  }

  detectChanges() {
    if (!this.changeDetectorRef['destroyed']) {
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.appSetting.isWasQrCodeSetupSubscribtion.subscribe(isWasQrCodeSetup => {
      if (isWasQrCodeSetup) {
        this.setPages();
      }
    });
    this.baseProjectSetup();

    this.eventSubscription = this.miscService.events.subscribe((event) => {
      switch (event.TAG) {
        case 'user:logout':
          this.logoutAction();
          this.setPages();
          break;
        case 'setIsPushAvailableData':
          this.apiSync.setIsPushAvailableData(true);
          break;
        case 'qr-code:setup':
          this.setPages();
          this.baseProjectSetup();
          this.detectChanges();
          break;
        case 'user:login':
          this.setPages();
          this.baseProjectSetup();
          this.detectChanges();
          break;
        default:
      }
    })

    // this.events.subscribe('user:logout', () => {
    //   this.logoutAction();
    // });
    // this.events.subscribe('setIsPushAvailableData', () => {
    //   this.apiSync.setIsPushAvailableData(true);
    // });
    this.syncService.syncMode.subscribe((syncMode) => {
      this.changeSyncModeAction(syncMode);
    });
    this.translateConfigService.onLangChange().subscribe(() => {
      this.setPages();
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
}
