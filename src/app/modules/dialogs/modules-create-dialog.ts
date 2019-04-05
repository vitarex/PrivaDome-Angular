import { Component, OnInit } from '@angular/core';
import { MatSelectChange, MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ApiService } from '@app/api';

const ipPattern = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

@Component({
  selector: 'app-modules-create-dialog-component',
  templateUrl: 'modules-create-dialog.html'
})
export class ModulesCreateDialogComponent {
  addressList: string[] = [];
  type: string;

  address = new FormControl('', Validators.pattern(ipPattern));
  name = new FormControl('', Validators.required);

  constructor(public dialogRef: MatDialogRef<ModulesCreateDialogComponent>, private apiService: ApiService) {}

  typeChanged(event: MatSelectChange) {
    console.log(event.value);
    console.log(this.type);
  }

  addAddress() {
    if (this.address.value) {
      this.addressList.push(this.address.value);
      this.address.reset();
    }
  }

  closeDialog() {
    if (this.type === 'Group') {
      this.apiService
        .addPolicyGroup({
          groupname: this.name.value,
          members: this.addressList
        })
        .subscribe(
          response => {
            this.dialogRef.close({ response: response, groupname: this.name.value });
          },
          error => {
            console.log(error);
            this.dialogRef.close(false);
          }
        );
    } else if (this.type === 'Address') {
      this.apiService.addPolicyAddress({ address: this.address.value }).subscribe(
        response => {
          this.dialogRef.close({ response: response, address: this.address.value });
        },
        error => {
          console.log(error);
          this.dialogRef.close(false);
        }
      );
    }
  }
}
