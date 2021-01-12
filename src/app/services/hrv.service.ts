import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PhrService} from "./phr.service";
import {Obs} from "../models/obs";
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Bundle = fhir.Bundle;
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class HrvService {


  hrvChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService,
              private auth : AuthService) { }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Content-Type', 'text/html');
    headers = headers.append("Authorization", "Bearer "+this.auth.getAccessToken());
    return headers;
  }

  public postCSVFile(body : any) {

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getFromDate();


    return this.http.post<any>(this.phr.serviceUrl + '/services/hrv', body, { 'headers' : headers} ).subscribe(result => {
      this.hrvChange.emit(result);
    });

  }

}
