import { LoggerService } from '../../../services/logger-service';
import { Platform } from '@ionic/angular';
import { DbApiModel } from '../../base/db-api-model';
import { DbProvider } from '../../../providers/db-provider';
import { DbBaseModel } from '../../base/db-base-model';
import { DownloadService } from '../../../services/download-service';
import { MiscService } from 'src/services/misc-service';

/**
 * API Db Model for 'Sync Index Model'.
 */
export class SyncIndexModel extends DbApiModel {
    /** @inheritDoc */
    TAG: string = 'SyncIndexModel';
    public apiPk = 'id';

    // members
    public model: string; //
    public model_id: number; //
    public user_id: number = null; //

    // db columns
    static COL_MODEL = 'model';
    static COL_MODEL_ID = 'model_id';
    static COL_USER_ID = 'user_id';

    /** @inheritDoc */
    TABLE_NAME: string = 'sync_index';

    /** @inheritDoc */
    TABLE: any = [
        [SyncIndexModel.COL_MODEL, 'VARCHAR(255)', DbBaseModel.TYPE_STRING, 'model'],
        [SyncIndexModel.COL_MODEL_ID, 'INT(11)', DbBaseModel.TYPE_NUMBER, 'model_id'],
        [SyncIndexModel.COL_USER_ID, 'INT(11)', DbBaseModel.TYPE_NUMBER, 'user_id'],
    ];

    public migrations = ['AddModelColumnsToSyncIndexTableMigration'];

    /**
     * @inheritDoc
     */
    constructor(public platform: Platform, public db: DbProvider,
        public downloadService: DownloadService,
        public loggerService: LoggerService,
        public miscService: MiscService,
    ) {
        super(platform, db, downloadService, loggerService, miscService);
    }
}
