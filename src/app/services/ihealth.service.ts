import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PhrService} from "./phr.service";
import {Observable} from "rxjs";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Obs} from "../models/obs";
// @ts-ignore
import Bundle = fhir.Bundle;
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Coding = fhir.Coding;
import {FhirService} from "./fhir.service";
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class IhealthService {

  /// Web https://developer.ihealthlabs.eu/index.html

  clientId = '5b2b8d7fb66744c8951be697f34a4948';
  clientSecret = '8bf97e5cbd1f406dbbe6a0848d2f1974';
  //clientId = 'c4ffde29e84b4deca55dcdfc5f803983';

  loaded: EventEmitter<any> = new EventEmitter();

  tokenChange: EventEmitter<any> = new EventEmitter();

  private accessToken = undefined;

  private userID = undefined;

  private refreshingToken = false;

  iHealthChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService,
              private  fhir : FhirService,
              private datePipe: DatePipe
              ) { }

  getSpO2() {
    if (!this.hasAccessToken()) return;
    this.getAPISPO2().subscribe(
      result => {
        if (result.status == 401) {
          console.log('iHealth 401');
        }
        if (result.NextPageUrl != undefined) {
          console.log(result.NextPageUrl);
        }
       this.processObs(result.BODataList);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }
  processObs(measures) {
    if (measures === undefined) return;
    var observations: Obs[] = [];
    for (const grp of measures) {
     // console.log(grp);
      var date = new Date(+grp.MDate * 1000).toISOString();
      var obs: Obs = {
        'obsDate': new Date(date)
      }
      if (grp.BO != undefined) {
        obs.spo2 = grp.BO;
      }
      if (grp.HR != undefined) {
        obs.heartrate = grp.HR;
      }
      if (grp.DataID != undefined) {
        obs.identifierValue = grp.DataID;
      }
      observations.push(obs);
    }
    this.loaded.emit(observations);
  }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  /*
  FHIR
   */
  private updateFHIRServer(observations : Obs[]) {
    console.log('iHealth FHIR Update');
    var bundle : Bundle = {
      entry: []
    };
    for (const obs of observations) {

      if (obs.spo2 !== undefined) {
        this.getObservation(bundle, obs, true, '103228002', 'Blood oxygen saturation', obs.spo2, '%');
      }
    }
    if (bundle.entry.length> 0) this.fhir.postTransaction(bundle);
  }


  private getObservation(bundle: Bundle, obs: Obs, snomed : boolean, code: string, display, value?, unit?: string) : Observation {
    var fhirObs :Observation = {
      resourceType: 'Observation'
    };
    fhirObs.identifier = [
      {
        system: 'https://fhir.ihealth.eu/Id',
        value: code + '-'+obs.identifierValue
      }
    ]
    if (snomed) {
      fhirObs.code = {
        coding : [{
          system: 'http://snomed.info/sct',
          code: code,
          display: display
        }
        ]
      };
    } else {
      fhirObs.code = {
        coding : [{
          system: 'http://loinc.org',
          code: code,
          display: display
        }
        ]
      };
    }
    fhirObs.effectiveDateTime = obs.obsDate.toISOString();
    if (value != undefined && unit != undefined) {
      fhirObs.valueQuantity = {
        value: value,
        unit: unit,
        system: 'http://unitsofmeasure.org'
      }
    }
    //console.log(fhirObs);
    bundle.entry.push({
      resource : fhirObs
    })
    return fhirObs;
  }


  /*
  SECURITY
   */

  connect() {
    var token = this.getAccessToken();
    if (token != undefined) this.tokenChange.emit(token);
    this.loaded.subscribe(result => {
      this.updateFHIRServer(result);
    })

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
        this.userID = token.UserID;
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

  /* OAuth2

  *
   */

  private getAPISPO2(): Observable<any> {

    // Use the postman collection for details

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();
    var accessToken = this.getAccessToken();
    var routeUrl = localStorage.getItem('appRoute');

    // Jeez the sc and sv come from api registration.

    var url = this.phr.serviceUrl + '/services/ihealth/user/'+this.userID+'/spo2.json/';
    url = url +  '?client_id='+this.clientId
      + '&client_secret='+this.clientSecret
      + '&redirect_uri=' +(routeUrl+'\ihealth')
      + '&access_token=' + accessToken
      + '&sc=8c2c1eaa194141028b1e8de8c4b6ee87'
      + '&sv=1c1cc31a951e4b198fa7962c6d8c7c95'
      + '&locale=en_UK'
    //  + '&page_index=1'
       + '&start_time='+Math.floor(this.phr.getFromDate().getTime()/1000)
      + '&end_time=' +Math.floor(this.phr.getToDate().getTime()/1000);



    return this.http.get<any>(url,  { 'headers' : headers} );

  }



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
