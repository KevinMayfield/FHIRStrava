import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PhrService} from "./phr.service";
import {Observable} from "rxjs";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class IhealthService {

  /// Web https://developer.ihealthlabs.eu/index.html

  clientId = '5b2b8d7fb66744c8951be697f34a4948';
  clientSecret = '8bf97e5cbd1f406dbbe6a0848d2f1974';
  //clientId = 'c4ffde29e84b4deca55dcdfc5f803983';

  url= 'https://openapi.ihealthlabs.eu/openapiv2/';

  tokenChange: EventEmitter<any> = new EventEmitter();

  private accessToken = undefined;

  private userID = undefined;

  private refreshingToken = false;

  iHealthChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService,
              ) { }

  getSpO2() {
    if (!this.hasAccessToken()) return;
    this.getAPISPO2().subscribe(
      result => {
        if (result.status == 401) {
          console.log('iHealth 401');

        }

    //    this.processWithingsObs(result.body.measuregrps);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }


  private getAPISPO2(): Observable<any> {

    // Use the postman collection for details

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();
    var accessToken = this.getAccessToken();
    var routeUrl = localStorage.getItem('appRoute');

    var url = this.url + 'user/'+this.userID+'/spo2.json/';
    url = url + '?client_id='+this.clientId
    + '&client_secret='+this.clientSecret
    + '&redirect_uri=' +routeUrl+'\ihealth' +
    + '&access_token=' + accessToken
    + '&start_time=1342005726'
      + '&end_time=1405077726&page_index=1'


    return this.http.get<any>(url,  { 'headers' : headers} );

  }
              /*
              Get Data

              https://openapi.ihealthlabs.eu/openapiv2/user/05dffbe0dd..../spo2.json/?client_id=ddb9cbc759*****&client_secret=4738f9d00e*****
              &redirect_uri=http%3a%2f%2f+yourcallback.com%2f%3fthis%3dthat
              &access_token=xpoBt0ThQQ*****
              &start_time=1342005726
              &end_time=1405077726&page_index=1&sc=d63493704c*****
&sv=88f34288d5*****

               */



  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }


  /*
  SECURITY
   */

  connect() {
    var token = this.getAccessToken();
    if (token != undefined) this.tokenChange.emit(token);

  }
  getAccessToken() {
    if (localStorage.getItem('iHealthToken') != undefined) {
    //  console.log('iHealth Access Token present')
      var token: any = JSON.parse(localStorage.getItem('iHealthToken'));

      const helper = new JwtHelperService();
      /*
      if (this.isTokenExpired(token)) {

        console.log('withings Token expired');
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      }*/
      if (token != undefined) {
        this.accessToken = token.AccessToken;
      //  console.log('iHealth token is '+this.accessToken);
        this.userID = token.userID;
        return this.accessToken;
      }
    }
    return undefined;
  }
  /*
  *
  * Authorise
  *  */

  private hasAccessToken() : boolean {

    if (this.accessToken !== undefined) return true;
    return false;
  }
  authorise(routeUrl: string) {
    if (routeUrl.substring(routeUrl.length - 1,1) === '/') {
      routeUrl = routeUrl.substring(0, routeUrl.length - 1);
    }

    localStorage.setItem('appRoute', routeUrl);
    window.location.href = 'https://oauthuser.ihealthlabs.eu/OpenApiV2/OAuthv2/userauthorization'
      + '?response_type=code'
      + '&client_id=' +this.clientId
      + '&redirect_uri=' +routeUrl+'\ihealth'
      + '&APIName=OpenApiSpO2';

  }

  getHeadersText() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'text/html');
    return headers;
  }

  public postCSVFile(body : any) {

    let headers = this.getHeadersText();

    var lastUpdate = this.phr.getFromDate();


    return this.http.post<any>(this.phr.serviceUrl+ '/services/ihealth', body, { 'headers' : headers} ).subscribe(result => {
      this.iHealthChange.emit(result);
    });

  }

  /* OAuth2

  *
   */
  public getOAuth2AccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );

    var routeUrl = localStorage.getItem('appRoute');

    var url = this.phr.serviceUrl + '/services/ihealth/token';
    url = url +'?client_id='+this.clientId +
      '&client_secret='+this.clientSecret +
      '&grant_type=authorization_code' +
      '&redirect_uri=' +routeUrl+'\ihealth' +
      '&code='+authorisationCode;



    this.http.post<any>(url,'',{'headers': headers}).subscribe(
      token => {
        this.setAccessToken(token);
      },
      (err) => {
        console.log('iHealth Access Error: '+err);
      }
    );
  }

  setAccessToken(token) {
    localStorage.setItem('iHealthToken', JSON.stringify(token));
    this.accessToken = token.access_token;
    this.tokenChange.emit(token);
  }
}
