import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { ModuleSchema, ModulePolicy, ModulePolicies, ActivePeriod } from '@app/api';
import { FormBase } from './form-base';
import { FormControlService } from './form-control.service';
import { FormCheckbox } from './form-checkbox';
import { FormTextbox } from './form-textbox';
import { FormSelect } from './form-select';

/**
 * Component for one module with a dynamically built form
 */
@Component({
  selector: 'app-moduleform',
  templateUrl: './moduleform.component.html',
  styleUrls: ['./moduleform.component.scss'],
  providers: [FormControlService]
})
export class ModuleformComponent implements OnInit, OnChanges {
  /**
   * Module schema of the module
   * Describes the dynamic form components of the specific module
   */
  @Input()
  moduleSchema: ModuleSchema;
  /**
   * Module policies of the module
   * Multiple policies are allowed for a single module
   */
  @Input()
  modulePolicies: ModulePolicy[];
  /**
   * Network level policies don't display the block active policies checkbox
   * This can be checked with this input property
   */
  @Input()
  networkActive: boolean;

  /**
   * FormGroups of the module settings
   * Every module policy has its own FormGroup
   */
  formGroups: FormGroup[] = [];
  /**
   * Form bases for the FormGroups, this can be discerned from the ModuleSchema of the module
   */
  forms: FormBase<any>[] = [];

  /**
   * Whether the module is enabled
   */
  enabled = false;

  constructor(private fcs: FormControlService) {}

  ngOnInit() {
    // If there are policies, then the module is active
    if (this.modulePolicies) {
      this.enabled = true;
    }

    console.log(this.modulePolicies);
    console.log(this.moduleSchema);

    // Create the FormBases for the module, this only needs to be done once
    this.createForms();

    // Create the FormGroups for every policy instance
    this.setFormGroups();
  }

  /**
   * Create FormBases based on the ModuleSchema
   */
  createForms() {
    // Of course we only need the dynamic forms if there are custom inputs for the module at all
    if (this.moduleSchema.inputs) {
      this.moduleSchema.inputs.forEach((input, index) => {
        switch (input.type) {
          case 'checkbox':
            this.forms.push(new FormCheckbox(input));
            break;
          case 'textbox':
            this.forms.push(new FormTextbox(input));
            break;
          case 'select':
            this.forms.push(new FormSelect(input));
            break;
          default:
            break;
        }
      });
    }
  }

  /**
   * Set the FormGroups based on the policies
   */
  setFormGroups() {
    // Clear the current list
    this.formGroups.length = 0;

    // Fill up the list
    if (this.modulePolicies) {
      this.modulePolicies.forEach(item => {
        this.formGroups.push(this.createFromGroup(item));
      });
    }
  }

  // Create FormGroups from the form list
  createFromGroup(modulePolicy: ModulePolicy): FormGroup {
    // Use the control service to create FormGroups
    const formGroup = this.fcs.toFormGroup(this.forms);

    // Set the current value for a specific input field
    for (const key in modulePolicy.options) {
      if (modulePolicy.options.hasOwnProperty(key) && formGroup.controls.hasOwnProperty(key)) {
        formGroup.controls[key].setValue(modulePolicy.options[key]);
      }
    }

    console.log(this.modulePolicies);
    console.log(this.moduleSchema);

    // Add the static controls
    formGroup.addControl('blocking', new FormControl(!modulePolicy.blocking));
    formGroup.addControl('day', new FormControl(modulePolicy.active_period.day.map(String)));
    formGroup.addControl('startHour', new FormControl(modulePolicy.active_period.start[0].toString()));
    formGroup.addControl('startMinute', new FormControl(modulePolicy.active_period.start[1].toString()));
    formGroup.addControl('endHour', new FormControl(modulePolicy.active_period.end[0].toString()));
    formGroup.addControl('endMinute', new FormControl(modulePolicy.active_period.end[1].toString()));
    return formGroup;
  }

  onSubmit() {}

  /**
   * ModulePolicy change event handler
   * @param {SimpleChanges} changes Contains the old and new state
   */
  ngOnChanges(changes: SimpleChanges) {
    // Check if the module policies changed
    if ('modulePolicies' in changes && !changes['modulePolicies'].firstChange) {
      // Set the FormGroups with the new values
      if (changes['modulePolicies'].currentValue) {
        this.setFormGroups();
        this.enabled = true;
      } else if (changes['modulePolicies'].currentValue === undefined) {
        // If the modulePolicies become undefined, diable the form and clear the list
        this.enabled = false;
        this.formGroups.length = 0;
      }
    }
  }

  /**
   * Add new policy
   * This creates an empty policy form and adds it to the FormGroup list
   */
  addPolicy() {
    const formGroup = this.fcs.toFormGroup(this.forms);
    formGroup.addControl('blocking', new FormControl(false));
    formGroup.addControl('day', new FormControl(''));
    formGroup.addControl('startHour', new FormControl(''));
    formGroup.addControl('startMinute', new FormControl(''));
    formGroup.addControl('endHour', new FormControl(''));
    formGroup.addControl('endMinute', new FormControl(''));
    this.formGroups.push(formGroup);
  }

  /**
   * Delete a policy from the list, identified by its index in the list
   * @param {number} index Index of the policy to delete
   */
  deletePolicy(index: number) {
    this.formGroups.splice(index, 1);
  }

  /**
   * Consturct a new module policy object from the current form values
   * This is used by {@link ModulesComponent} to gather all form results
   */
  constructPolicies(): ModulePolicy[] {
    const policyList: ModulePolicy[] = [];

    // For every FormGroup in the list, i.e. every individual policy for the module
    for (const formGroup of this.formGroups) {
      // Add the custom input field values to the object, if they exist
      let options;
      if (this.moduleSchema && this.moduleSchema.inputs && !formGroup.value['blocking']) {
        options = {};
        for (const input of this.moduleSchema.inputs) {
          if (input.id in formGroup.value) {
            options[input.id] = formGroup.value[input.id];
          }
        }
      }

      // Calculate the active period
      const actPeriod: ActivePeriod = {} as any;
      // These explicit casts and map methods make sure that only numbers can be passed on to the server
      actPeriod.day = formGroup.value['day'].map(Number);
      actPeriod.start = [Number(formGroup.value['startHour']), Number(formGroup.value['startMinute'])];
      actPeriod.end = [Number(formGroup.value['endHour']), Number(formGroup.value['endMinute'])];

      // Put the object together
      const policy: ModulePolicy = {} as any;
      policy.active_period = actPeriod;
      if (options) {
        policy.options = options;
      }
      // The API blocking value is the exact opposite of the frontend one ¯\_(ツ)_/¯
      policy.blocking = !formGroup.value['blocking'];

      console.log(policy);

      // Add the policy to the final return list
      policyList.push(policy);
    }

    // Return the policies
    return policyList;
  }
}
