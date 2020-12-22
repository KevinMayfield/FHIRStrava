import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "./models/athlete";
import {last} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class StravaService {

  url = 'https://www.strava.com/api/v3/';

  accesToken = undefined;

  clientId = '8536';

  clientSecret = '6c34eb8997791f315f2f4d9c932a01a903f6beaa';

  constructor(private http: HttpClient) { }

  getHeaders() : HttpHeaders {

      let headers = new HttpHeaders(
      );
      if (localStorage.getItem('accessToken') != undefined) {
          var token: any = JSON.parse(localStorage.getItem('accessToken'));
          console.log('strava token ' + token.expires_at + ' in ' + token.expires_in);
      }
      headers = headers.append('Authorization', 'Bearer '+this.accesToken);
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

  public getAccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );

    var url = 'https://www.strava.com/oauth/token' +
      '?client_id='+this.clientId +
      '&client_secret='+this.clientSecret +
      '&code='+authorisationCode +
      '&grant_type=authorization_code';

    return this.http.post<any>(url,{'headers': headers});
  }

  logout(){
    localStorage.removeItem('accessToken')
  }

}
