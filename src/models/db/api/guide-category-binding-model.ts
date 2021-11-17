import { Platform, } from '@ionic/angular';
import { DbApiModel } from '../../base/db-api-model';
import { DbProvider } from '../../../providers/db-provider';
import { DbBaseModel } from '../../base/db-base-model';
import { DownloadService } from '../../../services/download-service';
import { LoggerService } from 'src/services/logger-service';
import { MiscService } from 'src/services/misc-service';

/**
 * API Db Model for 'Guider Model'.
 */
export class GuideCategoryBindingModel extends DbApiModel {
    /** @inheritDoc */
    TAG: string = 'GuideCategoryBindingModel';
    public apiPk = 'id';

    //members
    public guide_id: number;
    public guide_category_id: number;

    //db columns
    static COL_GUIDE_ID = 'guide_id';
    static COL_GUIDE_CATEGORY_ID = 'guide_category_id';

    /** @inheritDoc */
    TABLE_NAME: string = 'guide_category_binding';

    /** @inheritDoc */
    TABLE: any = [
        [GuideCategoryBindingModel.COL_GUIDE_ID, 'INT', DbBaseModel.TYPE_NUMBER],
        [GuideCategoryBindingModel.COL_GUIDE_CATEGORY_ID, 'INT', DbBaseModel.TYPE_NUMBER]
    ];

    /**
     * @inheritDoc
     */
    constructor(public platform: Platform, public db: DbProvider,
        public downloadService: DownloadService,
        public loggerService: LoggerService,
        public miscService: MiscService,) {
        super(platform, db, downloadService, loggerService, miscService);
    }
}
