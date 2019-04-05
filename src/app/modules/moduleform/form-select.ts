import { FormBase, FormBaseOptions } from './form-base';

/**
 * Select dynamic form field with a string value
 */
export class FormSelect extends FormBase<string> {
  /**
   * Set the type of the form fieldí
   */
  type = 'select';
  /**
   * The selection options
   */
  options: string[];

  constructor(options: FormBaseOptions<string> = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}
