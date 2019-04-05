import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { LoginService } from './login.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';

describe('LoginService', () => {
  let loginService: LoginService;
  let backend: HttpTestingController;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [LoginService]
    })
  );

  beforeEach(inject(
    [LoginService, HttpTestingController],
    (_loginService: LoginService, _backend: HttpTestingController) => {
      loginService = _loginService;
      backend = _backend;
    }
  ));

  afterEach(() => {
    backend.verify();
  });

  it('should be created', () => {
    const service: LoginService = TestBed.get(LoginService);
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should create exactly one request', fakeAsync(() => {
      loginService.login('testUser', 'testPassword').subscribe();
      tick();

      backend.expectOne(
        req =>
          req.method === 'POST' &&
          req.url.endsWith('login/') &&
          req.headers.get('Content-Type') === 'application/json' &&
          req.body['username'] === 'testUser' &&
          req.body['password'] === 'testPassword',
        'POST to login with username and password'
      );
    }));

    it('should return the correct credentials', fakeAsync(() => {
      const request = loginService.login('testUser', 'testPassword');

      request.subscribe(credentials => {
        expect(credentials).toBeDefined();
        expect(credentials.token).toBeDefined();
        expect(credentials.token).toEqual('testToken');
        expect(credentials.username).toBeDefined();
        expect(credentials.username).toEqual('testUser');
      });
      tick();

      backend.match({})[0].flush({ token: 'testToken' });
    }));
  });
});
