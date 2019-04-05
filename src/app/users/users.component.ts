import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService, User } from '@app/api';
import { MatSnackBar, MatDialog } from '@angular/material';

import { Logger, I18nService, AuthenticationService } from '@app/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

const log = new Logger('Login');

/**
 * YesCancel dialog component for popup
 */
@Component({
  selector: 'app-users-dialog-component',
  templateUrl: 'users-dialog.html'
})
export class UsersDialogComponent {}

/**
 * Users component to display user lists and app settings
 */
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  /**
   * List of users
   */
  users: User[];
  /**
   * FormGroup to update a User object
   * This is singleton among the update HTML forms, but only one of them is visible at any given time
   */
  userUpdateForm: FormGroup;
  /**
   * FormGroup to create a User object
   */
  userCreateForm: FormGroup;

  /**
   * Whether the signed in user is the admin user
   */
  isSuperuser = false;

  /**
   * Error in the update user request
   */
  updateError: string;
  /**
   * Error in the delete user request
   */
  deleteError: string;
  /**
   * Error in the list users request
   */
  userListError: string;
  /**
   * Error in the create user request
   */
  createError: string;

  /**
   * The component is loading
   */
  isLoading = false;
  /**
   * Update user request is pending
   */
  updateLoading = false;
  /**
   * Delete user request is pending
   */
  deleteLoading = false;
  /**
   * Create user request is pending
   */
  createLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.createForms();
  }

  ngOnInit() {
    this.isLoading = true;
    // Get the list of users
    this.apiService.users().subscribe(
      users => {
        this.users = users;
        this.isLoading = false;
        // This is an ugly implementation, since only the admin user receives all users
        // Only the admin user will get a list with an admin user in it
        // Everyone else only gets a list with a single user, themselves
        users.forEach(user => {
          if (user.admin) {
            this.isSuperuser = true;
          }
        });
      },
      error => {
        log.debug(`Server error: ${error.error.detail}`);
        this.userListError = error.error.detail;
      }
    );
  }

  /**
   * Update a user object
   * @param {User} user User to update, we get this from an *ngFor
   */
  updateUser(user: User) {
    this.updateLoading = true;
    // Read the update form value
    const formValue = this.userUpdateForm.value;
    // Set the id from the user object
    formValue['id'] = user.id;
    // Update the user
    this.apiService.userUpdate(formValue).subscribe(
      response => {
        // This should be changed so that the list of users is requested again instead of a full reload
        window.location.reload();
      },
      error => {
        log.debug(`Server error: ${error.error.detail}`);
        this.updateError = error.error.detail;
      }
    );
  }

  /**
   * Delete user object
   * @param {User} user User to delete
   */
  deleteUser(user: User) {
    // Upen YesCancel dialog to make sure the button wasn't accidentally clicked
    const confirmRef = this.dialog.open(UsersDialogComponent);

    confirmRef.afterClosed().subscribe(result => {
      // If dialog result is truthy
      if (result) {
        this.deleteLoading = true;
        // Delete user request
        this.apiService.userDelete(user.id).subscribe(
          response => {
            if (this.isSuperuser) {
              // Again, a reload should be replaced here
              window.location.reload();
            } else {
              // If the user was not the admin, then they deleted themselves
              // This maybe should not be allowed?
              // We log them out, then route to the login page
              this.authenticationService
                .logout()
                .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
            }
          },
          error => {
            log.debug(`Server error: ${error.error.detail}`);
            this.deleteError = error.error.detail;
          }
        );
      }
    });
  }

  /**
   * Create user object
   */
  createUser() {
    this.createLoading = true;
    /**
     * User create request
     */
    this.apiService.userCreate(this.userCreateForm.value).subscribe(
      response => {
        // Again, should'nt be a reload here
        window.location.reload();
      },
      error => {
        log.debug(`Server error: ${error.error.detail}`);
        this.createError = error.error.detail;
      }
    );
  }

  /**
   * FormGroups for the update and create forms, with validation
   */
  private createForms() {
    this.userUpdateForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.maxLength(50), Validators.minLength(5)])],
      email: ['', Validators.email],
      newPassword: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(16)])],
      oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])]
    });

    this.userCreateForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(5)])],
      email: ['', Validators.email],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])]
    });
  }
}
