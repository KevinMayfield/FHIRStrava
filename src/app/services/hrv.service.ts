import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PhrService} from "./phr.service";
import {Obs} from "../models/obs";
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Bundle = fhir.Bundle;

@Injectable({
  providedIn: 'root'
})
export class HrvService {


  hrvChange: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient,
              private phr : PhrService) { }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'text/html');
    return headers;
  }

  public postCSVFile(body : any) {

    let headers = this.getHeaders();

    var lastUpdate = this.phr.getLowerDate();


    return this.http.post<any>('http://localhost:8187/services/hrv', body, { 'headers' : headers} ).subscribe(result => {
      this.hrvChange.emit(result);
    });

  }

}
