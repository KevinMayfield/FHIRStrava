import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "../models/athlete";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class WithingsService {

  private accessToken = undefined;

  url = 'https://wbsapi.withings.net';

  constructor(private http: HttpClient) { }

  clientId = 'e532209382d449afbb1ef360919f2fdac284fac62ec23feeea0589f043bdc41f';

  clientSecret = 'd026b695a4cacdd486ac15b2498d08d6432854679876e2c48ae6da043c00e04d';

  tokenChange: EventEmitter<any> = new EventEmitter();

  public authorise(routeUrl : string) {
    if (routeUrl.substring(routeUrl.length - 1,1) === '/') {
      routeUrl = routeUrl.substring(0, routeUrl.length - 1);
    }


    localStorage.setItem('appRoute', routeUrl);
    window.location.href = 'https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id='
      +this.clientId
      + '&redirect_uri=' +routeUrl+'\withings'
      +'&state=12345'
      +'&scope=user.metrics,user.activity';
  }


  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Authorization', 'Bearer '+this.getAccessToken());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  setAccessToken(token) {
    var date = new Date
    // Create an expires at ..... don't know when we got the token
    token.expires_at = Math.round((new Date().valueOf())/1000) + token.expires_in;
    localStorage.setItem('withingsToken', JSON.stringify(token));
    this.accessToken = token.access_token;
    this.tokenChange.emit(token);
  }



  public logout() {
    localStorage.removeItem('withingsToken');
  }

  public getRefreshToken() {

    let headers = new HttpHeaders(
    );
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');
    var token: any = JSON.parse(localStorage.getItem('withingsToken'));

    // var url = 'https://account.withings.com/oauth2/token';
    var url = 'http://localhost:8187/services/token';
    //  var url = 'https://wbsapi.withings.net/v2/oauth2'

    var bodge= 'grant_type=refresh_token'
      + '&client_id=' + this.clientId
      + '&client_secret=' + this.clientSecret
      + '&refresh_token=' + token.refresh_token;

    this.http.post<any>(url, bodge, { 'headers' : headers} ).subscribe(
      token => {
        this.setAccessToken(token);
      }
    );
  }

  public getOAuth2AccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');


  // var url = 'https://account.withings.com/oauth2/token';
    var url = 'http://localhost:8187/services/token';
 //  var url = 'https://wbsapi.withings.net/v2/oauth2'

    var bodge= 'grant_type=authorization_code'
    + '&client_id=' + this.clientId
    + '&client_secret=' + this.clientSecret
    + '&redirect_uri=' + localStorage.getItem('appRoute')+'\withings'
    + '&code=' + authorisationCode;



    this.http.post<any>(url, bodge, { 'headers' : headers} ).subscribe(
      token => {
        this.setAccessToken(token);
      }
    );
  }

  public getMeasures(): Observable<any> {

    // Use the postman collection for details

    let headers = this.getHeaders();

    var lastUpdate = new Date('2020-07-14');

    var bodge= 'action=getmeas'
      + '&meastypes=1,5,8,77,76,88,91'
      + '&category=1'
     // + '&startdate=2020-12-12'
     // + '&enddate=2020-12-22';
      + '&lastupdate='+Math.floor(lastUpdate.getTime())/1000;



    return this.http.post<any>(this.url+'/measure', bodge, { 'headers' : headers} );

  }

  public getSleep(): Observable<any> {

    let headers = this.getHeaders();

    var lastUpdate = new Date('2020-07-14');

    var bodge= 'action=getsummary'
      + '&lastupdate='+Math.floor(lastUpdate.getTime())/1000
    + '&data_fields=breathing_disturbances_intensity,deepsleepduration,lightsleepduration,wakeupcount,durationtosleep,sleep_score,remsleepduration';



    return this.http.post<any>(this.url+'/v2/sleep', bodge, { 'headers' : headers} );

  }
  connect() {
    var token = this.getAccessToken();
    if (token != undefined) this.tokenChange.emit(token);
  }
  getAccessToken() {
    if (localStorage.getItem('withingsToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('withingsToken'));

      const helper = new JwtHelperService();
      if (this.isTokenExpired(token)) {
        this.accessToken = undefined;
       // this.getRefreshToken();
        return undefined;
      }
      if (token != undefined) {
        this.accessToken = token.access_token;
        return this.accessToken;
      }
    }
    return undefined;
  }

  public getTokenExpirationDate(
    decoded: any
  ): Date | null {

    if (!decoded || !decoded.hasOwnProperty("expires_at")) {
      // Invalid format
      localStorage.removeItem('withingsToken');
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.expires_at);

    return date;
  }

  public isTokenExpired(
    token: any,
    offsetSeconds?: number
  ): boolean {
    if (!token || token === "") {
      return true;
    }
    const date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;

    console.log('withings expiry date '+date);
    if (date === null) {
      return false;
    }

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }


}
