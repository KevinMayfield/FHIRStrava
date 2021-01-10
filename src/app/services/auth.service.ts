import {EventEmitter, Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { Hub, ICredentials } from '@aws-amplify/core'
import {HttpHeaders} from "@angular/common/http";
import {A} from "@angular/cdk/keycodes";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: boolean;

  public currentUser: any = undefined;

  private _authState: Subject<any> = new Subject<any>();
  authState: Observable<any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';

  tokenChange: EventEmitter<any> = new EventEmitter();

  clientId = '8536';

  clientSecret = '6c34eb8997791f315f2f4d9c932a01a903f6beaa';

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
      .then(() => this.isLoggedIn = false)
  }

  googleSocialSignIn():Promise<ICredentials> {
    console.log("googleSocialSignIn");
    return Auth.federatedSignIn({
      'provider': CognitoHostedUIIdentityProvider.Google
    });
  }

  public getOAuth2AccessToken(authorisationCode) {
    Auth.currentSession().then(data => {
      console.log(data);
      this.isLoggedIn = true;
      Auth.currentUserInfo().then(result => {
        this.currentUser = result;
        console.log(result);
        console.log(result.username);
        this.tokenChange.emit(result);
      })

    });
  }
}
