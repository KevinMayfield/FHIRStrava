import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

  constructor(
    private http: HttpClient,
    private strava : StravaService) {

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
    })
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
    return headers;
  }

}
