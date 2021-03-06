import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth-service';
import { DownloadService } from '../../services/download-service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { VideoService } from '../../services/video-service';
import { ProtocolModel } from '../../models/db/api/protocol-model';
import { ProtocolService } from '../../providers/api/protocol-service';
import { WorkflowStepService } from '../../providers/api/workflow-step-service';
import { ProtocolDefaultService } from '../../providers/api/protocol-default-service';
import { WorkflowService } from '../../providers/api/workflow-service';
import { ProtocolTemplateService } from '../../providers/api/protocol-template-service';
import { MiscService } from 'src/services/misc-service';
import { Subscription } from 'rxjs';
import { SyncIndexService } from 'src/providers/api/sync-index-service';

@Component({
    selector: 'protocol-page',
    templateUrl: 'protocol.page.html',
    styleUrls: ['protocol.page.scss']
})
export class ProtocolPage implements OnInit, OnDestroy {
    public backDefaultHref: string;
    public protocolList: ProtocolModel[] = [];
    public isComponentLikeModal = false;
    public templateId: number;
    public params;
    private reference_id: number;
    private reference_model_alias: any;
    private reference_model: string;
    private clientId: number;
    public userCanCreateProtocol: boolean = false;

    eventSubscription: Subscription;

    constructor(private protocolService: ProtocolService,
        public authService: AuthService,
        public changeDetectorRef: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private navCtrl: NavController,
        private router: Router,
        private workflowService: WorkflowService,
        private workflowStepService: WorkflowStepService,
        private protocolDefaultService: ProtocolDefaultService,
        private protocolTemplateService: ProtocolTemplateService,
        private ngZone: NgZone,
        private miscService: MiscService,
        private syncIndexService: SyncIndexService,

    ) {
        this.authService.checkAccess('protocol');
    }

    public async setModels() {
        this.protocolList = await this.protocolService.getAllProtocols(this.templateId, this.reference_model, this.reference_id);
        const syncedList = await this.syncIndexService.getSyncIndexModel(this.protocolList, this.protocolList[0].TABLE_NAME);
        this.protocolList = syncedList;
        this.detectChanges();
    }

    openAddEditPage(protocolId?: number) {
        const protocolNavigationExtras: NavigationExtras = {
            queryParams: {
                protocolId,
                templateId: this.templateId,
                clientId: this.clientId,
                referenceModelAlias: this.reference_model_alias,
                referenceId: this.reference_id
            }
        };
        this.router.navigate(['/protocol/save/' + protocolId], protocolNavigationExtras);
    }

    public async editProtocol(protocol?: ProtocolModel) {
        const protocolFormService = this.protocolService.getProtocolFormService(protocol.protocol_form_table);
        if (!protocolFormService) {
            return;
        }
        const protocolFormModel = await protocolFormService['dbModelApi'].findFirst(
            [protocolFormService['dbModelApi'].COL_ID, protocol.local_protocol_form_number]
        );
        if (!protocolFormModel || !protocolFormModel[0]) {
            return;
        }
        protocolFormService.openEditPage(protocolFormModel[0], protocol);
    }

    public async createProtocol() {
        const protocolFormService = this.protocolService.getProtocolFormService('protocol_default');
        if (!protocolFormService) {
            return;
        }
        protocolFormService.openCreatePage(this.templateId, this.clientId, this.reference_model, this.reference_id);
    }

    async setUserCanCreateProtocol() {
        this.userCanCreateProtocol = await this.protocolTemplateService.canCreateProtocol(this.templateId);
    }

    dismiss() {
        this.ngZone.run(() => {
            this.navCtrl.navigateRoot('/guide-categories');
        });
    }

    detectChanges() {
        if (!this.changeDetectorRef['destroyed']) {
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(params => {
            const protocolData = params;
            this.templateId = protocolData.templateId;
            this.reference_id = +protocolData.referenceId;
            this.clientId = +protocolData.clientId;
            this.reference_model_alias = protocolData.referenceModelAlias;
            this.reference_model = this.protocolService.dbModelApi.getReferenceModelByAlias(this.reference_model_alias);
            if (this.reference_model) {
                this.isComponentLikeModal = true;
            }
            this.backDefaultHref = protocolData.backUrl;
            this.setModels();
        });
        // this.events.subscribe(this.protocolTemplateService.dbModelApi.TAG + ':create', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolTemplateService.dbModelApi.TAG + ':update', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolTemplateService.dbModelApi.TAG + ':delete', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolService.dbModelApi.TAG + ':create', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolService.dbModelApi.TAG + ':update', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolService.dbModelApi.TAG + ':delete', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolDefaultService.dbModelApi.TAG + ':create', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolDefaultService.dbModelApi.TAG + ':update', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.protocolDefaultService.dbModelApi.TAG + ':delete', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowService.dbModelApi.TAG + ':create', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowService.dbModelApi.TAG + ':update', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowService.dbModelApi.TAG + ':delete', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setUserCanCreateProtocol();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowStepService.dbModelApi.TAG + ':create', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowStepService.dbModelApi.TAG + ':update', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });
        // this.events.subscribe(this.workflowStepService.dbModelApi.TAG + ':delete', (model) => {
        //     this.workflowStepService.unsetWorkflowStepsListCache();
        //     this.protocolService.unsetProtocolDataList();
        //     this.setModels();
        //     this.detectChanges();
        // });

        this.eventSubscription = this.miscService.events.subscribe(async (event) => {
            switch (event.TAG) {
                case this.protocolTemplateService.dbModelApi.TAG + ':create':
                case this.protocolTemplateService.dbModelApi.TAG + ':update':
                case this.protocolTemplateService.dbModelApi.TAG + ':delete':
                case this.protocolService.dbModelApi.TAG + ':create':
                case this.protocolService.dbModelApi.TAG + ':update':
                case this.protocolService.dbModelApi.TAG + ':delete':

                case this.protocolDefaultService.dbModelApi.TAG + ':create':
                case this.protocolDefaultService.dbModelApi.TAG + ':update':
                case this.protocolDefaultService.dbModelApi.TAG + ':delete':

                case this.workflowService.dbModelApi.TAG + ':create':
                case this.workflowService.dbModelApi.TAG + ':delete':
                case this.workflowService.dbModelApi.TAG + ':delete':

                case this.workflowStepService.dbModelApi.TAG + ':create':
                case this.workflowStepService.dbModelApi.TAG + ':update':
                case this.workflowStepService.dbModelApi.TAG + ':delete':

                    this.workflowStepService.unsetWorkflowStepsListCache();
                    this.protocolService.unsetProtocolDataList();
                    this.setModels();
                    this.detectChanges();
                    break;
                default:
            }
        });

        this.setUserCanCreateProtocol();
        this.detectChanges();
    }


    ngOnDestroy(): void {
        this.eventSubscription.unsubscribe();
    }
}
