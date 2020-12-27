import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HrvService {

  constructor(private http: HttpClient) { }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'text/html');
    return headers;
  }

  public postCSVFile(body : any): Observable<any> {

    let headers = this.getHeaders();

    var lastUpdate = new Date('2020-07-14');


    return this.http.post<any>('http://localhost:8187/services/hrv', body, { 'headers' : headers} );

  }
}
