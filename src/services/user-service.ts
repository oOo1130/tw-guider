import { LoggerService } from './logger-service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserDb } from '../models/db/user-db';
import { Platform } from '@ionic/angular';
import { DbProvider } from '../providers/db-provider';
import { DownloadService } from './download-service';
import { MiscService } from './misc-service';

@Injectable()
export class UserService {

    user = new Subject<any>();

    userDb: UserDb;

    constructor(private platform: Platform,
        private db: DbProvider,
        private downloadService: DownloadService,
        private loggerService: LoggerService,
        public miscService: MiscService
    ) {
    }

    async saveUser(data: UserDb) {
        await this.getUser();
        if (!this.userDb) {
            return false;
        }
        this.userDb.save();
        return true;
    }

    setUser(userDb: UserDb) {
        this.userDb = userDb;
    }

    getUser(): Promise<UserDb> {
        if (this.userDb) {
            return new Promise(resolve => {
                resolve(this.userDb);
            });
        }
        return new Promise(resolve => {
            new UserDb(this.platform, this.db, this.downloadService, this.loggerService, this.miscService).getCurrent().then((userDb) => {
                if (userDb) {
                    this.userDb = userDb;
                    resolve(this.userDb);
                }
                resolve(null);
            });
        });
    }
}

