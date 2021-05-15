import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthErrorHandlerService } from 'src/app/services/auth-error-handler.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  logInForm: FormGroup;

  email: string;
  password: string;

  errorObj: any;
  isLoggingIn: boolean = false;
  isBtnClicked: boolean = false;
  isHideResponseErrors: boolean = true;
  errorSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private authErrorHandler: AuthErrorHandlerService,
    private userDataService: UserDataService
  ) {
    // creating a subscription to listen to the subject in authService
    // so that we get updated whenever the errorObj changes
    this.errorSub = authErrorHandler.getErrorObservable().subscribe((data) => {
      this.errorObj = data;
    });

    // the errorObj needs to be initialized here
    // calls the next method on subject in authService
    // and we get the initial errorObj data here
    this.authErrorHandler.initializeErrorObj();
  }

  ngOnInit(): void {
    // creating reactive signup form
    this.logInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe();
  }

  /** method binded to form ngSubmit event */
  onLogIn() {
    // handle the case when disabled attribute for submit button is deleted
    // from html
    if(this.logInForm.invalid) {
      return;
    }

    this.isBtnClicked = true;
    this.isLoggingIn = true;

    this.email = this.logInForm.get('email').value;
    this.password = this.logInForm.get('password').value;

    this.authService
      .signIn(this.email, this.password)
      .then((result) => {
        this.isLoggingIn = false;
        this.isHideResponseErrors = true;
        setTimeout(() => {
          this.userDataService.getUserDataFromFirebase(true);
          this.router.navigate(['']);
        }, 3000);
        // ?
      })
      .catch((error) => {
        this.isBtnClicked = false;
        this.isHideResponseErrors = false;
        this.isLoggingIn = false;
        this.authErrorHandler.handleAuthError(error, 'logIn');
      });
  }

  /** on clicking log in with google */
  onLogInWithGoogle() {
    this.authService
      .authenticateWithGoogle()
      .then((result) => {
        // save user data for a first time user only
        console.log(result);
        if (result.additionalUserInfo.isNewUser == true) {
          this.userDataService.setName = result.user.displayName;
          this.userDataService.setEmail = result.user.email;
          this.userDataService.setUid = result.user.uid;
          this.userDataService.createNewUser();
          this.router.navigate(['']);
        } else if (result.additionalUserInfo.isNewUser == false) {
          setTimeout(() => {
            this.userDataService.getUserDataFromFirebase(true);
            this.router.navigate(['']);
          }, 3000);
          // ?
        }
      })
      .catch((error) => {
        console.log(error);
        this.authErrorHandler.handleAuthError(error, 'logIn');
      });
  }

  /** hides error messages on input click */
  hideResponseErrors() {
    if (
      this.authErrorHandler.foundLogInError &&
      this.isHideResponseErrors === false
    ) {
      this.isHideResponseErrors = !this.isHideResponseErrors;
      this.authErrorHandler.clearLogInError();
    }
  }
}
