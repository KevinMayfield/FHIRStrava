import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { Hub, ICredentials } from '@aws-amplify/core'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: boolean;

  private _authState: Subject<any> = new Subject<any>();
  authState: Observable<any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';

  constructor() {
    Hub.listen('auth',(data) => {
      console.log(data);
      const { channel, payload } = data;
      if (channel === 'auth') {
        this._authState.next(payload.event);
      }
    });
  }

  signOut(): Promise<any> {
    return Auth.signOut()
      .then(() => this.loggedIn = false)
  }

  googleSocialSignIn():Promise<ICredentials> {
    console.log("googleSocialSignIn");
    return Auth.federatedSignIn({
      'provider': CognitoHostedUIIdentityProvider.Google
    });
  }

}
