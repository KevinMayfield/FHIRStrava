import {EventEmitter, Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { Hub, ICredentials } from '@aws-amplify/core'
import {HttpHeaders} from "@angular/common/http";
import {A} from "@angular/cdk/keycodes";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: boolean;

  private accessToken = undefined;

  private refreshingToken = false;

  public currentUser: any = undefined;

  private _authState: Subject<any> = new Subject<any>();
  authState: Observable<any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';

  tokenChange: EventEmitter<any> = new EventEmitter();


  constructor() {
    Hub.listen('auth',(data) => {
      console.log(data);
      const { channel, payload } = data;
      if (channel === 'auth') {
        this._authState.next(payload.event);
      }
    });
  }

  public signOut(): Promise<any> {
    return Auth.signOut()
      .then(() => this.isLoggedIn = false)
  }

  googleSocialSignIn():Promise<ICredentials> {
    console.log("googleSocialSignIn");
    return Auth.federatedSignIn({
      'provider': CognitoHostedUIIdentityProvider.Google
    });
  }

  getAccessToken() {
    if (localStorage.getItem('awsToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('awsToken'));

      const helper = new JwtHelperService();
      if (this.isTokenExpired(token)) {

        console.log('aws Token expired');
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      }
      if (token != undefined) {
        this.accessToken = token.jwtToken;
        return this.accessToken;

      }
    }
    return undefined;
  }

  public getRefreshToken() {

    if (this.refreshingToken) return;
    this.refreshingToken = true;
    console.log('refreshing token');
    try {
     Auth.currentAuthenticatedUser().then(cognitoUser => {
       Auth.currentSession().then(currentSession => {
         cognitoUser.refreshSession(currentSession.getRefreshToken(), (err, session) => {
           console.log('new aws session', err, session);
           this.refreshingToken = false;
           const { idToken, refreshToken, accessToken } = session;
         });
       })
     });
    } catch (e) {
      console.log('Unable to refresh Token', e);
      this.refreshingToken = false;
    }
  }

  private isTokenExpired(
    token: any,
    offsetSeconds?: number
  ): boolean {
    if (!token || token === "") {
      return true;
    }
    const date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;

    console.log('aws expiry date '+date);
    if (date === null) {
      return false;
    }

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

  private getTokenExpirationDate(
    decoded: any
  ): Date | null {

    const date = new Date(0);
    date.setUTCSeconds(decoded.payload.exp);

    return date;
  }

  public getOAuth2AccessToken(authorisationCode) {
    Auth.currentSession().then(res => {
      console.log(res);
      this.isLoggedIn = true;
        let accessToken = res.getAccessToken();
        localStorage.setItem('awsToken', JSON.stringify(accessToken));


      Auth.currentUserInfo().then(result => {
        this.currentUser = result;
        console.log('Auth have current user');
        this.tokenChange.emit(result);
      })

    });
  }
}
