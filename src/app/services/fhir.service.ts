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
// @ts-ignore
import Flag = fhir.Flag;
import {SummaryActivity} from "../models/summary-activity";
// @ts-ignore
import DiagnosticReport = fhir.DiagnosticReport;
// @ts-ignore
import Coding = fhir.Coding;
import {DatePipe} from "@angular/common";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

  private serverUrl = 'https://fhir.mayfield-is.co.uk';

  // private serverUrl = 'http://127.0.0.1:8186';

  private observations : Observation[] = [];

  loaded: EventEmitter<any> = new EventEmitter();

  patientChange: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private phr : PhrService,
    private strava: StravaService,
    private datePipe: DatePipe) {

    if (this.auth.currentUser != undefined) {
      console.log(this.auth.currentUser);
      this.setPatient();
    }
    this.auth.tokenChange.subscribe(athlete => {

    });

    this.loaded.subscribe(sucess => {
      if (sucess) this.updateFHIRServer(this.strava.activities);
    });
  }

  setPatient() {
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

    console.log(patient);

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
         var observation : Observation = entry.resource;
         observation.subject = {
           reference : 'Patient/'+this.patient.id
         };
        transaction.entry.push(this.convertEntry(entry));

      }
      if (entry.resource.resourceType === "DiagnosticReport") {
        var report : DiagnosticReport = entry.resource;
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
    this.http.get(this.serverUrl +"/R4/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
          console.log('Patient found.');
          this.patient = bundle.entry[0].resource;
          this.patientChange.emit(this.patient);
          this.getServerObservations(this.phr.getFromDate(),this.phr.getToDate());
        } else {
          console.log('Patient not found. Creating');
          headers = headers.append('Prefer','return=representation');
          this.http.post(this.serverUrl +"/R4/Patient", patient,{ 'headers' : headers}).subscribe(result => {
            console.log(result);
            this.patient = result;
            this.patientChange.emit(this.patient);
          });
        }
    }
    )

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
    url = url + '&date=<'+endDate.toISOString();
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
          this.observations.push(entry.resource);
        }
      }
    }
  }

  private sendTransaction(body : Bundle) {

    let headers = this.getHeaders();
    console.log(body);

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
    headers = headers.append("Authorization", "Bearer "+this.auth.accessToken);
 //   console.log(headers);
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
        if (fhirobs.code.coding[0].code === "840546002") {
           var flag : Flag = {
             status : "active",
             code : fhirobs.code,
             subject : 'Patient/'+this.patient.id,
             period : {
               start : fhirobs.effectiveDateTime
             }
           }
           var endDate = new Date(datetime);
           endDate.setDate(datetime.getDate() + 10);
           var today = new Date();
           if (endDate < today) { flag.status  = "inactive" } else {
             this.phr.alerts.push(flag);
           }
        }
        if (fhirobs.code.coding[0].code === "8867-4") {
          obs.sdnn = fhirobs.valueQuantity.value;
        }
        if (fhirobs.code.coding[0].code === "386725007") {
          // TAKE THIS OUT
          if (fhirobs.valueQuantity.value > 50) {
            console.log(fhirobs.id);
            this.deleteEntry('/Observation/'+fhirobs.id);
          } else {
            obs.bodytemp = fhirobs.valueQuantity.value;
          }
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


  /*

STRAVA

FHIR CONVERSIONS

*/


  private updateFHIRServer(activities : SummaryActivity[]) {

    var bundle : Bundle = {
      entry: []
    };
    for (const activity of activities) {


      let activityReport : DiagnosticReport = {
        resourceType : 'DiagnosticReport',
        result : []
      }
      activityReport.identifier = [
        {
          system: 'https://fhir.strava.com/Id',
          value: activity.id
        }];
      activityReport.category = [
        {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '51998003',
            display: 'Exercises'
          }]
        }
      ];
      activityReport.code = {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '256235009',
          display: 'Exercise'
        },
          {
            system: 'http://fhir.strava/Type',
            code: activity.type,
            display: this.getType(activity.type)
          }
        ],
        text : activity.name
      };
      activityReport.effectivePeriod = {
        start :activity.start_date,
        end: this.getEndDate(activity).toISOString()
      }

      if (activity.moving_time != undefined) {
        this.addBundleObservationEntry(bundle, activityReport, activity,'http://loinc.org', '55411-3', 'Exercise duration', activity.moving_time, 'min');
      }
      if (activity.kilojoules != undefined) {
        this.addBundleObservationEntry(bundle, activityReport, activity,'http://fhir.strava.com/IdType', 'Kilojoules', 'Exercise Energy', activity.kilojoules , 'KJ');
      }
      if (activity.average_heartrate != undefined) {
        this.addBundleObservationEntry(bundle, activityReport, activity,'http://loinc.org', '66440-9', 'Heart rate 10 minutes mean', activity.average_heartrate , 'beat/min');
      }
      bundle.entry.push({
        resource : activityReport
      });
    }
    if (bundle.entry.length> 0) {
     // console.log(bundle);
      this.postTransaction(bundle);
    }
  }

  private getType(type : string) {
    return type;
  }

  private getEndDate(activity: SummaryActivity) {
    var end = new Date(activity.start_date);
    var start = new Date(activity.start_date);
    end.setTime(end.getTime() + (activity.elapsed_time*1000));
    return end;
  }

    private addBundleObservationEntry(bundle: Bundle, report:DiagnosticReport, obs: SummaryActivity, codeSystem: string, code: string, display, value?, unit?: string) : BundleEntry {
      var fhirObs :Observation = {
        resourceType: 'Observation'
      };
    //  console.log(obs.elapsed_time);
      fhirObs.identifier = [
        {
          system: 'https://fhir.strava.com/Id',
          value: obs.id + '-' + code
        }
      ]

      fhirObs.code = {
        coding : [{
          system: codeSystem,
          code: code,
          display: display
        }
        ]
      };

      fhirObs.effectiveDateTime = report.effectivePeriod.end;
      if (value != undefined && unit != undefined) {
        fhirObs.valueQuantity = {
          value: value,
          unit: unit,
          system: 'http://unitsofmeasure.org'
        }
      }

      var entry : BundleEntry = {
        fullUrl : "urn:uuid:"+uuid.v4(),
        resource : fhirObs
      }
      report.result.push({
        reference : entry.fullUrl,
        display : display
      })
      bundle.entry.push(entry);
      return entry;
    }
  /*
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
  */
}
