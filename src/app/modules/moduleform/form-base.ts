/**
 * Form base constructor options
 */
export interface FormBaseOptions<T> {
  /**
   * ID of the form field
   */
  id?: string;
  /**
   * Value of the form, which is generic
   * This is set by the inheriting classes
   */
  value?: T;
  /**
   * Name of the form field
   */
  name?: string;
  /**
   * Short description of the form field
   */
  description?: string;
  /**
   * Type of the form field
   * Currently either select, textbox or checkbox
   */
  type?: string;
}

/**
 * Base class for the dynamic forms
 */
export class FormBase<T> {
  /**
   * ID of the form field
   */
  id: string;
  /**
   * Value of the form, which is generic
   * This is set by the inheriting classes
   */
  value: T;
  /**
   * Name of the form field
   */
  name: string;
  /**
   * Short description of the form field
   */
  description: string;
  /**
   * Type of the form field
   * Currently either select, textbox or checkbox
   */
  type: string;

  /**
   * Create a new form base
   * @param {FormBaseOptions} options Initialization values
   */
  constructor(options: FormBaseOptions<T> = {}) {
    this.id = options.id || '';
    this.value = options.value;
    this.name = options.name || '';
    this.description = options.description || '';
    this.type = options.type || '';
  }
}
