import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {JwtHelperService} from "@auth0/angular-jwt";
import {PhrService} from "./phr.service";
import {DatePipe} from "@angular/common";
import {Obs} from "../models/obs";
import {FhirService} from "./fhir.service";
// @ts-ignore
import Bundle = fhir.Bundle;
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Coding = fhir.Coding;
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class WithingsService {

  private accessToken = undefined;

  private refreshingToken = false;

  url = 'https://wbsapi.withings.net';

  constructor(private http: HttpClient,
              private phr : PhrService,
              private fhir: FhirService,
              private datePipe: DatePipe,
              private auth: AuthService) { }

  clientId = 'e532209382d449afbb1ef360919f2fdac284fac62ec23feeea0589f043bdc41f';

  clientSecret = 'd026b695a4cacdd486ac15b2498d08d6432854679876e2c48ae6da043c00e04d';

  tokenChange: EventEmitter<any> = new EventEmitter();

  loaded: EventEmitter<any> = new EventEmitter();

  /*

  EXTERNAL API CALLS

   */

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


  public getObservations() {
    if (!this.hasAccessToken()) return;
    this.getAPIMeasures().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }

        this.processWithingsObs(result.body.measuregrps);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }



  getSleep() {
    if (!this.hasAccessToken()) return;
    this.getAPISleep().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }
        if (result.status == 403) {
          console.log('Withings 403 - Need to ask for permission');

        }
        this.processSleep(result);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }

  getDayActivity() {
    if (!this.hasAccessToken()) return;
    this.getAPIDayActivity().subscribe(
      result => {
        if (result.status == 401) {
          console.log('Withings 401');

        }
        this.processWorkout(result);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {

        }
      }
    );
  }

  /*

  PRE FHIR PROCESSING

   */
  processWithingsObs(measures) {
    if (measures === undefined) return;
    var observations: Obs[] = [];
    for (const grp of measures) {
      var date = new Date(+grp.date * 1000).toISOString();

      var obs: Obs = {
        'obsDate': new Date(date)
      }
      // console.log(obs);
      for (const measure of grp.measures) {
        switch (measure.type) {
          case 1:
            obs.weight = +measure.value / 1000;
            break;
          case 76:
            obs.muscle_mass = +measure.value / 100;
            break;
          case 5 :
            // free fat mass
            break;
          case 8:
            obs.fat_mass = +measure.value / 100;
            break;
          case 77:
            obs.hydration = +measure.value / 100;
            break;
          case 71:
            obs.bodytemp = +measure.value/1000;
            break;
          case 91:
            obs.pwv = +measure.value / 1000;
            break;
          case 9 :
            obs.diastolic = +measure.value / 1000;
            break;
          case 10 :
            obs.systolic = +measure.value / 1000;
            break;
        }
      }

      observations.push(obs);
    }

    this.loaded.emit(observations);
  }

  processWorkout(activityData) {

    return;

    /*
    THIS NEEDS SOME WORK

    IDEALLY GET DAY HEART RATE AVERAGE

    if (activityData === undefined || activityData.body === undefined) return;
    var observations: Obs[] = [];
    for (const activity of activityData.body.series) {
      var obs: Obs = {
        'obsDate': new Date(activity.date)
      }
      if (activity.data.manual_calories != undefined && activity.data.manual_calories > 0) {
        obs.calories =activity.data.manual_calories;
      }
      if (activity.data.duration != undefined) {
        obs.duration =activity.data.duration;
        console.log(obs.duration);
      }

      if (activity.data.steps != undefined) {
        obs.steps =activity.data.steps;
        obs.name = activity.data.steps + ' steps';
      }
      if (obs.name === undefined) {

      }
      // Should not be necessary as date range should prevent it
      if (obs.obsDate > this.phr.getFromDate()) observations.push(obs);
    }
    this.loaded.emit(observations);

     */
  }

  processSleep(sleepData) {
    if (sleepData === undefined || sleepData.body === undefined)  return;
    var observations: Obs[] = [];
    for (const sleep of sleepData.body.series) {
      var obs: Obs = {
        'obsDate': new Date(sleep.date)
      }
      if (sleep.data.durationtosleep != undefined) {
        obs.durationtosleep = sleep.data.durationtosleep;
      }
      if (sleep.data.deepsleepduration != undefined) {
        obs.deepsleepduration = sleep.data.deepsleepduration;
      }
      if (sleep.data.breathing_disturbances_intensity != undefined) {
        obs.breathing_disturbances_intensity = sleep.data.breathing_disturbances_intensity;
      }
      if (sleep.data.wakeupcount != undefined) {
        obs.wakeupcount = sleep.data.wakeupcount;
      }
      if (sleep.data.sleep_score != undefined) {
        obs.sleep_score = sleep.data.sleep_score;
      }
      if (sleep.data.remsleepduration != undefined) {
        obs.remsleepduration = sleep.data.remsleepduration;
      }
      if (sleep.data.lightsleepduration != undefined) {
        obs.lightsleepduration = sleep.data.lightsleepduration;
      }
      observations.push(obs);
    }
    this.loaded.emit(observations);
  }



  /*

  INTERNAL API CALLS

   */


  public getAPIDayActivity(offset? : number): Observable<any> {

    // Use the postman collection for details

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();

    var bodge= 'action=getintradayactivity'
      + '&data_field=calories,heart_rate,steps'
      + '&startdate='+Math.floor(this.phr.getFromDate().getTime()/1000)
      + '&enddate='+Math.floor(this.phr.getToDate().getTime()/1000);
    //  + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000);
    if (offset != undefined) {
      bodge= bodge + '&offset='+Math.floor(offset);
    }

    return this.http.post<any>(this.url+'/v2/measure', bodge, { 'headers' : headers} );
  }



  private getAPIMeasures(): Observable<any> {

    // Use the postman collection for details

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();

    var bodge= 'action=getmeas'
      + '&meastypes=1,5,8,77,76,88,91,9,10,71'
      + '&category=1'
      + '&startdate='+Math.floor(this.phr.getFromDate().getTime()/1000)
      + '&enddate='+Math.floor(this.phr.getToDate().getTime()/1000);
     // + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000);

    return this.http.post<any>(this.url+'/measure', bodge, { 'headers' : headers} );

  }

  private getAPISleep(): Observable<any> {

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();

    var bodge= 'action=getsummary'
      + '&startdateymd='+this.datePipe.transform(this.phr.getFromDate(),"yyyy-MM-dd")
      + '&enddateymd='+ this.datePipe.transform(this.phr.getToDate(),"yyyy-MM-dd")
      //+ '&lastupdate='+Math.floor(lastUpdate.getTime()/1000)
      + '&data_fields=breathing_disturbances_intensity,deepsleepduration,lightsleepduration,wakeupcount,durationtosleep,sleep_score,remsleepduration';

    return this.http.post<any>(this.url+'/v2/sleep', bodge, { 'headers' : headers} );

  }

  /*

  FHIR CONVERSIONS


   */


  private updateFHIRServer(observations : Obs[]) {
    var bundle : Bundle = {
      entry: []
    };
    for (const obs of observations) {

      if (obs.weight !== undefined) {
        var fhirWeight = this.getObservation(bundle, obs, true, '27113001', 'Body weight', obs.weight, 'kg');

        // Makes sense to make this a component
        if (obs.muscle_mass !== undefined) {
          this.addComponent(fhirWeight, 'http://loinc.org', '73964-9', 'Body muscle mass', obs.muscle_mass, 'kg')
        }
        if (obs.fat_mass !== undefined) {
          this.addComponent(fhirWeight, 'http://loinc.org', '73708-0', 'Body fat [Mass] Calculated', obs.fat_mass, 'kg')
        }
        if (obs.hydration !== undefined) {
          this.addComponent(fhirWeight, 'http://loinc.org', '73706-4', 'Extracellular fluid [Volume] Measured', obs.hydration, 'kg')
        }

      }
      if (obs.bodytemp !== undefined) {
        this.getObservation(bundle, obs, true, '386725007', 'Body temperature', obs.bodytemp, 'C');
      }

      if (obs.remsleepduration != undefined && obs.lightsleepduration != undefined && obs.deepsleepduration != undefined) {
        var fhirBP= this.getObservation(bundle,obs,false,'93832-4','Sleep duration',  (obs.remsleepduration + obs.lightsleepduration + obs.deepsleepduration) / 3600 ,"h" );
        if (obs.sleep_score != undefined) {
          this.addComponent(fhirBP,'http://withings.com/data_fields','sleep_score','Sleep Score',obs.sleep_score,'score');
          this.addComponent(fhirBP,'http://withings.com/data_fields','remsleepduration','Rem Sleep Duration',(obs.remsleepduration) / 3600,'h');
          this.addComponent(fhirBP,'http://withings.com/data_fields','lightsleepduration','Light Sleep Duration',(obs.lightsleepduration) / 3600,'h');
          this.addComponent(fhirBP,'http://withings.com/data_fields','deepsleepduration','Deep Sleep Duration',(obs.deepsleepduration) / 3600,'h');
        }
      }

      if (obs.diastolic !== undefined && obs.systolic != undefined) {
        // Seems withings changed data structure around sept 2017
        if (obs.diastolic < 1) obs.diastolic = obs.diastolic * 1000;
        if (obs.systolic < 1) obs.systolic = obs.systolic * 1000;
        var fhirBP= this.getObservation(bundle,obs,true,'75367002','Blood pressure'  );
        this.addComponent(fhirBP,'http://snomed.info/sct','72313002','Systolic arterial pressure',obs.systolic,'mmHg');
        this.addComponent(fhirBP,'http://snomed.info/sct', '1091811000000102','Diastolic arterial pressure',obs.diastolic,'mmHg');
      }
      if (obs.pwv != undefined) {
        this.getObservation(bundle,obs,false, '77196-4','Pulse wave velocity', obs.pwv, 'm/s'  )
      }
    }
    if (bundle.entry.length> 0) this.fhir.postTransaction(bundle);
  }

  private addComponent(fhirObs: Observation,codeSystem, code: string, display, value, unit: string){
    if (fhirObs.component === undefined) fhirObs.component = [];

    var coding : Coding = {

      system: codeSystem,
      code: code,
      display: display
    }
    fhirObs.component.push({
      code : {
        coding : [
          coding
        ]
      },
      valueQuantity: {
        value: value,
        unit: unit,
        system: 'http://unitsofmeasure.org'
      }
    });
  }

  private getObservation(bundle: Bundle, obs: Obs, snomed : boolean, code: string, display, value?, unit?: string) : Observation {
    var fhirObs :Observation = {
      resourceType: 'Observation'
    };
    fhirObs.identifier = [
      {
        system: 'https://fhir.withings.com/Id',
        value: code + '-'+this.datePipe.transform(obs.obsDate,"yyyyMMddhhmm")
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

   SECURITY BLOCK

   */

  connect() {
    var token = this.getAccessToken();
    if (token != undefined) this.tokenChange.emit(token);

    this.loaded.subscribe(result => {
      this.updateFHIRServer(result);
    })
  }

  getAccessToken() {
    if (localStorage.getItem('withingsToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('withingsToken'));

      const helper = new JwtHelperService();
      if (this.isTokenExpired(token)) {

        console.log('withings Token expired');
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

    if (this.refreshingToken) return;
    this.refreshingToken = true;
    console.log('refreshing token');
    let headers = new HttpHeaders(
    );
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers = headers.append('Access-Control-Allow-Origin', '*');
    headers = headers.append("Authorization", "Bearer "+localStorage.getItem('awsToken'));
    var token: any = JSON.parse(localStorage.getItem('withingsToken'));


    var url = this.phr.serviceUrl + '/services/token';


    var bodge= 'grant_type=refresh_token'
      + '&client_id=' + this.clientId
      + '&client_secret=' + this.clientSecret
      + '&refresh_token=' + token.refresh_token;

    this.http.post<any>(url, bodge, { 'headers' : headers} ).subscribe(
      token => {
        console.log('Withings refreshed token');
        this.setAccessToken(token);
        this.refreshingToken = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public getOAuth2AccessToken(authorisationCode) {

    let headers = new HttpHeaders(
    );
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');
    headers = headers.append("Authorization", "Bearer "+localStorage.getItem('awsToken'));

    var url = this.phr.serviceUrl + '/services/token';

    var bodge= 'grant_type=authorization_code'
      + '&client_id=' + this.clientId
      + '&client_secret=' + this.clientSecret
      + '&redirect_uri=' + localStorage.getItem('appRoute')+'\withings'
      + '&code=' + authorisationCode;



    this.http.post<any>(url, bodge, { 'headers' : headers} ).subscribe(
      token => {
        console.log('withings Access Token')
        this.setAccessToken(token);
      }
    );
  }

  private hasAccessToken() : boolean {

    if (this.accessToken !== undefined) return true;
    return false;
  }



  private getTokenExpirationDate(
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

  private isTokenExpired(
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




}
