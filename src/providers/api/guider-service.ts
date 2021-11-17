import { LoggerService } from './../../services/logger-service';
import { Injectable } from '@angular/core';

import { Platform, } from '@ionic/angular';
import { ApiService } from './base/api-service';
import { DbProvider } from '../db-provider';
import { AuthService } from '../../services/auth-service';
import { HttpClient } from '../../services/http-client';
import { GuiderModel } from '../../models/db/api/guider-model';
import { DownloadService } from '../../services/download-service';
import { AppSetting } from '../../services/app-setting';
import { MiscService } from 'src/services/misc-service';

@Injectable()
export class GuiderService extends ApiService {
    data: GuiderModel[] = [];
    loadUrl: string = '/guider';
    dbModelApi: GuiderModel = new GuiderModel(this.p, this.db, this.downloadService, this.loggerService, this.miscService);

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
        private p: Platform,
        private db: DbProvider,
        public authService: AuthService,
        public downloadService: DownloadService,
        public loggerService: LoggerService,
        public appSetting: AppSetting,
        private miscService: MiscService,
    ) {
        super(http, appSetting);
        console.debug('GuiderService', 'initialized');
    }

    /**
     * Create a new instance of the service model
     * @returns {GuiderModel}
     */
    public newModel() {
        return new GuiderModel(this.p, this.db, this.downloadService, this.loggerService, this.miscService);
    }

    public getById(id): Promise<any> {
        return new Promise(async resolve => {
            const user = await this.authService.getLastUser();
            if (!user) {
                resolve([]);
                return;
            }
            const whereCondition = [['id', id]];
            if (!user.isAuthority && user.client_id) {
                whereCondition.push(['client_id', user.client_id]);
            }
            this.dbModelApi.findFirst(whereCondition).then(result => {
                resolve(result);
            });
        });
    }
}
