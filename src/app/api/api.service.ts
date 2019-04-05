import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthenticationService } from '@app/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfig, NumericConfig, TileConfig } from '@app/shared';

/**
 * URL constants
 */
const USERS_URL = 'users/';
const TILES_DATA_URL = 'tiles/data/';
const MODULE_CONFIG_URL = 'modules/config/';
const MODULE_SCHEMA_URL = 'modules/info/';
const ADD_POLICY_GROUP_URL = 'modules/addpolicy/group/';
const ADD_POLICY_ADDRESS_URL = 'modules/addpolicy/address/';
const DELETE_POLICY_GROUP_URL = 'modules/deletepolicy/group/';
const DELETE_POLICY_ADDRESS_URL = 'modules/deletepolicy/address/';
const UPDATE_POLICY_NETWORK_URL = 'modules/updatepolicy/network/';
const UPDATE_POLICY_GROUP_URL = 'modules/updatepolicy/group/';
const UPDATE_POLICY_ADDRESS_URL = 'modules/updatepolicy/address/';

/**
 * Describes the API functions that {@link ApiService} implements
 */
export interface IApiService {
  users(): Observable<User[]>;
  userUpdate(context: UpdateUserContext): Observable<User>;
  userDelete(id: number): Observable<Boolean | Observable<never>>;
  userCreate(user: CreateUserContext): Observable<User>;
  tilesData(name: string): Observable<any>;
  tiles(): Observable<any>;
  moduleConfig(): Observable<ModuleConfiguration>;
  moduleSchema(): Observable<IncomingModuleSchema>;
  addPolicyGroup(newGroup: { groupname: string; members: string[] }): Observable<ModuleConfiguration>;
  addPolicyAddress(newAddress: { address: string }): Observable<ModuleConfiguration>;
  deletePolicyGroup(deleteGroup: { groupname: string }): Observable<ModuleConfiguration>;
  deletePolicyAddress(deleteAddress: { address: string }): Observable<ModuleConfiguration>;
  updatePolicyNetwork(policies: ModulePolicies): Observable<ModuleConfiguration>;
  updatePolicyGroup(groupname: string, policies: ModulePolicies): Observable<ModuleConfiguration>;
  updatePolicyAddress(address: string, policies: ModulePolicies): Observable<ModuleConfiguration>;
}

/**
 * Describes a User object
 */
export interface User {
  /**
   * User ID
   */
  id: number;
  /**
   * Username
   */
  username: string;
  /**
   * User email
   */
  email?: string;
  /**
   * User has admin priviliges
   */
  admin: boolean;
}

/**
 * Used to update a user object
 *
 * Can be passed to [userUpdate]{@link ApiService#userUpdate}
 */
export interface UpdateUserContext {
  /**
   * ID of the user to update
   */
  id: number;
  /**
   * New username for the user
   */
  username?: string;
  /**
   * New email for the user
   */
  email?: string;
  /**
   * New password for the user
   */
  newPassword?: string;
  /**
   * The old password of the user
   */
  oldPassword: string;
}

/**
 * Used to create a new user object
 *
 * Can be passed to [userCreate]{@link ApiService#userCreate}
 */
export interface CreateUserContext {
  /**
   * Username for the new user object
   */
  username: string;
  /**
   * Email address for the new user object
   */
  email?: string;
  /**
   * Password for the new user object
   */
  password: string;
}

/**
 * Describes the tile based dashboard of the [HomeComponent]{@link HomeComponent}
 */
export interface TileInfo {
  /**
   * List of chart based tiles
   */
  charts: ChartConfig[];
  /**
   * List of number based tiles
   */
  numeric: NumericConfig[];
}

/**
 * Describes a PrivaDome module
 */
export interface ModuleSchema {
  /**
   * String ID of the module
   */
  id: string;
  /**
   * Friendly name of the module, prefered over ID for displaying to the user
   */
  friendlyName: string;
  /**
   * Short description of the module's functions and usage
   */
  description?: string;
  /**
   * List of custom inputs for the module
   */
  inputs?: InputSchema[];
}

/**
 * Describes a custom input field for PrivaDome modules
 */
export interface InputSchema {
  /**
   * String ID for the input field
   */
  id: string;
  /**
   * Name of the input field
   */
  name: string;
  /**
   * Short description of the usage of the input field
   *
   * Select type inputs should describe all their options
   */
  description?: string;
  /**
   * Type of the input field: textbox, checkbox, select
   */
  type?: string;
  /**
   * Options for the select type input fields
   */
  options?: string[];
}

/**
 * Auxiliary interface for PrivaDome modules
 *
 * This is required, because the API version of the interface is cumbersome to use in Angular
 *
 * Instead of a list of objects, it uses key-value pairs that are ineffective to traverse and use in ngFor directives
 */
export interface IncomingModuleSchema {
  /**
   * Key-value collection of PrivaDome module descriptors
   *
   * The keys are the module IDs
   */
  [key: string]: ModuleSchema;
}

