import { LoggerService } from './../../services/logger-service';
import { DbBaseModel } from '../base/db-base-model';
import { Platform } from '@ionic/angular';
import { DbProvider } from '../../providers/db-provider';
import { UserSetting } from '../user-setting';
import { AuthDb } from './auth-db';
import { DownloadService } from '../../services/download-service';
import { MiscService } from 'src/services/misc-service';

export class AppSettingsDb extends DbBaseModel {
    /** @inheritDoc */
    TAG: string = 'AppSettingsDb';

    static COL_SETTINGS = 'settings';

    settings: any;

    /** @inheritDoc */
    TABLE_NAME: string = 'app_settings';
    /** @inheritDoc */
    TABLE: any = [
        [AppSettingsDb.COL_SETTINGS, 'TEXT', DbBaseModel.TYPE_OBJECT, 'settings'],
    ];

    /**
     * Constructor
     * @param {Platform} platform
     * @param {DbProvider} db
     * @param {Events} events
     * @param {DownloadService} downloadService
     */
    constructor(
        public platform: Platform,
        public db: DbProvider,
        public downloadService: DownloadService,
        public loggerService: LoggerService,
        public miscService: MiscService
    ) {
        super(platform, db, downloadService, loggerService, miscService);
    }
}
