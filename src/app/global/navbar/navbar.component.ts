import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  isAuthSub: Subscription;
  displayName: string = null;
  userDataSub: Subscription;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {
    this.isAuthSub = this.authService
      .getIsAuthObservable()
      .subscribe((data) => {
        this.isAuthenticated = data;
        console.log('data', data);
      });
    this.authService.initializeIsAuth();
    //console.log(this.isAuthenticated);

    // using observer pattern for getting name here
    // because if name gets updated in profile,
    // it will update the displayName too.
    this.userDataSub = this.userDataService
      .getUserDataObservable()
      .subscribe((data) => {
        if (data != null && data.name != null) {
          this.displayName = data.name;
        }
      });
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.isAuthSub.unsubscribe();
    this.userDataSub.unsubscribe();
  }

  onLogOut() {
    this.userDataService.clearUserDataLocally();
    this.authService.logOut();
  }

  visitProfile() {
    let _name: string;
    _name = this.userDataService.name.split(' ').join('-');
    this.router.navigate(['profile', _name]);
  }
}
