import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

@Component({
    templateUrl: 'exception.component.html'
})
export class ForbiddenComponent {
    status = '403';
    info = 'Oops! You\'ve caught by the police.';
    detail = 'You do not have permission to perform this action.';

    constructor(private location: Location,
                private router: Router) {
    }

    back() {
        this.location.back();
    }

}

@Component({
    templateUrl: 'exception.component.html'
})
export class PageNotFoundComponent {
    status = '404';
    info = 'Oops! You\'re lost.';
    detail = 'The page you are looking for was not found.';

    constructor(private location: Location) {
    }

    back() {
        this.location.back();
    }

}

@Component({
    templateUrl: 'exception.component.html'
})
export class InternalServerErrorComponent {
    status = '500';
    info = 'Houston, we have a problem!';
    detail = 'The page you are looking for is temporarily unavailable.';

    constructor(private location: Location) {
    }

    back() {
        this.location.back();
    }

}
