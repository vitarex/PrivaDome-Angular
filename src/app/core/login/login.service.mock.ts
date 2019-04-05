import { Observable, of } from 'rxjs';
import { Credentials } from '@app/core';
import { Injectable } from '@angular/core';

/**
 * Provides the mock login function for testing and developement.
 */
@Injectable()
export class MockLoginService {
  /**
   * Get a token from the server.
   * @param {string} username Login username
   * @param {string} password Login password
   * @return {Observable<Credentials>} The user credentials.
   */
  login(username: string, password: string): Observable<Credentials> {
    return of({
      username: 'mockUsername',
      token: 'mockToken'
    });
  }
}
