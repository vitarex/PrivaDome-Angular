import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FormBase } from './form-base';

/**
 * Dynamic form component
 * This represents a single form field in a FormGroup
 */
@Component({
  selector: 'app-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {
  /**
   * Implemented form type
   * All form types inherit from the form base
   */
  @Input()
  form: FormBase<any>;
  /**
   * The FormGroup containing this form field
   */
  @Input()
  formGroup: FormGroup;

  /**
   * Validation function
   */
  get isValid() {
    return this.formGroup.controls[this.form.id].valid;
  }
}
