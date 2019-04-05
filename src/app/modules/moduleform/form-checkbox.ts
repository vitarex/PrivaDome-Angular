import { FormBase, FormBaseOptions } from './form-base';

/**
 * Checkbox dynamic form field with a boolean value
 */
export class FormCheckbox extends FormBase<boolean> {
  /**
   * Set the type of the form fieldí
   */
  type = 'checkbox';

  constructor(options: FormBaseOptions<boolean> = {}) {
    // We are actually checking if the value field exists at all in the received options object
    // This makes this call look complicated but it's not
    super(
      'value' in options
        ? options
        : (() => {
            options['value'] = false;
            return options;
          })()
    );
  }
}