/**
 * Current module policies of the system
 */
export interface ModuleConfiguration {
  /**
   * Network level configurations
   */
  network: NetworkLevel;
  /**
   * Group level configurations
   */
  group: {
    [key: string]: GroupLevel;
  };
  /**
   * IP address level configurations
   */
  address: {
    [key: string]: AddressLevel;
  };
}

/**
 * Network level policies for PrivaDome modules
 */
export interface NetworkLevel {
  /**
   * The policies of the global network level
   */
  module_policies: ModulePolicies;
}

/**
 * Group level policies for PrivaDome modules
 */
export interface GroupLevel {
  /**
   * The name of the group (why is it optional?)
   */
  name?: string;
  /**
   * Members of the group, IP address in string form
   */
  members: string[];
  /**
   * The policies of this policy group
   */
  module_policies: ModulePolicies;
}

/**
 * Address level policies for the PrivaDome modules
 */
export interface AddressLevel {
  /**
   * IP address of the client in string form
   */
  address?: string;
  /**
   * The policies for this single client
   */
  module_policies: ModulePolicies;
}

/**
 * Describes policies for a single policy level
 */
export interface ModulePolicies {
  /**
   * Key-value collection of policies for a single module
   *
   * The key is the [ID of the module]{@link ModuleSchema#id}
   */
  [key: string]: {
    policy_records: ModulePolicy[];
  };
}

/**
 * Describes policies for a single module inside a policy level
 */
export interface ModulePolicy {
  /**
   * The active period of the module on a weekly schedule
   */
  active_period: ActivePeriod;
  /**
   * Block upsteam policies: invalidate policies in less specific policy groups for a given module
   *
   * If this is true the custom input fields should be invisible
   */
  blocking: boolean;
  /**
   * The current value of the custom input fields, if there are any
   */
  options?: any;
}

/**
 * A weekly schedule with quarter-hour granularity for the policies
 */
export interface ActivePeriod {
  /**
   * Zero based indexing of the days of the week
   *
   * The policy is active on the days included
   */
  day: number[];
  /**
   * Start time of the policy in [HH, mm]
   *
   * Minutes should be one of [0, 15, 30, 45]
   *
   * Should be lower than end time
   */
  start: number[];
  /**
   * End time of the policy in [HH, mm]
   *
   * Minutes should be one of [0, 15, 30, 45]
   *
   * Should be lower than end time
   */
  end: number[];
}

/**
 * Provides the API call functions.
 */
@Injectable()
export class ApiService implements IApiService {
  constructor(private http: HttpClient, private authService: AuthenticationService) {}

  /**
   * Get a list of all users available to the current account signed in
   * @return {Observable<User[]>} List of users
   */
  users(): Observable<User[]> {
    const url = USERS_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.get<User[]>(url, HttpOptions);
  }

  /**
   * Update a User object
   * @param {UpdateUserContext} context User context for updating
   * @return {Observable<User>} The new user object
   */
  userUpdate(context: UpdateUserContext): Observable<User> {
    const url = USERS_URL + context.id + '/';

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    const UserDetails = {};
    if ('oldPassword' in context) {
      UserDetails['oldPassword'] = context.oldPassword;
    } else {
      return throwError('No old password included');
    }

    if (context.username) {
      UserDetails['username'] = context.username;
    }
    if (context.email) {
      UserDetails['email'] = context.email;
    }
    if (context.newPassword) {
      UserDetails['newPassword'] = context.newPassword;
    }

    return this.http.patch<User>(url, UserDetails, HttpOptions);
  }

