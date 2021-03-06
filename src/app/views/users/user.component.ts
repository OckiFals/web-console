import { Component, OnInit } from '@angular/core';
import { BsModalService}  from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Subscription } from 'rxjs/Subscription';

import { Router } from '@angular/router';
import { UserService } from './user.service';
import { User } from './user.model';

import { ModalContentComponent, MODAL } from '../core/modal.component';

@Component({
    templateUrl: 'user.component.html'
})
export class UserComponent implements OnInit {
    public users: User[];
    public breadcrumbs: any[];
    public maxSize = 5;
    public itemsPerPage = 10;
    public totalItems: number;
    public adminCurrentPage = 1;
    public researcherCurrentPage = 1;
    public numPages = 0;
    public activeTab: string;
    public bsModalRef: BsModalRef;
    public modalSubscriptions: Subscription;

    constructor(private userService: UserService,
                private router: Router,
                private modalService: BsModalService) {
    }

    public ngOnInit() {
        this.breadcrumbs = [
            { label: "Home", url: "/" },
            { label: "Users", is_active: true }
        ];
        this.activeTab = 'admin';
        this.router.navigateByUrl('/users/list');
        this.getUsers(this.activeTab);
    }

    private getUsers(type = '', page: number = 1) {
        this.userService.getUsers(type, page)
            .subscribe(
                users => {
                    this.totalItems = users.count;
                    this.users = users.results as User[]
                },
                error => console.log(error)
            );
    }

    public selectTab(tab_type: string) {
        this.router.navigateByUrl(`/users/list?role=${tab_type}`);
        this.totalItems = 0;
        this.adminCurrentPage = 1;
        this.researcherCurrentPage = 1;
        this.activeTab = tab_type;
        this.getUsers(tab_type);
    }

    public openDeleteConfirmationModal(user: User) {
        this.bsModalRef = this.modalService.show(ModalContentComponent, {'class': 'modal-danger'});
        this.bsModalRef.content.id = user.id;
        this.bsModalRef.content.url = user.url;
        this.bsModalRef.content.title = 'User Delete Confirmation';
        this.bsModalRef.content.message = 'Are you sure to perform this action?';
        this.bsModalRef.content.action = MODAL.ACTION.DELETE;
        this.bsModalRef.content.delete_target = MODAL.DELETE_TARGET.USER;
        // event fired when modal dismissed -> reload sensor data
        this.modalSubscriptions = this.modalService.onHidden.subscribe((reason: string) => {
            if (!reason && 204 === this.bsModalRef.content.status) {
                this.getUsers(this.activeTab);
            }
            this.modalSubscriptions.unsubscribe();
        });
    }

    public pageChanged(event: any): void {
        this.router.navigateByUrl(`/users/list?role=${this.activeTab}&&page=${event.page}`);
        this.getUsers(this.activeTab, event.page);
    }
}
