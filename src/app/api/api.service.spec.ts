import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { ApiService, User, UpdateUserContext, CreateUserContext, ModulePolicies } from './api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { MockAuthenticationService, AuthenticationService } from '@app/core';

const updatePolicyTestData: ModulePolicies = {
  aModule: {
    policy_records: [
      {
        active_period: {
          day: [0, 1],
          start: [10, 15],
          end: [11, 45]
        },
        blocking: true,
        options: {
          aOpt: 'aOptVal'
        }
      }
    ]
  }
};

describe('ApiService', () => {
  let apiService: ApiService;
  let backend: HttpTestingController;
  let authenticationService: MockAuthenticationService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [ApiService, { provide: AuthenticationService, useClass: MockAuthenticationService }]
    })
  );

  beforeEach(inject(
    [ApiService, HttpTestingController],
    (_apiService: ApiService, _backend: HttpTestingController, _authenticationService: MockAuthenticationService) => {
      apiService = _apiService;
      backend = _backend;
      authenticationService = _authenticationService;
    }
  ));

  afterEach(() => {
    backend.verify();
  });

  it('should be created', () => {
    const service: ApiService = TestBed.get(ApiService);
    expect(service).toBeTruthy();
  });

  describe('get users endpoint', () => {
    const getUsersTestData: User[] = [
      {
        admin: false,
        id: 1,
        username: 'testUsername',
        email: 'test@test.test'
      }
    ];

    it('should create a proper request', fakeAsync(() => {
      apiService.users().subscribe(data => {
        expect(data).toEqual(getUsersTestData);
      });
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('users/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      request.flush(getUsersTestData);
    }));
  });

  describe('update user endpoint', () => {
    const updateUserContextTestData: UpdateUserContext = {
      id: 1,
      username: 'testUsername',
      email: 'test@test.test',
      oldPassword: 'oldPass',
      newPassword: 'newPass'
    };

    const updateUserContextNoDataTestData: UpdateUserContext = {
      id: 1,
      oldPassword: 'oldPass'
    };

    // Type: any, because the interface doesn't allow no old password.
    const updateUserContextNoPassTestData: any = {
      id: 1,
      username: 'testUsername',
      email: 'test@test.test',
      newPassword: 'newPass'
    };

    const updatedUserData: User = {
      id: 1,
      admin: false,
      username: 'testUsername',
      email: 'test@test.test'
    };

    it('should create a proper request', fakeAsync(() => {
      apiService.userUpdate(updateUserContextTestData).subscribe(data => {
        expect(data).toEqual(updatedUserData);
      });
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'PATCH' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('users/1/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      request.flush(updatedUserData);
    }));

    it('should include the user data', fakeAsync(() => {
      apiService.userUpdate(updateUserContextTestData).subscribe();
      tick();

      const req = backend.expectOne('users/1/');
      expect(req.request.body).toEqual({
        username: 'testUsername',
        newPassword: 'newPass',
        oldPassword: 'oldPass',
        email: 'test@test.test'
      });
    }));

    it('should omit parameters not included', fakeAsync(() => {
      apiService.userUpdate(updateUserContextNoDataTestData).subscribe();
      tick();

      const req = backend.expectOne('users/1/');
      expect(req.request.body).toEqual({
        oldPassword: 'oldPass'
      });
    }));

    it('should not allow no old password', fakeAsync(() => {
      apiService
        .userUpdate(updateUserContextNoPassTestData)
        .subscribe(result => fail('Expected error!'), error => expect(error).toBeDefined());
      tick();

      backend.expectNone('users/1/');
    }));
  });

  describe('delete user endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.userDelete(1).subscribe();
      tick();

      backend.expectOne(req => {
        return (
          req.method === 'DELETE' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('users/1/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
    }));

    it('should return true on 204 status code', fakeAsync(() => {
      apiService.userDelete(1).subscribe(data => {
        expect(data).toBeTruthy();
      });
      tick();

      const request = backend.expectOne('users/1/');
      request.flush({}, { status: 204, statusText: 'No Content' });
    }));

    it('should return error on non 204 status codes', fakeAsync(() => {
      apiService.userDelete(1).subscribe(result => fail('Expected error!'), error => expect(error).toBeDefined());
      tick();

      const request = backend.expectOne('users/1/');
      request.flush({}, { status: 205, statusText: 'Reset Content' });
    }));
  });

  describe('create user endpoint', () => {
    const createUserContextTestData: CreateUserContext = {
      username: 'testUsername',
      password: 'testPassword',
      email: 'test@test.test'
    };

    const createUserContextNoEmailTestData: CreateUserContext = {
      username: 'testUsername',
      password: 'testPassword'
    };

    it('should create a proper request', fakeAsync(() => {
      apiService.userCreate(createUserContextTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('users/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });

      expect(request.request.body).toEqual({
        username: 'testUsername',
        password: 'testPassword',
        email: 'test@test.test'
      });
    }));

    it('should be able to create user without email', fakeAsync(() => {
      apiService.userCreate(createUserContextNoEmailTestData).subscribe();
      tick();

      const request = backend.expectOne('users/');
      expect(request.request.body).toEqual({
        username: 'testUsername',
        password: 'testPassword'
      });
    }));
  });

  describe('get tile data endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.tilesData('testName').subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('tiles/data/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        name: 'testName'
      });
    }));
  });

  describe('get tiles information endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.tiles().subscribe(data => {
        expect(Object.keys(data)).toContain('charts');
        expect(Object.keys(data)).toContain('numeric');
      });
      tick();

      backend.expectNone(() => true);
    }));
  });

  describe('get module schema endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.moduleSchema().subscribe();
      tick();

      backend.expectOne(req => {
        return (
          req.method === 'GET' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/info/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
    }));
  });

  describe('add policy group endpoint', () => {
    const addPolicyGroupTestData = {
      groupname: 'testName',
      members: ['1.1.1.1', '2.2.2.2']
    };
    it('should create a proper request', fakeAsync(() => {
      apiService.addPolicyGroup(addPolicyGroupTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/addpolicy/group/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        groupname: 'testName',
        members: ['1.1.1.1', '2.2.2.2']
      });
    }));
  });

  describe('add policy address endpoint', () => {
    const addPolicyAddressTestData = {
      address: '1.1.1.1'
    };
    it('should create a proper request', fakeAsync(() => {
      apiService.addPolicyAddress(addPolicyAddressTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/addpolicy/address/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        address: '1.1.1.1'
      });
    }));
  });

  describe('delete policy group endpoint', () => {
    const deletePolicyGroupTestData = {
      groupname: 'testName'
    };
    it('should create a proper request', fakeAsync(() => {
      apiService.deletePolicyGroup(deletePolicyGroupTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/deletepolicy/group/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        groupname: 'testName'
      });
    }));
  });

  describe('delete policy address endpoint', () => {
    const deletePolicyAddressTestData = {
      address: '1.1.1.1'
    };
    it('should create a proper request', fakeAsync(() => {
      apiService.deletePolicyAddress(deletePolicyAddressTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/deletepolicy/address/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        address: '1.1.1.1'
      });
    }));
  });

  describe('update policy network endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.updatePolicyNetwork(updatePolicyTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/updatepolicy/network/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual(updatePolicyTestData);
    }));
  });

  describe('update policy group endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.updatePolicyGroup('testName', updatePolicyTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/updatepolicy/group/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        groupname: 'testName',
        module_policies: updatePolicyTestData
      });
    }));
  });

  describe('update policy address endpoint', () => {
    it('should create a proper request', fakeAsync(() => {
      apiService.updatePolicyAddress('1.1.1.1', updatePolicyTestData).subscribe();
      tick();

      const request = backend.expectOne(req => {
        return (
          req.method === 'POST' &&
          req.headers.get('Authorization') === 'Token 123' &&
          req.url.endsWith('modules/updatepolicy/address/') &&
          req.headers.get('Content-Type') === 'application/json'
        );
      });
      expect(request.request.body).toEqual({
        address: '1.1.1.1',
        module_policies: updatePolicyTestData
      });
    }));
  });
});