  /**
   * Delete a User object
   * @param {number} id Id of user to be deleted
   * @return {Observable<Boolean>} If deleted succesfully
   */
  userDelete(id: number): Observable<Boolean | Observable<never>> {
    const url = USERS_URL + id + '/';

    // Observe the response to get the status code
    // Options must be declared inline here
    return this.http
      .delete<HttpResponse<Object>>(url, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Token ' + this.authService.credentials.token
        }),
        observe: 'response'
      })
      .pipe(
        map(response => {
          if (response.status === 204) {
            return true;
          }
          // tslint:disable-next-line:quotemark
          throw new Error("The server couldn't complete the request");
        })
      );
  }

  /**
   * Create a User object
   * @param {CreateUserContext} user User to create
   * @return {Observable<User>} Created user
   */
  userCreate(user: CreateUserContext): Observable<User> {
    const url = USERS_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<User>(url, user, HttpOptions);
  }

  /**
   * Get the data for a given dashboard tile
   * @param {string} name Identification for the tile data
   * @return {Observable<any>} Data for the $name tile
   */
  tilesData(name: string): Observable<any> {
    const url = TILES_DATA_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    const content = {
      name: name
    };

    return this.http.post(url, content, HttpOptions);
  }

  /**
   * @return {Observable<TileConfig>} Tile information
   */
  tiles(): Observable<TileConfig> {
    return of({
      charts: [
        {
          name: 'get_last_days',
          title: 'Last days',
          description: 'Requests from the last few days',
          width: 2,
          height: 4,
          borderless: false,
          options: {
            type: 'line',
            datasets: [
              {
                label: 'Requests',
                color: [107, 152, 185]
              }
            ],
            axes: 'time',
            unit: 'day'
          }
        },
        {
          name: 'get_last_months',
          title: 'Last months',
          description: 'Requests from the last months',
          width: 1,
          height: 4,
          borderless: true,
          options: {
            type: 'bar',
            datasets: [
              {
                label: 'Requests',
                color: [157, 102, 25]
              }
            ],
            axes: 'time',
            unit: 'month'
          }
        },
        {
          name: 'get_top_clients',
          title: 'Active Clients',
          description: 'Most active clients',
          width: 2,
          height: 4,
          borderless: false,
          options: {
            type: 'bar',
            datasets: [
              {
                label: 'Requests',
                color: [200, 42, 25]
              }
            ],
            axes: 'category'
          }
        },
        {
          name: 'get_top_queries',
          title: 'Top Domains',
          description: 'Most looked up domains',
          width: 1,
          height: 4,
          borderless: true,
          options: {
            type: 'bar',
            datasets: [
              {
                label: 'Requests',
                color: [107, 192, 215]
              }
            ],
            axes: 'category'
          }
        },
        {
          name: 'get_top_blocked',
          title: 'Most blocked',
          description: 'Most blocked domains',
          width: 1,
          height: 4,
          borderless: true,
          options: {
            type: 'bar',
            datasets: [
              {
                label: 'Requests',
                color: [74, 202, 45]
              }
            ],
            axes: 'category'
          }
        }
      ] as ChartConfig[],
      numeric: [
        {
          name: 'get_today_all',
          title: 'Requests Today',
          color: [65, 244, 169]
        },
        {
          name: 'get_today_blocked',
          title: 'Blocked Today',
          color: [244, 65, 71]
        }
      ] as NumericConfig[]
    });
  }

  /**
   * The current settings of the modules in the system
   * @return {Observable<ModuleConfiguration>} Module settings with policies
   */
  moduleConfig(): Observable<ModuleConfiguration> {
    const url = MODULE_CONFIG_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.get<ModuleConfiguration>(url, HttpOptions);
  }

  /**
   * Get information about installed modules and their configuration options
   * @return {Observable<IncomingModuleSchema>} Information about installed modules and their configuration options
   */
  moduleSchema(): Observable<IncomingModuleSchema> {
    const url = MODULE_SCHEMA_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.get<IncomingModuleSchema>(url, HttpOptions);
  }

  /**
   * Add a group policy level
   * @param {groupname: string, members: string[]} newGroup Group config to add
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  addPolicyGroup(newGroup: { groupname: string; members: string[] }): Observable<ModuleConfiguration> {
    const url = ADD_POLICY_GROUP_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<ModuleConfiguration>(url, newGroup, HttpOptions);
  }

  /**
   * Add an address policy level
   * @param {string} address Address config to add
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  addPolicyAddress(newAddress: { address: string }): Observable<ModuleConfiguration> {
    const url = ADD_POLICY_ADDRESS_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<ModuleConfiguration>(url, newAddress, HttpOptions);
  }

  /**
   * Delete a group policy
   * @param {string} groupname Group to delete
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  deletePolicyGroup(deleteGroup: { groupname: string }): Observable<ModuleConfiguration> {
    const url = DELETE_POLICY_GROUP_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<ModuleConfiguration>(url, deleteGroup, HttpOptions);
  }

  /**
   * Delete an address policy
   * @param {string} address Address to delete
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  deletePolicyAddress(deleteAddress: { address: string }): Observable<ModuleConfiguration> {
    const url = DELETE_POLICY_ADDRESS_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<ModuleConfiguration>(url, deleteAddress, HttpOptions);
  }

  /**
   * Update the network policies
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  updatePolicyNetwork(policies: ModulePolicies): Observable<ModuleConfiguration> {
    const url = UPDATE_POLICY_NETWORK_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    return this.http.post<ModuleConfiguration>(url, policies, HttpOptions);
  }

  /**
   * Update a group policy
   * @param {string} groupname The group to update
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  updatePolicyGroup(groupname: string, policies: ModulePolicies): Observable<ModuleConfiguration> {
    const url = UPDATE_POLICY_GROUP_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    const content = {
      groupname: groupname,
      module_policies: policies
    };

    return this.http.post<ModuleConfiguration>(url, content, HttpOptions);
  }

  /**
   * Update an address policy
   * @param {string} address The address to update
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>} The result of the request
   */
  updatePolicyAddress(address: string, policies: ModulePolicies): Observable<ModuleConfiguration> {
    const url = UPDATE_POLICY_ADDRESS_URL;

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Token ' + this.authService.credentials.token
      })
    };

    const content = {
      address: address,
      module_policies: policies
    };

    return this.http.post<ModuleConfiguration>(url, content, HttpOptions);
  }
}
