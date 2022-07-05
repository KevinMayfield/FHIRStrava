import {EventEmitter, Injectable} from '@angular/core';

// @ts-ignore
import Patient = fhir.Patient;
// @ts-ignore
import Bundle = fhir4.Bundle;
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import BundleEntry = fhir.BundleEntry;
import * as uuid from 'uuid';
import {HttpClient, HttpHeaders} from "@angular/common/http";
// @ts-ignore
import Flag = fhir.Flag;
import Task = fhir.Task;
// @ts-ignore
import DiagnosticReport = fhir.DiagnosticReport;
// @ts-ignore
import Coding = fhir.Coding;
import {DatePipe} from "@angular/common";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
// @ts-ignore
import Condition = fhir4.Condition;
import MedicationRequest = fhir.MedicationRequest;
import Composition = fhir.Composition;
import DocumentReference = fhir.DocumentReference;
import Immunization = fhir.Immunization;
import AllergyIntolerance = fhir.AllergyIntolerance;

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

 // private serverUrl = 'https://ek1wj5eye3.execute-api.eu-west-2.amazonaws.com/dev';

  //private serverUrl = 'https://jtm3f8nxwe.execute-api.eu-west-2.amazonaws.com/Development/EMIS/F83004';


  private apiKey = 'K5wfy9doLB3LzeNGK8T201A26rqMXQ4m7hDHHZyj';

  // private serverUrl = 'http://127.0.0.1:8186';


   private token;

  loaded: EventEmitter<any> = new EventEmitter();

  patientChange: EventEmitter<any> = new EventEmitter();

  conditionsChanged: EventEmitter<any> = new EventEmitter();
  private conditions: Condition[] = [];

  private medicationRequests: MedicationRequest[] = [];
  medicationRequestsChanged: EventEmitter<any> = new EventEmitter();

  private observations: Observation[] = [];
  observationsChanged: EventEmitter<any> = new EventEmitter();

  private documentReferences: DocumentReference[] = [];
  documentReferencesChanged: EventEmitter<any> = new EventEmitter();

  private compositions: Composition[] = [];
  compositionsChanged: EventEmitter<any> = new EventEmitter();

  private immunizations: Immunization[] = [];
  immunizationsChanged: EventEmitter<any> = new EventEmitter();

  private allergies: AllergyIntolerance[] = [];
  allergiesChanged: EventEmitter<any> = new EventEmitter();

  private tasks: Task[] = [];
  tasksChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private datePipe: DatePipe) {

    this.auth.tokenChange.subscribe(accessToken => {
      console.log("token changed");
      this.token = accessToken;
    });
    this.loaded.subscribe(sucess => {

    });
  }




  getHeaders() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    this.auth.getAccessToken();
    //console.log("FHIR Service using "+this.token);
    headers = headers.append('Content-Type', 'application/fhir+json');
    headers = headers.append('Accept', 'application/fhir+json');
    headers = headers.append("Authorization", "Bearer "+this.token);
    headers = headers.append('x-api-key',this.apiKey);
    //   console.log(headers);
    return headers;
  }

  getPatientID() : string {
    if (this.patient == undefined) return undefined;
    return this.patient.id;
  }


  /// Allergiew

  public getAllergies() : any {
    return this.allergies;
  }
  public queryAllergies(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/AllergyIntolerance?patient='+patientId, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.allergies = [];
          for (const entry of bundle.entry) {
            this.allergies.push(entry.resource as AllergyIntolerance);
          }
          this.allergiesChanged.emit({});
        } else {
          console.log('Allergies not found.');
          this.allergiesChanged.emit({});
        }
      }
    );
  }

  /// Conditions

  public getConditions() : any {
    return this.conditions;
  }
  public queryConditions(patientId, clinicalStatus): any {

    const headers = this.getHeaders();
    var search = environment.gpUrl + '/Condition?patient='+patientId;
    /* not supported on EMIS
    if (clinicalStatus!= undefined) {
      search += '&clinical-status='+clinicalStatus;
    }

     */
    // tslint:disable-next-line:typedef
    this.http.get(search, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.conditions = [];
          for (const entry of bundle.entry) {
           let conditon = entry.resource as Condition;

           if (clinicalStatus === undefined || (conditon.clinicalStatus.coding != undefined && conditon.clinicalStatus.coding[0].code === clinicalStatus)) {
             this.conditions.push(conditon);
           }
          }
          this.conditionsChanged.emit({});
        } else {
          console.log('Condition not found.');
          this.conditionsChanged.emit({});
        }
      }
    );
  }


  /// Compositions

  public getCompositions() : any {
    return this.compositions;
  }
  public queryCompositions(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/Composition?patient='+patientId +'&date=2022-01-01', { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.compositions = [];
          for (const entry of bundle.entry) {
            this.compositions.push(entry.resource as Composition);
          }
          this.compositionsChanged.emit({});
        } else {
          console.log('Composition not found.');
          this.compositionsChanged.emit({});
        }
      }
    );
  }


  /// DocumentReferences

  public getDocumentReferences() : any {
    return this.documentReferences;
  }
  public queryDocumentReferences(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/DocumentReference?patient='+patientId, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.documentReferences = [];
          for (const entry of bundle.entry) {
            this.documentReferences.push(entry.resource as DocumentReference);
          }
          this.documentReferencesChanged.emit({});
        } else {
          console.log('DocumentRerence not found.');
          this.documentReferencesChanged.emit({});
        }
      }
    );
  }

  /// Conditions

  public getImmunizations() : any {
    return this.immunizations;
  }
  public queryImmunizations(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/Immunization?patient='+patientId, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.immunizations = [];
          for (const entry of bundle.entry) {
            this.immunizations.push(entry.resource as Immunization);
          }
          this.immunizationsChanged.emit({});
        } else {
          console.log('Immunisation not found.');
          this.immunizationsChanged.emit({});
        }
      }
    );
  }

  // MedicationRequests

  public getMedicationRequests() : any {
    return this.medicationRequests;
  }
  public queryMedicationRequests(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/MedicationRequest?patient='+patientId + '&date=2019-01-01', { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.medicationRequests = [];
          for (const entry of bundle.entry) {
            this.medicationRequests.push(entry.resource as MedicationRequest);
          }
          this.medicationRequestsChanged.emit({});
        } else {

          console.log('MedicationRequest not found.');
          this.medicationRequestsChanged.emit({});
        }
      }
    );
  }


  // Observations

  public getObservations() : any {
    return this.observations;
  }
  public queryObservations(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/Observation?patient='+patientId , { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.observations = [];
          for (const entry of bundle.entry) {
            this.observations.push(entry.resource as Observation);
          }
          this.observationsChanged.emit({});
        } else {
          console.log('Observation not found.');
          this.observationsChanged.emit({});
        }
      }
    );
  }


  // Observations

  public getTasks() : any {
    return this.tasks;
  }
  public queryTasks(patientId): any {

    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(environment.gpUrl + '/Task?patient='+patientId , { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          this.tasks = [];
          for (const entry of bundle.entry) {
            this.tasks.push(entry.resource as fhir.Task);
          }
          this.tasksChanged.emit({});
        } else {
          console.log('Tasks not found.');
          this.tasksChanged.emit({});
        }
      }
    );
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
    this.http.get(environment.gpUrl +"/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = <Bundle> result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
          console.log('Patient found.');
          this.patient = <Patient>bundle.entry[0].resource;
          this.patientChange.emit(this.patient);

        } else {
          console.log('Patient not found. Creating');
          headers = headers.append('Prefer','return=representation');
          this.http.post(environment.gpUrl +"/Patient", patient,{ 'headers' : headers}).subscribe(result => {
            console.log(result);
            this.patient = result;
            this.patientChange.emit(this.patient);
          });
        }
    }
    )

  }
  searchPatients(term: string): Observable<fhir.Bundle> {
    const url = environment.gpUrl;
    let headers = this.getHeaders();
    if (!isNaN(parseInt(term))) {
      return this.http.get<fhir.Bundle>(url + `/Patient?identifier=${term}`, {'headers': headers});
    } else {

      return this.http.get<fhir.Bundle>(url + `/Patient?name=${term}`, {'headers': headers});

    }


  }

  deleteEntry(uri: string) {
    let headers = this.getHeaders();

    return this.http.delete<any>(environment.gpUrl +uri,  { 'headers' : headers} ).subscribe(result => {
        console.log('Deleted' + uri);
      },
      (err)=> {
        console.log(err);

      });
  }
  getServerObservations(startDate : Date, endDate : Date) {
    if (this.patient === undefined) return;
    this.observations = [];
    var url = environment.gpUrl + '/Observation?patient='+this.patient.id;
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
