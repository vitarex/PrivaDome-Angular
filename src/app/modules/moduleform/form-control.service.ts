import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { FormBase } from './form-base';

/**
 * Form control service to create a FormGroup from a list of [FormBases]{@link FormBase}
 */
@Injectable()
export class FormControlService {
  constructor() {}

  /**
   * Create a FormGroup from a list of [FormBases]{@link FormBase}
   * @param {FormBase<any>[]} forms List of [FormBases]{@link FormBase} to create the FromGroup from
   * @returns {FormGroup}
   */
  toFormGroup(forms: FormBase<any>[]) {
    const group: any = {};

    forms.forEach(form => {
      // We need an extra branch for the false values which aren't actually undefined or null
      if (form.value !== false) {
        group[form.id] = new FormControl(form.value || '');
      } else {
        group[form.id] = new FormControl(form.value);
      }
    });
    return new FormGroup(group);
  }
}
