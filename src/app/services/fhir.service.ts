import {EventEmitter, Injectable} from '@angular/core';
import {StravaService} from "./strava.service";
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
import {PhrService} from "./phr.service";
import {generateBundleStats} from "@angular-devkit/build-angular/src/webpack/utils/stats";

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

  private observations : Observation[] = [];

  loaded: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private strava : StravaService,
    private phr : PhrService) {

    this.strava.athleteChange.subscribe(athlete => {
        this.patient = {
          identifier: [ {
            system: "https://www.strava.com/Id/Athelete",
            value: athlete.id
          }
          ],
          name: [ {
            "family": athlete.lastname,
            "given" : [ athlete.firstname ]
          }]
        }
        if (athlete.sex === 'F') this.patient.gender = "female";
        if (athlete.sex === 'M') this.patient.gender = "male";
        this.patient.resourceType = 'Patient';
        console.log(this.patient);
        this.getServerPatient(this.patient);
    })
  }

  getObservations() {
    return this.observations;
  }

  prepareTransaction(observations : Bundle) {
    var transaction : Bundle = {
      type : "transaction",
      entry : []
    };
    transaction.resourceType = 'Bundle';
    transaction.entry.push(this.getEntry(this.patient));
    var patientUUID = transaction.entry[0].fullUrl;
    for (const entry of observations.entry) {
      if (entry.resource.resourceType === "Observation") {
         var observation : Observation = entry.resource;
         observation.subject = {
           reference : patientUUID
         };
        transaction.entry.push(this.getEntry(observation));
      }
    }
    console.log(transaction);
    this.postTransaction(transaction);

  }

  getEntry(resource) {
     var entry : BundleEntry = {};
     entry.resource = resource;
     entry.fullUrl = "urn:uuid:"+uuid.v4();
     entry.request = {
       method : "POST",
       url: entry.resource.resourceType,
       ifNoneExist : entry.resource.resourceType+ '?identifier='+resource.identifier[0].value
     }
     return entry;
  }


  getServerPatient(patient : Patient) {
    let headers = this.getHeaders();
    this.http.get("http://localhost:8186/R4/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
           this.patient.id = bundle.entry[0].resource.id;
          this.getServerObservations(this.phr.getFromDate(),this.phr.getToDate());
        }
    }
    )

  }

  getServerObservations(startDate : Date, endDate : Date) {
    console.log(startDate.toISOString());
    var url = 'http://localhost:8186/R4/Observation?patient='+this.patient.id;
    url = url + '&date=>'+startDate.toISOString();
    url = url + '&date=<'+endDate.toISOString();
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
        this.loaded.emit(true);
      } else {
        this.getNext(next);
      };
    });
  }

  addEntries(bundle : Bundle) {
    for (const entry of bundle.entry) {
      if (entry.resource.resourceType === "Observation") {
        this.observations.push(entry.resource);
      }
    }
  }

  public postTransaction(body : Bundle) {

    let headers = this.getHeaders();

    return this.http.post<any>('http://localhost:8186/R4/', body, { 'headers' : headers} ).subscribe(result => {
      console.log(result);
    },
      (err)=> {
          console.log(err);

      });

  }

  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers.append('Content-Type', 'application/fhir+json');
    headers.append('Accept', 'application/fhir+json');
    return headers;
  }

}