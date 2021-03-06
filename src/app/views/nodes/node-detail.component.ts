import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { ModalContentComponent, MODAL } from '../core/modal.component';
import 'rxjs/add/operator/switchMap';
import { Subscription } from 'rxjs/Subscription';

import { NodeService } from './node.service';
import { SensorService } from './sensor.service';
import { Node } from './node.model';
import { Sensor } from './sensor.model';
import { CredentialsService } from '../core/authenticate/credentials.service';

import { ModalSensorFormComponent } from '../shared/modalsensorform.component';

@Component({
    templateUrl: 'node-detail.component.html'
})
export class NodeDetailComponent implements OnInit {
    public node: Node;
    public sensors: Sensor[];
    public is_mine: boolean; // 'edit' button visibility
    public breadcrumbs: any[];
    // reset subsperdayremain flash info
    public flash_message: string;
    // sensor list pagination
    public itemsPerPage = 10;
    public currentPage = 1;
    public totalItems: number;
    public bsModalRef: BsModalRef;
    public modalSubscriptions: Subscription;

    constructor(private route: ActivatedRoute,
                private nodeService: NodeService,
                private sensorService: SensorService,
                private credentialsService: CredentialsService,
                private router: Router,
                private modalService: BsModalService) {
    }

    ngOnInit() {
        this.getNode();
        this.getSensors();
    }

    private getNode() {
        this.route.params
            .switchMap((params: Params) => this.nodeService.getNode(params['id']))
            .subscribe(
                node => this.setUpNode(node),
                error => console.log(error)
            );
    }

    private getSensors(page: number = 1) {
        this.route.params
            .switchMap((params: Params) => this.sensorService.getSensors(params['id'], page))
            .subscribe(
                res => {
                    this.totalItems = res.count;
                    this.sensors = res.results as Sensor[];
                },
                error => console.log(error)
            );
    }

    private setUpNode(node: Node): void {
        this.breadcrumbs = [
            { label: "Home", url: "/" },
            { label: "Nodes", url: "/nodes/list" },
            { label: node.label, is_active: true }
        ];
        this.node = node;
        // show 'edit' button only when node is owned by this auth user
        this.is_mine = (node.user === this.credentialsService.getUser().username);
    }

    public openResetConfirmationModal() {
        this.bsModalRef = this.modalService.show(ModalContentComponent, {'class': 'modal-warning'});
        this.bsModalRef.content.id = this.node.id;
        this.bsModalRef.content.title = 'Reset Confirmation';
        this.bsModalRef.content.message = 'Are you sure to reset publish per day remaining?';
        this.bsModalRef.content.action = MODAL.ACTION.RESET;
        this.flash_message = '';
        // event fired when modal dismissed -> reload sensor data
        this.modalSubscriptions = this.modalService.onHidden.subscribe((reason: string) => {
            if (!reason && 200 === this.bsModalRef.content.status) {
                this.getNode();
                this.flash_message = this.node.label;
            }
            this.modalSubscriptions.unsubscribe();
        });
    }

    public openDeleteConfirmationModal(sensor = null) {
        this.bsModalRef = this.modalService.show(ModalContentComponent, {'class': 'modal-danger'});
        this.bsModalRef.content.title = 'Delete Confirmation';
        this.bsModalRef.content.message = 'Are you sure to perform this action?';
        this.bsModalRef.content.action = MODAL.ACTION.DELETE;
        if (null != sensor) {
            this.bsModalRef.content.id = sensor.id;
            this.bsModalRef.content.url = sensor.url;
            this.bsModalRef.content.delete_target = MODAL.DELETE_TARGET.SENSOR;
            // event fired when modal dismissed -> reload sensor data
            this.modalSubscriptions = this.modalService.onHidden.subscribe((reason: string) => {
                if (!reason && 204 === this.bsModalRef.content.status) {
                    this.router.navigateByUrl(`/nodes/view/${this.node.id}?sensor-page=1`);
                    this.getSensors();
                }
                this.modalSubscriptions.unsubscribe();
            });
        } else {
            this.bsModalRef.content.id = this.node.id;
            this.bsModalRef.content.url = this.node.url;
            this.bsModalRef.content.delete_target = MODAL.DELETE_TARGET.NODE;
            // event fired when modal dismissed -> navigate to nodes/list
            this.modalSubscriptions = this.modalService.onHidden.subscribe((reason: string) => {
                if (!reason && 204 === this.bsModalRef.content.status) {
                    this.router.navigate(['/nodes/list']);
                }
                this.modalSubscriptions.unsubscribe();
            });
        }
    }

    public openSensorFormModal(sensor = null) {
        this.bsModalRef = this.modalService.show(ModalSensorFormComponent, {'class': 'modal-primary'});
        this.bsModalRef.content.title = (sensor ? 'Edit' : 'New') + ' Sensor Form';
        this.bsModalRef.content.node = this.node;
        this.bsModalRef.content.is_node = true;
        const _sensor = new Sensor();
        // is modal form action is update
        if (sensor) {
            /*
             * create new sensor instance from existing obj,
             * avoid referring the same object in sensors list table
             */
            _sensor.id = sensor.id;
            _sensor.url = sensor.url;
            _sensor.label = sensor.label;
            _sensor.nodeurl = sensor.nodeurl;
            _sensor.subscriptions_list = sensor.subscriptions_list;
        }
        this.bsModalRef.content.sensor = _sensor;
        // event fired when modal dismissed -> reload sensor data
        this.modalSubscriptions = this.modalService.onHidden.subscribe((reason: string) => {
            if (!reason && 201 === this.bsModalRef.content.status) {
                this.getSensors();
            }
            this.modalSubscriptions.unsubscribe();
        });
    }

    public pageChanged(event: any): void {
        this.router.navigateByUrl(`/nodes/view/${this.node.id}?sensor-page=${event.page}`);
        this.getSensors(event.page);
    }
}