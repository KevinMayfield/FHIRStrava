import {EventEmitter, Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { Hub, ICredentials } from '@aws-amplify/core'
import {JwtHelperService} from "@auth0/angular-jwt";
import {AuthenticatorService} from "@aws-amplify/ui-angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: boolean;

  private useIdToken = false;

  private accessToken = undefined;
  private idToken = undefined;

  private jwt = undefined;


  private refreshingToken = false;

  public currentUser: any = undefined;

  private _authState: Subject<any> = new Subject<any>();
  authState: Observable<any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';

  tokenChange: EventEmitter<any> = new EventEmitter();


  constructor( private awsService : AuthenticatorService) {
    console.log(awsService.authStatus);

    Hub.listen('auth',({ payload: { event, data } }) => {
      console.log(event);
      const { channel, payload } = data;
      if (channel === 'auth') {
        this._authState.next(payload.event);
      }
      switch (event) {
        case "signIn":

          this.isLoggedIn =true;
          break;
        case "signOut":
          this.isLoggedIn =false;
          break;
      }
    });
  }

  public signOut(): Promise<any> {
    this.isLoggedIn = false;
    return Auth.signOut()
      .then(() => this.isLoggedIn = false)
  }


  getAccessToken() {

    if (this.jwt != undefined) {
      var token: any = this.accessToken;
      const helper = new JwtHelperService();
      if (this.isTokenExpired(token)) {
        console.log('aws Token expired');
        this.getRefreshToken();
      }
    } else {
      this.getOAuth2AccessToken();
    }
  }

  public  getOAuth2AccessToken() {
    Auth.currentSession().then(res => {
      this.isLoggedIn = true;
      this.accessToken = res.getAccessToken()
      this.idToken = res.getIdToken()

    //  this.jwt = this.accessToken.getJwtToken()

      if (this.useIdToken) {
       // console.log(`myIdToken: ${JSON.stringify(this.idToken)}`)
        this.jwt = this.idToken.getJwtToken()
        this.tokenChange.emit(this.jwt);
      } else {
       // console.log(`myAccessToken: ${JSON.stringify(this.accessToken)}`)
        this.jwt = this.accessToken.getJwtToken()
        this.tokenChange.emit(this.jwt);
      }

   //   console.log(`myJwt: ${this.jwt}`)
    });
  }


  public getRefreshToken() {

    if (this.refreshingToken) return;
    this.refreshingToken = true;
    console.log('AWS Refresh Token');
    // See note below on AWS handling refresh internally
    this.getOAuth2AccessToken();

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


}
