import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "../models/athlete";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class WithingsService {

  accesToken = undefined;

  url = 'https://wbsapi.withings.net/measure';

  constructor(private http: HttpClient) { }

  clientId = 'e532209382d449afbb1ef360919f2fdac284fac62ec23feeea0589f043bdc41f';

  clientSecret = 'd026b695a4cacdd486ac15b2498d08d6432854679876e2c48ae6da043c00e04d';

  public authorise(routeUrl : string) {
    if (routeUrl.substring(routeUrl.length - 1,1) === '/') {
      routeUrl = routeUrl.substring(0, routeUrl.length - 1);
    }


    localStorage.setItem('appRoute', routeUrl);
    window.location.href = 'https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id='+this.clientId+ '&redirect_uri='+routeUrl+'\withings&state=12345&scope=user.metrics';
  }


  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );
    if (localStorage.getItem('withingsToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('withingsToken'));

      const helper = new JwtHelperService();
     // console.log('Token ' + token);
      console.log('withings token expiry ' + this.isTokenExpired(token));
    }
    headers = headers.append('Authorization', 'Bearer '+this.accesToken);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  public getAccessToken(authorisationCode) {

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



    return this.http.post<any>(url, bodge, { 'headers' : headers} );
  }

  public getWeight(): Observable<any> {

    /*
    curl --data "action=getmeas
    &Authorization=Authorization
    &meastype=meastype&meastypes=meastypes&category=category&startdate=startdate&enddate=enddate&offset=offset&lastupdate=integer" 'https://wbsapi.withings.net/measure'
    */

    let headers = this.getHeaders();

    var lastUpdate = new Date('2020-07-14');

    var bodge= 'action=getmeas'
      + '&meastypes=1,5,8,77,76,88,91'
      + '&category=1'
     // + '&startdate=2020-12-12'
     // + '&enddate=2020-12-22';
      + '&lastupdate='+Math.floor(lastUpdate.getTime())/1000;



    return this.http.post<any>(this.url, bodge, { 'headers' : headers} );

  }

  public getTokenExpirationDate(
    decoded: any
  ): Date | null {

    if (!decoded || !decoded.hasOwnProperty("exp")) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

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
