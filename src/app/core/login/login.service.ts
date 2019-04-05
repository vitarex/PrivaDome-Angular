import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Credentials } from '../authentication/authentication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Provides the login function
 * This is separated from {@link ApiService} to prevent a circular dependency problem
 */
@Injectable()
export class LoginService {
  constructor(private http: HttpClient) {}

  /**
   * Get a token from the server
   * @param {string} username Login username
   * @param {string} password Login password
   * @return {Observable<Credentials>} The user credentials
   */
  login(username: string, password: string): Observable<Credentials> {
    const url = 'login/';

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    const LoginDetails = {
      username: username,
      password: password
    };

    return this.http.post(url, LoginDetails, HttpOptions).pipe(
      map<any, Credentials>(responseData => ({
        username: username,
        token: responseData.token
      }))
    );
  }
}
