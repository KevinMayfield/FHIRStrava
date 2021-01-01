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
import {Obs} from "../models/obs";

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;
  private patientId : string;

  private observations : Observation[] = [];

  loaded: EventEmitter<any> = new EventEmitter();

  patientChange: EventEmitter<any> = new EventEmitter();

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
        this.patientChange.emit(this.patient);
        this.getServerPatient(this.patient);
    })
  }

  getObservations() {
    return this.observations;
  }

  postTransaction(observations : Bundle) {
    var transaction = this.getTransactionBundle();
    var patientUUID = transaction.entry[0].fullUrl;
    var batchSize = 200;

    for (const entry of observations.entry) {
      if (entry.resource.resourceType === "Observation") {
         var observation : Observation = entry.resource;
         observation.subject = {
           reference : patientUUID
         };
        transaction.entry.push(this.getEntry(observation));
        batchSize--;
        if (batchSize <1) {
          this.sendTransaction(transaction);
          // reset transaction
          batchSize = 200;
          transaction = this.getTransactionBundle();
          patientUUID = transaction.entry[0].fullUrl;
        }
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
    var patient : Patient = this.patient;
    // if (patient.id !== undefined) delete patient.id; // Otherwise POST fails.
    transaction.entry.push(this.getEntry(this.patient));
    return transaction;
  }

  getEntry(resource) {
    if (resource === undefined) return;
     var entry : BundleEntry = {};
     entry.resource = resource;
     entry.fullUrl = "urn:uuid:"+uuid.v4();
     /*
     entry.request = {
       method : "POST",
       url: entry.resource.resourceType,
       ifNoneExist : entry.resource.resourceType+ '?identifier='+resource.identifier[0].value
     }
     */
    entry.request = {
      method: "PUT",
      url: entry.resource.resourceType + '?identifier=' + resource.identifier[0].value
    }
     return entry;
  }


  getServerPatient(patient : Patient) {
    if (patient === undefined) return;

    let headers = this.getHeaders();
    this.http.get("http://localhost:8186/R4/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
          this.patientId = bundle.entry[0].resource.id;
          this.getServerObservations(this.phr.getFromDate(),this.phr.getToDate());
        }
    }
    )

  }

  getServerObservations(startDate : Date, endDate : Date) {
    if (this.patient === undefined) return;
    console.log(startDate.toISOString());
    this.observations = [];
    var url = 'http://localhost:8186/R4/Observation?patient='+this.patientId;
    url = url + '&date=>'+startDate.toISOString();
    url = url + '&date=<'+endDate.toISOString();
    url = url + '&_count=200';
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
          this.observations.push(entry.resource);
        }
      }
    }
  }

  private sendTransaction(body : Bundle) {

    let headers = this.getHeaders();

    return this.http.post<any>('http://localhost:8186/R4/', body, { 'headers' : headers} ).subscribe(result => {

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

  processFHIRObs() {
    var observations: Obs[] = [];
    var lastUpdate = this.phr.getFromDate();
    var process = false;
    for (const fhirobs of this.getObservations()) {
      process = true;
      var datetime = new Date(fhirobs.effectiveDateTime);
      if (datetime > lastUpdate) {
        //  console.log(fhirobs);
        var obs: Obs = {
          obsDate: datetime
        }

        if (fhirobs.code.coding[0].code === "8867-4") {
          obs.sdnn = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "60842-2") {
          obs.vo2max = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "Recovery_Points") {
          obs.recoverypoints = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "73794-0") {
          obs.pi = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "103228002") {
          obs.spo2 = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "77196-4") {
          obs.pwv = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "27113001") {
          obs.weight = fhirobs.valueQuantity.value;
          if (fhirobs.component != undefined) {
            for (const component of fhirobs.component) {
              if (component.code.coding[0].code === "73964-9") {
                obs.muscle_mass = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "73708-0") {
                obs.fat_mass = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "73706-4") {
                obs.hydration = component.valueQuantity.value;
              }
            }
          }
        }
        if (fhirobs.code.coding[0].code === "75367002") {
          if (fhirobs.component != undefined) {
            for (const component of fhirobs.component) {
              if (component.code.coding[0].code === "72313002") {
                obs.systolic = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "1091811000000102") {
                obs.diastolic = component.valueQuantity.value;
              }
            }
          }
        }

        if (fhirobs.code.coding[0].code === "93832-4") {
          obs.sleep_duration = fhirobs.valueQuantity.value;
          if (fhirobs.component != undefined) {
            for (const component of fhirobs.component) {
              if (component.code.coding[0].code === "sleep_score") {
                obs.sleep_score = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "lightsleepduration") {
                obs.lightsleepduration = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "deepsleepduration") {
                obs.deepsleepduration = component.valueQuantity.value;
              }
              if (component.code.coding[0].code === "remsleepduration") {
                obs.remsleepduration = component.valueQuantity.value;
              }
            }
          }
        }
        observations.push(obs);
      }
    }
    this.loaded.emit(observations);
  }



}
