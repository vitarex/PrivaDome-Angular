import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

import {
  User,
  UpdateUserContext,
  CreateUserContext,
  ModuleSchema,
  ModulePolicies,
  ModuleConfiguration,
  IApiService,
  IncomingModuleSchema,
  TileInfo
} from './api.service';
import { map } from 'rxjs/operators';
import { Chart } from 'chart.js';
import { TileConfig, NumericConfig, ChartConfig } from '@app/shared';

/**
 * Provides the mock API call functions for testing and developement.
 * userUpdate
 */
@Injectable()
export class MockApiService implements IApiService {
  /**
   * Return the list of users.
   * @return {Observable<User[]>} List of users
   */
  users(): Observable<Array<User>> {
    const userArray: User[] = [
      {
        id: 1,
        username: 'balint',
        email: 'vilanyib@gmail.com',
        admin: true
      },
      {
        id: 2,
        username: 'adam',
        email: 'adam@gmail.com',
        admin: false
      }
    ];

    return of(userArray);
  }

  /**
   * Update a User object.
   * @param {UpdateUserContext} context User context for updating
   * @return {Observable<User>} The new user object
   */
  userUpdate(context: UpdateUserContext): Observable<User> {
    return of({
      id: context.id,
      username: context.username ? context.username : 'mockUsername',
      email: context.email ? context.email : null,
      admin: true
    });
  }

  /**
   * Delete a User object.
   * @param {id} number Id of user to be deleted
   * @return {Observable<Boolean>} If deleted succesfully
   */
  userDelete(id: number): Observable<Boolean | Observable<never>> {
    return of(true);
  }

  /**
   * Create a User object.
   * @param {user} CreateUserContext User to create
   * @return {Observable<User>} Created user
   */
  userCreate(user: CreateUserContext): Observable<User> {
    const returnUser = {
      id: 110,
      username: user.username,
      password: user.password,
      admin: false
    };

    if (user.email) {
      returnUser['email'] = user.email;
    }

    return of(returnUser);
  }

  /**
   * @return {Observable<any>} Data
   */
  // It's Observable<any>, because we have no preliminary knowledge
  // about the requested data format.
  tilesData(name: string): Observable<any> {
    switch (name) {
      case 'get_today_all':
        return of(
          8723
        );
      case 'get_today_blocked':
        return of(
          732
        );
      case 'get_top_clients':
        return of({
          '192.168.1.4': 532,
          '192.168.1.44': 321,
          '192.168.1.71': 175,
          '192.168.1.96': 71,
        });
      case 'get_top_blocked':
          return of({
            'a': 1034,
            'b': 723,
            'c': 523,
            'd': 421,
          });
      case 'get_top_queries':
        return of({
          '2019-01-01': 432,
          '2019-02-01': 430,
          '2019-03-01': 350,
          '2019-04-01': 340,
          '2019-05-01': 330
        });
      case 'get_last_months':
        return of({
          '2019-01-01': 9432,
          '2019-02-01': 13213,
          '2019-03-01': 10021,
          '2019-04-01': 7892,
          '2019-05-01': 8723
        });
      case 'get_last_days':
        return of({
          '2019-01-01': 9432,
          '2019-01-02': 4213,
          '2019-01-03': 10021,
          '2019-01-04': 5892,
          '2019-01-05': 8723
        });
      default:
        return of({});
    }
  }

