import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Athlete} from "../models/athlete";
import {PhrService} from "./phr.service";
import {SummaryActivity} from "../models/summary-activity";

// @ts-ignore
import Bundle = fhir.Bundle;
// @ts-ignore
import Observation = fhir.Observation;
import {FhirService} from "./fhir.service";
// @ts-ignore
import Coding = fhir.Coding;
// @ts-ignore
import DiagnosticReport = fhir.DiagnosticReport;



@Injectable({
  providedIn: 'root'
})
export class StravaService {

  url = 'https://www.strava.com/api/v3/';

  private accessToken = undefined;

  private refreshingToken = false;

  private athlete : Athlete = undefined;

  loaded: EventEmitter<any> = new EventEmitter();

  activities: SummaryActivity[] = [];
  activityMap = new Map();


  tokenChange: EventEmitter<any> = new EventEmitter();


  athleteChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService) {
  }


      /*


      API Calls

       */


  getHeaders() : HttpHeaders {

      let headers = new HttpHeaders(
      );

      headers = headers.append('Authorization', 'Bearer '+this.getAccessToken());
      return headers;
    }

  public getAthlete(): Observable<Athlete> {
    return this.http.get<Athlete>(this.url+'athlete',{'headers': this.getHeaders()});
  }

  public setAthlete(athlete : Athlete) {
     this.athlete = athlete;
     this.athleteChange.emit(athlete);
  }



  processStravaObs(result) {
    // Filters out duplcates
    for (const activity of result) {
      var date = new Date(activity.start_date).toISOString();
      activity.intensity = this.intensity(activity.weighted_average_watts);
      if (this.activityMap.get(activity.id) == undefined) {
        this.activityMap.set(activity.id, activity);
        this.activities.push(activity);
      } else {
        console.log('Duplicate Id = ' + this.activityMap.get(activity.id))
      }
    }
  }

  intensity(pwr) {
    if (pwr != +pwr) return '';
    if (this.athlete.ftp == undefined) return '';

    return Math.round((pwr / this.athlete.ftp) * 100);
  }

  getActivities(page?) {
    if (page === undefined) {
      this.activities = [];
      this.activityMap = new Map();
    }
    this.getStravaActivities(page).subscribe(
      result => {
        if (page == undefined) page = 0;
        page++;
        this.processStravaObs(result);
        if (result.length > 0) {
          this.getActivities(page)
        } else {
          this.loaded.emit(true)
        };
      },
      (err) => {
        console.log('STRAVA Error - '+ err);
        console.log(err);
        if (err.status == 401) {
          this.loaded.emit(false)
        }
      }
    );
  }

  public getStravaActivities(page?): Observable<any> {
    var uri = this.url+'athlete/activities';

    uri = uri + '?before='+Math.floor(this.phr.getToDate().getTime()/ 1000)
      +'&after='+Math.floor(this.phr.getFromDate().getTime()/ 1000)
      +'&per_page=30';

    if (page !== undefined) {
      uri = uri +'&page='+page;
    }
    return this.http.get<any>(uri,{'headers': this.getHeaders()});
  }



  /*

  OAUTH2

   */


  public authorise(routeUrl) {
    window.location.href = 'http://www.strava.com/oauth/authorize?client_id='+this.phr.getClients().strava.client_id+'&response_type=code&redirect_uri='+routeUrl+'/exchange_token&approval_prompt=force&scope=read,activity:read_all,profile:read_all';
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
    if (this.refreshingToken) return;
    this.refreshingToken = true;
    console.log('Strava token expired');

    var token: any = JSON.parse(localStorage.getItem('stravaToken'));
    let headers = new HttpHeaders(
    );

    var url = 'https://www.strava.com/oauth/token' +
      '?client_id='+this.phr.getClients().strava.client_id +
      '&client_secret='+this.phr.getClients().strava.client_secret +
      '&refresh_token='+token.refresh_token +
      '&grant_type=refresh_token';

    return this.http.post<any>(url,{'headers': headers}).subscribe(
      token => {
        console.log('Strava token refreshed');
        this.setAccessToken(token);
        this.refreshingToken = false;
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
      '?client_id='+this.phr.getClients().strava.client_id +
      '&client_secret='+this.phr.getClients().strava.client_secret +
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
