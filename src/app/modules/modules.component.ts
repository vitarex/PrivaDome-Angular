import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ApiService, ModulePolicies, ModuleSchema, ModuleConfiguration, ModulePolicy } from '@app/api';

import { MatDialog } from '@angular/material';
import { ModulesCreateDialogComponent } from './dialogs/modules-create-dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog';
import { ModuleformComponent } from './moduleform/moduleform.component';
import { isNull } from 'util';

/**
 * Module configuration used inside the frontend application
 */
interface RealConfig {
  /**
   * Network level policies
   */
  network: ModulePolicies;
  /**
   * List of group configurations
   */
  group: RealGroup[];
  /**
   * List of address configurations
   */
  address: RealAddress[];
}

/**
 * Group configuration used inside the frontend application
 */
interface RealGroup {
  /**
   * Name of the group
   */
  name: string;
  /**
   * List of members in the group, in string based IP addresses
   */
  members: string[];
  /**
   * Module policies of the group
   */
  policies: ModulePolicies;
}

/**
 * Address configuration used inside the frontend application
 */
interface RealAddress {
  /**
   * IP address of the client
   */
  address: string;
  /**
   * Module policies for the address
   */
  policies: ModulePolicies;
}

/**
 * Module settings component
 */
@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {
  /**
   * Querylist for the dynamic forms of the modules
   * We can read out their results through this list
   */
  @ViewChildren('moduleForm')
  moduleForms: QueryList<ModuleformComponent>;

  /**
   * List of module schemas
   * This defines the look and content of the module forms
   */
  moduleSchema: ModuleSchema[];
  /**
   * Current module configuration
   * This contains all the currently active modules and their settings
   */
  moduleConfig: RealConfig;

  /**
   * Currently selected group
   * If no group is selected this is null
   */
  selectedGroup: RealGroup;
  /**
   * Currently selected address
   * If no address is selected this is null
   */
  selectedAddress: RealAddress;

  /**
   * Whether the network level is active
   * Only a bool is enough for this, since there is only one network level
   */
  networkActive: boolean;

  /**
   * Module policies of the currently active level
   */
  activePolicies: ModulePolicies;

  /**
   * Create the form for the policy level selection
   * The user can select the policy level they would like to edit with this form
   */
  policySelect = new FormControl('');

  constructor(private apiService: ApiService, private dialog: MatDialog) {}

  /**
   * An event handler for the policy level selector
   * Sets netowrkActive, selectedAddress, selectedGroup and the respective activePolicies
   * @param {any} event Event object containing the new select value
   */
  policyLevelChanged(event: any) {
    // The select event can be null, if the form is reset
    if (event) {
      // Look for the level received in the event
      // This could be some kind of hashtable but it's insignificant
      if (event.startsWith('group')) {
        this.moduleConfig.group.forEach(group => {
          if ('group.' + group.name === event) {
            this.selectedGroup = group;
            this.selectedAddress = undefined;
            this.activePolicies = group.policies;
            this.networkActive = false;
          }
        });
      } else if (event.startsWith('address')) {
        this.moduleConfig.address.forEach(address => {
          if ('address.' + address.address === event) {
            this.selectedAddress = address;
            this.selectedGroup = undefined;
            this.activePolicies = address.policies;
            this.networkActive = false;
          }
        });
      } else {
        this.selectedAddress = undefined;
        this.selectedGroup = undefined;
        this.activePolicies = this.moduleConfig.network;
        this.networkActive = true;
      }
    }
  }

  ngOnInit() {
    // Get the module schemas which describe every module in the system
    this.apiService.moduleSchema().subscribe(schema => {
      // console.log(schema);
      this.moduleSchema = [];
      // The API sends the schemas in a key indexed object
      // This is inconvinient so, we transofrm it into a simple list
      // They already have an ID field
      for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
          this.moduleSchema.push(schema[key]);
        }
      }
    });

    // Get the module configurations, which describe the current settings
    // This contains policies for every module at every level
    this.apiService.moduleConfig().subscribe(config => {
      console.log(config);
      // Again, the API changed after the implementation, so we just make an old version of it
      // This is ugly, but I think it's the API that needs changing
      // Key indexed content shouldn't contain unknown keys and the API does
      this.moduleConfig = this.makeRealConfig(config);
    });

    // Subsribe to the select form's valueChanges event
    this.policySelect.valueChanges.subscribe(this.policyLevelChanged.bind(this));
  }

  /**
   * Transform a newer syntax module config into the old one
   * @param {ModuleConfiguration} config The newer syntax module config which will be transformed
   */
  makeRealConfig(config: ModuleConfiguration): RealConfig {
    // Empty objet to fill
    const realConfig: RealConfig = {
      network: config.network.module_policies ? config.network.module_policies : null,
      group: [],
      address: []
    };

    // Fill the group list
    for (const key in config.group) {
      if (config.group.hasOwnProperty(key)) {
        const group = config.group[key];
        realConfig.group.push({
          members: group.members,
          policies: group.module_policies,
          name: key
        });
      }
    }

    // Fill the address list
    for (const key in config.address) {
      if (config.address.hasOwnProperty(key)) {
        const address = config.address[key];
        realConfig.address.push({
          policies: address.module_policies,
          address: key
        });
      }
    }

    // Null out the network if needed
    if (isNull(realConfig.network)) {
      realConfig.network = {};
    }
    return realConfig;
  }

  /**
   * Add new policy level through a dialog window
   */
  addPolicyLevel() {
    // Call the add policy level dialog window
    const dialogRef = this.dialog.open(ModulesCreateDialogComponent);

    // Process the dialog result
    // The dialog already made the round trip to the server
    // The response contains either an error or the new module configuration
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.response) {
        // Reset the level selection and page
        this.clearPage(result.response);
        // Select the newly created policy level
        if (result.address) {
          this.policySelect.setValue('address.' + result.address);
        } else if (result.groupname) {
          this.policySelect.setValue('group.' + result.groupname);
        }
      }
    });
  }

  /**
   * Delete policy level
   */
  deletePolicyLevel() {
    // Call a confirmation dialog
    const confirmRef = this.dialog.open(ConfirmDialogComponent);

    // Process the dialog result
    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        // Call the proper API function based on the currently selected policy level
        if (this.selectedAddress) {
          this.apiService.deletePolicyAddress({ address: this.selectedAddress.address }).subscribe(
            response => {
              this.clearPage(response);
            },
            error => {
              console.log(error);
            }
          );
        } else if (this.selectedGroup) {
          this.apiService.deletePolicyGroup({ groupname: this.selectedGroup.name }).subscribe(
            response => {
              this.clearPage(response);
            },
            error => {
              console.log(error);
            }
          );
        }
      }
    });
  }

  /**
   * Save the changes of the module settings
   */
  saveSettings() {
    // We will fill up this empty object
    const policies: ModulePolicies = {};

    // Read the settings from every module with their inner constructPolicies method
    this.moduleForms.forEach((moduleForm: ModuleformComponent) => {
      if (moduleForm.enabled) {
        policies[moduleForm.moduleSchema.id] = {
          policy_records: []
        };
        policies[moduleForm.moduleSchema.id].policy_records = moduleForm.constructPolicies();
      }
    });

    // console.log(policies);

    // Call the proper API function, then load back the results
    if (this.selectedGroup !== undefined) {
      this.apiService.updatePolicyGroup(this.selectedGroup.name, policies).subscribe(response => {
        this.moduleConfig = this.makeRealConfig(response);
        this.activePolicies = this.moduleConfig.group.find(
          element => element.name === this.selectedGroup.name
        ).policies;
      });
    } else if (this.selectedAddress !== undefined) {
      this.apiService.updatePolicyAddress(this.selectedAddress.address, policies).subscribe(response => {
        this.moduleConfig = this.makeRealConfig(response);
        this.activePolicies = this.moduleConfig.address.find(
          element => element.address === this.selectedAddress.address
        ).policies;
      });
    } else if (this.networkActive) {
      this.apiService.updatePolicyNetwork(policies).subscribe(response => {
        this.moduleConfig = this.makeRealConfig(response);
        this.activePolicies = this.moduleConfig.network;
      });
    }
  }

  /**
   * Clear the page by resetting the state indicators
   * @param {ModuleConfiguration} response Optional configuration to replace the old one
   */
  clearPage(response?: ModuleConfiguration) {
    // Clear state indicators
    this.selectedAddress = undefined;
    this.selectedGroup = undefined;
    this.activePolicies = undefined;
    // Reset policy level selection form
    this.policySelect.reset();
    // Set the new module config if needed
    if (response) {
      this.moduleConfig = this.makeRealConfig(response);
    }
  }
}