  /**
   * @return {Observable<TileInfo>} Tile information
   */
  /* tiles(): Observable<TileInfo> {
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
            type: 'line' as Chart.ChartType,
            datasets: [
              {
                label: 'Requests',
                color: [107, 152, 185]
              }
            ],
            axes: 'time' as Chart.ScaleType,
            unit: 'day' as Chart.TimeUnit
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
            type: 'bar' as Chart.ChartType,
            datasets: [
              {
                label: 'Requests',
                color: [157, 102, 25]
              }
            ],
            axes: 'time' as Chart.ScaleType,
            unit: 'month' as Chart.TimeUnit
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
            type: 'bar' as Chart.ChartType,
            datasets: [
              {
                label: 'Requests',
                color: [200, 42, 25]
              }
            ],
            axes: 'category' as Chart.ScaleType
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
            type: 'bar' as Chart.ChartType,
            datasets: [
              {
                label: 'Requests',
                color: [107, 192, 215]
              }
            ],
            axes: 'category' as Chart.ScaleType
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
            type: 'bar' as Chart.ChartType,
            datasets: [
              {
                label: 'Requests',
                color: [74, 202, 45]
              }
            ],
            axes: 'category' as Chart.ScaleType
          }
        }
      ],
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
      ]
    });
  } */
  /**
   * @return {Observable<TileConfig>} Tile information
   */
  tiles(): Observable<TileConfig> {
    return of({
      charts: [
        {
          name: 'get_top_clients',
          title: 'Active Clients',
          description: 'Most active clients',
          width: 2,
          height: 3,
          borderless: true,
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
          name: 'get_last_days',
          title: 'Last days',
          description: 'Requests from the last few days',
          width: 2,
          height: 4,
          borderless: true,
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
        /* {
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
        } */
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
   * @return {Observable<ModuleConfiguration>} Module settings with policies
   */
  moduleConfig(): Observable<ModuleConfiguration> {
    return of({
      network: {
        module_policies: {
          adblock: {
            policy_records: [
              {
                active_period: {
                  start: [0, 0],
                  end: [22, 0],
                  day: [0, 1, 2, 3, 4, 5, 6]
                },
                blocking: false
              }
            ]
          },
          maliciousblock: {
            policy_records: [
              {
                active_period: {
                  start: [0, 0],
                  end: [23, 0],
                  day: [0, 1, 2, 3, 4, 5, 6]
                },
                blocking: false
              }
            ]
          },
          socialblock: {
            policy_records: [
              {
                active_period: {
                  start: [0, 0],
                  end: [22, 0],
                  day: [0, 1, 2, 3, 4, 5, 6]
                },
                blocking: true,
                options: {
                  specialblock: true,
                  specialeffect: 'Instagram'
                }
              }
            ]
          }
        }
      },
      group: {},
      address: {}
    });
  }

  /**
   * @return {Observable<IncomingModuleSchema>} Information about installed modules and their configuration options
   */
  moduleSchema(): Observable<IncomingModuleSchema> {
    return of({
      adblock: {
        id: 'adblock',
        friendlyName: 'Advertisement Blocker'
      },
      maliciousblock: {
        id: 'maliciousblock',
        friendlyName: 'Malicious Site Blocker'
      },
      socialblock: {
        id: 'socialblock',
        friendlyName: 'SocialBlock',
        inputs: [
          {
            description: 'You can turn SPECIALS on. (default off)',
            id: 'specialblock',
            name: 'SpecialBlock',
            type: 'checkbox'
          },
          {
            description: 'Give what special effect you need.',
            id: 'specialeffect',
            name: 'SpecialEffect',
            type: 'select',
            options: ['Instagram', 'Facebook', 'Twitter']
          }
        ]
      }
    });
  }

  /**
   * Add a group policy level
   * @param {groupname: string, members: string[]} newGroup Group config to add
   * @return {Observable<ModuleConfiguration>}
   */
  addPolicyGroup(newGroup: { groupname: string; members: string[] }): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        config.group[newGroup.groupname] = {
          members: newGroup.members,
          module_policies: {}
        };
        return config;
      })
    );
  }

  /**
   * Add an address policy level
   * @param {string} address Address config to add
   * @return {Observable<ModuleConfiguration>}
   */
  addPolicyAddress(newAddress: { address: string }): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        config.address[newAddress.address] = {
          module_policies: {}
        };
        return config;
      })
    );
  }

  /**
   * Delete a group policy
   * @param {string} groupname Group to delete
   * @return {Observable<ModuleConfiguration>}
   */
  deletePolicyGroup(deleteGroup: { groupname: string }): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        delete config.group[deleteGroup.groupname];
        return config;
      })
    );
  }

  /**
   * Delete an address policy
   * @param {string} address Address to delete
   * @return {Observable<ModuleConfiguration>}
   */
  deletePolicyAddress(deleteAddress: { address: string }): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        delete config.address[deleteAddress.address];
        return config;
      })
    );
  }

  /**
   * Update the network policies
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>}
   */
  updatePolicyNetwork(policies: ModulePolicies): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        config.network.module_policies = policies;
        config.network.module_policies['moduleA'].policy_records[0].active_period.end[1] = 30;
        return config;
      })
    );
  }

  /**
   * Update a group policy
   * @param {string} groupname The group to update
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>}
   */
  updatePolicyGroup(groupname: string, policies: ModulePolicies): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        config.group[groupname].module_policies = policies;
        return config;
      })
    );
  }

  /**
   * Update an address policy
   * @param {string} address The address to update
   * @param {ModulePolicies} policies The updated policies
   * @return {Observable<ModuleConfiguration>}
   */
  updatePolicyAddress(address: string, policies: ModulePolicies): Observable<ModuleConfiguration> {
    return this.moduleConfig().pipe(
      map(config => {
        config.address[address].module_policies = policies;
        return config;
      })
    );
  }
}
