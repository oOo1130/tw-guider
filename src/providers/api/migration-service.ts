import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';
import { ApiService } from './base/api-service';
import { DbProvider } from '../db-provider';
import { AuthService } from '../../services/auth-service';
import { HttpClient } from '../../services/http-client';
import { DownloadService } from '../../services/download-service';
import { MigrationModel } from '../../models/db/migration-model';
import { AppSetting } from '../../services/app-setting';
import { LoggerService } from 'src/services/logger-service';
import { MiscService } from 'src/services/misc-service';

@Injectable()
export class MigrationService extends ApiService {
    data: MigrationModel[] = [];
    loadUrl: string = null;
    dbModelApi: MigrationModel = new MigrationModel(this.p, this.db, this.downloadService, this.loggerService, this.miscService);

    /**
     * Constructor
     * @param http
     * @param p
     * @param db
     * @param authService
     * @param events
     * @param downloadService
     * @param appSetting
     */
    constructor(http: HttpClient,
        private p: Platform, private db: DbProvider,
        public authService: AuthService,

        public downloadService: DownloadService,
        public loggerService: LoggerService,

        public appSetting: AppSetting,
        public miscService: MiscService,

    ) {
        super(http, appSetting);
    }

    /**
     * Create a new instance of the service model
     * @returns {MigrationkModel}
     */
    public newModel() {
        return new MigrationModel(this.p, this.db, this.downloadService, this.loggerService, this.miscService);
    }
}
