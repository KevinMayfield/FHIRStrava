import {EventEmitter, Injectable} from '@angular/core';

// @ts-ignore
import Patient = fhir.Patient;
// @ts-ignore
import Bundle = fhir.Bundle;
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import BundleEntry = fhir.BundleEntry;
import * as uuid from 'uuid';
import {HttpClient, HttpHeaders} from "@angular/common/http";
// @ts-ignore
import Flag = fhir.Flag;
// @ts-ignore
import DiagnosticReport = fhir.DiagnosticReport;
// @ts-ignore
import Coding = fhir.Coding;
import {DatePipe} from "@angular/common";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

  private serverUrl = 'https://ek1wj5eye3.execute-api.eu-west-2.amazonaws.com/dev';

  private apiKey = 'K5wfy9doLB3LzeNGK8T201A26rqMXQ4m7hDHHZyj';

  // private serverUrl = 'http://127.0.0.1:8186';

  private observations : Observation[] = [];

  loaded: EventEmitter<any> = new EventEmitter();

  patientChange: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private datePipe: DatePipe) {



    this.loaded.subscribe(sucess => {

    });
  }

  getPatientID() : string {
    if (this.patient == undefined) return undefined;
    return this.patient.id;
  }

  setPatient() {

    if (this.getPatientID() != undefined) {
      // this should force body.ts to call data retrieval.
      this.patientChange.emit(this.patient);
      return;
    }
    var patient = {
      resourceType: 'Patient',
      identifier: [{
        system: "https://auth.mayfield-is.co.uk/Id/UserName",
        value: this.auth.currentUser.username
      },
        {
          system: "https://auth.mayfield-is.co.uk/Id/UserId",
          value: this.auth.currentUser.id
        }
      ],
      name: [{
        "text": this.auth.currentUser.attributes.name
      }]
    }

    this.getServerPatient(patient);
  }

  getObservations() {
    return this.observations;
  }

  postTransaction(resources : Bundle) {
    if (this.patient == undefined) {
      console.log('Patient missing - should not occur');
    } else {
      if (this.patient.id == undefined) {
        console.log('Patient Id missing - should not occur');
      }
    }
    var transaction = this.getTransactionBundle();
    var batchSize = 200;

    for (const entry of resources.entry) {
      if (entry.resource.resourceType === "Observation") {
         var observation : Observation = <Observation> entry.resource;
         observation.subject = {
           reference : 'Patient/'+this.patient.id
         };
        transaction.entry.push(this.convertEntry(entry));

      }
      if (entry.resource.resourceType === "DiagnosticReport") {
        var report : DiagnosticReport = <DiagnosticReport> entry.resource;
        report.subject = {
          reference : 'Patient/'+this.patient.id
        };
        transaction.entry.push(this.convertEntry(entry));
      }
      batchSize--;
      if (batchSize <1) {
        this.sendTransaction(transaction);
        // reset transaction
        batchSize = 200;
        transaction = this.getTransactionBundle();
      }
    }
   // console.log(transaction);
    this.sendTransaction(transaction);
  }

  getTransactionBundle() : Bundle {
    var transaction : Bundle = {
      type : "transaction",
      entry : []
    };
    transaction.resourceType = 'Bundle';
    return transaction;
  }

  makeEntry(resource) :BundleEntry {
    if (resource === undefined) return;
    var entry : BundleEntry = {
      resource : resource
    }
    return this.convertEntry(entry);
  }
  convertEntry(entry) {

     if (entry.fullUrl === undefined) {
       entry.fullUrl = "urn:uuid:"+uuid.v4();
     }
     /*
     entry.request = {
       method : "POST",
       url: entry.resource.resourceType,
       ifNoneExist : entry.resource.resourceType+ '?identifier='+resource.identifier[0].value
     }
     */
    entry.request = {
      method: "PUT",
      url: entry.resource.resourceType + '?identifier=' + entry.resource.identifier[0].value
    }
     return entry;
  }


  getServerPatient(patient : Patient) {
    if (patient === undefined) return;

    let headers = this.getHeaders();
    this.http.get(this.serverUrl +"/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = <Bundle> result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
          console.log('Patient found.');
          this.patient = <Patient>bundle.entry[0].resource;
          this.patientChange.emit(this.patient);

        } else {
          console.log('Patient not found. Creating');
          headers = headers.append('Prefer','return=representation');
          this.http.post(this.serverUrl +"/Patient", patient,{ 'headers' : headers}).subscribe(result => {
            console.log(result);
            this.patient = result;
            this.patientChange.emit(this.patient);
          });
        }
    }
    )

  }
  searchPatients(term: string): Observable<fhir.Bundle> {
    const url = this.serverUrl;
    let headers = this.getHeaders();
    if (!isNaN(parseInt(term))) {
      return this.http.get<fhir.Bundle>(url + `/Patient?identifier=${term}`, {'headers': headers});
    } else {

      return this.http.get<fhir.Bundle>(url + `/Patient?name=${term}`, {'headers': headers});

    }


  }

  deleteEntry(uri: string) {
    let headers = this.getHeaders();

    return this.http.delete<any>(this.serverUrl + '/R4'+uri,  { 'headers' : headers} ).subscribe(result => {
        console.log('Deleted' + uri);
      },
      (err)=> {
        console.log(err);

      });
  }
  getServerObservations(startDate : Date, endDate : Date) {
    if (this.patient === undefined) return;
    this.observations = [];
    var url = this.serverUrl + '/R4/Observation?patient='+this.patient.id;
    url = url + '&date=>'+startDate.toISOString();
    url = url + '&date=<='+endDate.toISOString();
    url = url + '&_count=500';
    this.getNext(url);
  }


  getNext(url) {
    let headers = this.getHeaders();

    return this.http.get<any>(url, { 'headers' : headers} ).subscribe(result => {
      this.addEntries(result);
      var next : string = undefined;
      for (const link of result.link) {

        if (link.relation === 'next') next = link.url;
      }

      if (next === undefined) {
      //  this.loaded.emit(true);
        this.processFHIRObs();
      } else {
        this.getNext(next);
      };
    });
  }

  addEntries(bundle : Bundle) {
    if (bundle.entry !== undefined && bundle.entry.length>0) {
      for (const entry of bundle.entry) {
        if (entry.resource.resourceType === "Observation") {
          this.observations.push(<Observation>entry.resource);
        }
      }
    }
  }

  private sendTransaction(body : Bundle) {

    let headers = this.getHeaders();

    return this.http.post<any>(this.serverUrl + '/R4/', body, { 'headers' : headers} ).subscribe(result => {

    },
      (err)=> {
          console.log(err);

      });

  }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Content-Type', 'application/fhir+json');
    headers = headers.append('Accept', 'application/fhir+json');
    headers = headers.append("Authorization", "Bearer "+this.auth.getAccessToken());
    headers = headers.append('x-api-key',this.apiKey);
 //   console.log(headers);
    return headers;
  }

  processFHIRObs() {

  }


  /*

STRAVA

FHIR CONVERSIONS

*/



  private getType(type : string) {
    return type;
  }




}
