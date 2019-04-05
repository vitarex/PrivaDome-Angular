import { FormBase, FormBaseOptions } from './form-base';

/**
 * Textbox dynamic form field with a string value
 */
export class FormTextbox extends FormBase<string> {
  /**
   * Set the type of the form fieldí
   */
  type = 'textbox';

  constructor(options: FormBaseOptions<string> = {}) {
    super(options);
  }
}
