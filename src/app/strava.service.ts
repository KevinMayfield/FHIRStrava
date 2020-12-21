import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "./models/athlete";


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
          console.log(token.expires_at + ' in ' + token.expires_in);
      }
      headers = headers.append('Authorization', 'Bearer '+this.accesToken);
      return headers;
    }

  public getAthlete(): Observable<Athlete> {
    return this.http.get<Athlete>(this.url+'athlete',{'headers': this.getHeaders()});
  }
  public getActivities(): Observable<any> {
    return this.http.get<any>(this.url+'athlete/activities',{'headers': this.getHeaders()});
  }

  public authorise(routeUrl) {
    window.location.href = 'http://www.strava.com/oauth/authorize?client_id='+this.clientId+'&response_type=code&redirect_uri='+routeUrl+'/exchange_token&approval_prompt=force&scope=read,activity:read_all,profile:read_all';
  }

  public getAccessToken(authorisationCode) {
    /*
   curl -X POST https://www.strava.com/oauth/token \
 -F client_id=YOURCLIENTID \
 -F client_secret=YOURCLIENTSECRET \
 -F code=AUTHORIZATIONCODE \
 -F grant_type=authorization_code

    */
    let headers = new HttpHeaders(
    );

    /*
   headers = headers.append('client_id', this.clientId);
    headers = headers.append('client_secret', this.clientSecret);
    headers = headers.append('code', authorisationCode);
    headers = headers.append('grant_type', 'authorization_code');
*/
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
