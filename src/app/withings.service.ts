import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class WithingsService {

  accesToken = undefined;



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

  public getAccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');


  // var url = 'https://account.withings.com/oauth2/token';
    var url = 'http://localhost:8187/services/token';
 //  var url = 'https://wbsapi.withings.net/v2/oauth2'

/*
    const body = new HttpParams();
    //body.set('action', 'requesttoken');
    body.set('grant_type', 'authorization_code');
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('redirect_uri',localStorage.getItem('appRoute')+'\withings');
    body.set('code',authorisationCode);
    console.log(body.toString());


    const form = new FormData();
    //body.set('action', 'requesttoken');
    form.append('grant_type', 'authorization_code');
    form.append('client_id', this.clientId);
    form.append('client_secret', this.clientSecret);
    form.append('redirect_uri',localStorage.getItem('appRoute')+'\withings');
    form.append('code',authorisationCode);
    console.log(form.toString());
*/
    var bodge= 'grant_type=authorization_code'
    + '&client_id=' + this.clientId
    + '&client_secret=' + this.clientSecret
    + '&redirect_uri=' + localStorage.getItem('appRoute')+'\withings'
    + '&code=' + authorisationCode;

    console.log(bodge);

    return this.http.post<any>(url, bodge, { 'headers' : headers} );
  }

}
