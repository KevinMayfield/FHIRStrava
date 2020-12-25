import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "../models/athlete";



@Injectable({
  providedIn: 'root'
})
export class StravaService {

  url = 'https://www.strava.com/api/v3/';

  private accessToken = undefined;

  private athlete = undefined;

  clientId = '8536';

  clientSecret = '6c34eb8997791f315f2f4d9c932a01a903f6beaa';

  tokenChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) { }

  getHeaders() : HttpHeaders {

      let headers = new HttpHeaders(
      );

      headers = headers.append('Authorization', 'Bearer '+this.getAccessToken());
      return headers;
    }

  public getAthlete(): Observable<Athlete> {
    return this.http.get<Athlete>(this.url+'athlete',{'headers': this.getHeaders()});
  }

  public getActivities(page?): Observable<any> {
    var uri = this.url+'athlete/activities';

    var lastUpdate = new Date('2020-07-14');
    uri = uri + '?after='+Math.floor(lastUpdate.getTime()/ 1000)+'per_page=30';

    if (page !== undefined) {
      uri = uri +'&page='+page;
    }
    return this.http.get<any>(uri,{'headers': this.getHeaders()});
  }

  public authorise(routeUrl) {
    window.location.href = 'http://www.strava.com/oauth/authorize?client_id='+this.clientId+'&response_type=code&redirect_uri='+routeUrl+'/exchange_token&approval_prompt=force&scope=read,activity:read_all,profile:read_all';
  }

  setAccessToken(token) {
    localStorage.setItem('stravaToken', JSON.stringify(token));
    this.accessToken = token.access_token;
    this.tokenChange.emit(token);
  }

  connect() {
    var token = this.getAccessToken();
    if (token != undefined) this.tokenChange.emit(token);
  }
  getAccessToken() {

    if (localStorage.getItem('stravaToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('stravaToken'));

      if (this.isTokenExpired(token)) {
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      }
      if (token != undefined) {
        this.accessToken = token.access_token;
        return this.accessToken;
      }
    }
    return undefined;
  }

  public getRefreshToken() {
    console.log('Strava token expired');
    var token: any = JSON.parse(localStorage.getItem('stravaToken'));
    let headers = new HttpHeaders(
    );

    var url = 'https://www.strava.com/oauth/token' +
      '?client_id='+this.clientId +
      '&client_secret='+this.clientSecret +
      '&refresh_token='+token.refresh_token +
      '&grant_type=refresh_token';

    return this.http.post<any>(url,{'headers': headers}).subscribe(
      token => {
        this.setAccessToken(token);
      },
      (err) => {
          console.log('Strava Refresh Error: '+err);
      }
    );
  }

  public getOAuth2AccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );

    var url = 'https://www.strava.com/oauth/token' +
      '?client_id='+this.clientId +
      '&client_secret='+this.clientSecret +
      '&code='+authorisationCode +
      '&grant_type=authorization_code';

    this.http.post<any>(url,{'headers': headers}).subscribe(
      token => {
        this.setAccessToken(token);
      },
      (err) => {
        console.log('Strava Access Error: '+err);
      }
    );
  }

  logout(){
    localStorage.removeItem('stravaToken')
  }

  public getTokenExpirationDate(
    decoded: any
  ): Date | null {

    if (!decoded || !decoded.hasOwnProperty("expires_at")) {
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
    if (date === null) {
      return false;
    }
    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

}
