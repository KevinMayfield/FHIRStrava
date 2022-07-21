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
import {FHIREvent} from "../model/eventModel";
import Encounter = fhir.Encounter;
import Identifier = fhir.Identifier;
import Reference = fhir.Reference;
import Practitioner = fhir.Practitioner;
import Organization = fhir.Organization;

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private patient : Patient;

  private apiKey = 'K5wfy9doLB3LzeNGK8T201A26rqMXQ4m7hDHHZyj';

  private token;

  loaded: EventEmitter<any> = new EventEmitter();

  patientChange: EventEmitter<any> = new EventEmitter();

  conditionsChanged: EventEmitter<FHIREvent> = new EventEmitter();

  medicationRequestsChanged: EventEmitter<FHIREvent> = new EventEmitter();

  observationsChanged: EventEmitter<FHIREvent> = new EventEmitter();

  documentReferencesChanged: EventEmitter<FHIREvent> = new EventEmitter();

  encountersChanged: EventEmitter<FHIREvent> = new EventEmitter();

  compositionsChanged: EventEmitter<FHIREvent> = new EventEmitter();

  immunizationsChanged: EventEmitter<FHIREvent> = new EventEmitter();

  allergiesChanged: EventEmitter<FHIREvent> = new EventEmitter();

  tasksChanged: EventEmitter<FHIREvent> = new EventEmitter();

  patientsChanged: EventEmitter<Patient[]> = new EventEmitter();

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

  getServerUrl(serverName : string) : string {
     for (var server of environment.servers) {
       if (server.name === serverName) return server.fhirServer
     }
     return undefined;
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


  public queryAllergies(serverName: string,patientId): any {
    var allergies : FHIREvent = {
      serverName: serverName,
      allergies : []
    };
    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(this.getServerUrl(serverName) + '/AllergyIntolerance?patient='+patientId, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          for (const entry of bundle.entry) {
            allergies.allergies.push(entry.resource as AllergyIntolerance);
          }
          this.allergiesChanged.emit(allergies);
        } else {
          console.log('Allergies not found.');
          this.allergiesChanged.emit(allergies);
        }
      }
    );
  }

  /// Conditions


  public queryConditions(serverName: string, patientId, clinicalStatus): any {
    var conditions: FHIREvent = {
      serverName : serverName,
      conditions : []
    };
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/Condition?patient='+patientId;
    if (serverName === 'AWS') url = this.getServerUrl(serverName) + '/Condition?patient:Patient.identifier='+patientId;

    /* not supported on EMIS
    if (clinicalStatus!= undefined) {
      search += '&clinical-status='+clinicalStatus;
    }

     */
    // tslint:disable-next-line:typedef
    this.http.get(url, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          for (const entry of bundle.entry) {
           let conditon = entry.resource as Condition;

           if (clinicalStatus === undefined || (conditon.clinicalStatus.coding != undefined && conditon.clinicalStatus.coding[0].code === clinicalStatus)) {
             conditions.conditions.push(conditon);
           }
          }
          this.conditionsChanged.emit(conditions);
        } else {
          console.log('Condition not found.');
          this.conditionsChanged.emit(conditions);
        }
      }
    );
  }


  /// Compositions


  public queryCompositions(serverName: string, patientId): any {
    var compositions : FHIREvent = {
      serverName : serverName,
      compositions: []
    };
    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(this.getServerUrl(serverName) + '/Composition?patient='+patientId +'&date=2022-01-01', { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          for (const entry of bundle.entry) {
            compositions.compositions.push(entry.resource as Composition);
          }
          this.compositionsChanged.emit(compositions);
        } else {
          console.log('Composition not found.');
          this.compositionsChanged.emit(compositions);
        }
      }
    );
  }


  /// DocumentReferences

  public queryDocumentReferences(serverName: string, patientId): any {
    var documentReferences : FHIREvent = {
      serverName : serverName,
      documents : []
    };
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/DocumentReference?patient='+patientId;
    if (serverName === 'AWS') url = this.getServerUrl(serverName) + '/DocumentReference?patient:Patient.identifier='+patientId;

    // tslint:disable-next-line:typedef
    this.http.get(url, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {


          for (const entry of bundle.entry) {
            documentReferences.documents.push(entry.resource as DocumentReference);
          }
          this.documentReferencesChanged.emit(documentReferences);
        } else {
          console.log('DocumentRerence not found.');
          this.documentReferencesChanged.emit(documentReferences);
        }
      }
    );
  }
  /// Encounter

  public queryEncounters(serverName: string, patientId): any {
    var fhirEvent : FHIREvent = {
      serverName : serverName,
      encounters : []
    };
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/Encounter?patient='+patientId;
    if (serverName === 'AWS') url = this.getServerUrl(serverName) + '/Encounter?patient:Patient.identifier='+patientId;

    // tslint:disable-next-line:typedef
    this.http.get(url, { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {


          for (const entry of bundle.entry) {
            fhirEvent.encounters.push(entry.resource as Encounter);
          }
          this.encountersChanged.emit(fhirEvent);
        } else {
          console.log('Encounter not found.');
          this.encountersChanged.emit(fhirEvent);
        }
      }
    );
  }

  /// Conditions


  public queryImmunizations(serverName: string, patientId): any {
    var immunizations : FHIREvent = {
      serverName : serverName,
      immunizations:[]
    };
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/Immunization?patient='+patientId;
    if (serverName === 'AWS') url = this.getServerUrl(serverName) + '/Immunization?patient:Patient.identifier='+patientId;

    // tslint:disable-next-line:typedef
    this.http.get(url, { headers}).subscribe(
      result  => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          for (const entry of bundle.entry) {
            immunizations.immunizations.push(entry.resource as Immunization);
          }
          this.immunizationsChanged.emit(immunizations);
        } else {
          console.log('Immunisation not found.');
          this.immunizationsChanged.emit(immunizations);
        }
      }
    );
  }

  // MedicationRequests

  public queryMedicationRequests(serverName: string, patientId): any {
    var medicationRequests : FHIREvent = {
      serverName:serverName,
      medicationRequests : []
    };
    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(this.getServerUrl(serverName) + '/MedicationRequest?patient='+patientId + '&date=2019-01-01', { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {


          for (const entry of bundle.entry) {
            medicationRequests.medicationRequests.push(entry.resource as MedicationRequest);
          }
          this.medicationRequestsChanged.emit(medicationRequests);
        } else {

          console.log('MedicationRequest not found.');
          this.medicationRequestsChanged.emit(medicationRequests);
        }
      }
    );
  }


  // Observations

  public queryObservations(serverName: string,patientId): any {
    var observations : FHIREvent = {
      serverName: serverName,
      observations : []
    };
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/Observation?patient='+patientId;
    if (serverName === 'AWS') url = this.getServerUrl(serverName) + '/Observation?patient:Patient.identifier='+patientId;
    // tslint:disable-next-line:typedef
    this.http.get(url , { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {


          for (const entry of bundle.entry) {
            observations.observations.push(entry.resource as Observation);
          }
          this.observationsChanged.emit(observations);
        } else {
          console.log('Observation not found.');
          this.observationsChanged.emit(observations);
        }
      }
    );
  }


  // Observations


  public queryTasks(serverName:string,patientId): any {
    var tasks: FHIREvent  = {
      serverName: serverName,
      tasks: []
    };
    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(this.getServerUrl(serverName) + '/Task?patient='+patientId , { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {
          for (const entry of bundle.entry) {
            tasks.tasks.push(entry.resource as fhir.Task);
          }
          this.tasksChanged.emit(tasks);
        } else {
          console.log('Tasks not found.');
          this.tasksChanged.emit(tasks);
        }
      }
    );
  }


  public queryPatients(serverName:string,emisId): any {
    var patients : Patient[] = [];
    const headers = this.getHeaders();
    // tslint:disable-next-line:typedef
    this.http.get(this.getServerUrl(serverName) + '/Patient?identifier='+emisId , { headers}).subscribe(
      result => {
        const bundle = result as Bundle;
        if (bundle.entry !== undefined && bundle.entry.length > 0) {

          patients = [];
          for (const entry of bundle.entry) {
            patients.push(entry.resource as fhir.Patient);
          }
          this.patientsChanged.emit(patients);
        } else {
          console.log('Tasks not found.');
          this.patientsChanged.emit(patients);
        }
      }
    );
  }
  setPatient(serverName : string) {

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

    this.getServerPatient(serverName, patient);
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

  getPractitionerRole(serverName: string, reference : Reference) :Observable<Bundle> {

      var ids = reference.reference.split('/');
      const headers = this.getHeaders();
      var url = this.getServerUrl(serverName) + '/PractitionerRole?_id='+ids[1]+'&_include=*';
      return this.http.get(url,{ headers})
  }

  extractPractitionerRole(bundle : Bundle) {
    var practitionerRole: fhir.PractitionerRole = {
    };
    // Find PractitionerRole
    for (const entry of bundle.entry) {
       if (entry.resource.resourceType === 'PractitionerRole') practitionerRole = entry.resource
    }
    for (const entry of bundle.entry) {
      if (entry.resource.resourceType === 'Practitioner') {
        var practitioner : Practitioner = (entry.resource as Practitioner)
        practitionerRole.practitioner = {
        }
        for (const identifier of practitioner.identifier) {
          if (identifier.system.includes('fhir.hl7.org.uk')) {
            practitionerRole.practitioner.identifier = identifier
          }
        }
        if (practitioner.name !== undefined) {
          const name = practitioner.name[0].family + ', ' + practitioner.name[0].given[0]
          practitionerRole.practitioner.display = name
        }
      }
      if (entry.resource.resourceType === 'Organization') {
        var organization : Organization = (entry.resource as Organization)
        practitionerRole.organization = {
          display : organization.name
        }
        for (const identifier of organization.identifier) {
          if (identifier.system.includes('nhs.uk')) {
            practitionerRole.organization.identifier = identifier
          }
        }
      }
    }
      return practitionerRole;
  }

  getQuesionnaireResponse(serverName:string, encounter : Identifier) :Observable<Bundle> {
    const headers = this.getHeaders();
    var url = this.getServerUrl(serverName) + '/QuestionnaireResponse?encounter='+encounter.system + '%7C' + encounter.value;
    // tslint:disable-next-line:typedef
    return this.http.get(url , { headers})
  }

  getServerPatient(serverName: string, patient : Patient) {
    if (patient === undefined) return;

    let headers = this.getHeaders();
    this.http.get(this.getServerUrl(serverName) +"/Patient?identifier="+patient.identifier[0].value,{ 'headers' : headers}).subscribe(
      result => {
        const bundle: Bundle = <Bundle> result;

        if (bundle.entry != undefined && bundle.entry.length >0) {
          console.log('Patient found.');
          this.patient = <Patient>bundle.entry[0].resource;
          this.patientChange.emit(this.patient);

        } else {
          console.log('Patient not found. Creating');
          headers = headers.append('Prefer','return=representation');
          this.http.post(this.getServerUrl(serverName) +"/Patient", patient,{ 'headers' : headers}).subscribe(result => {
            console.log(result);
            this.patient = result;
            this.patientChange.emit(this.patient);
          });
        }
    }
    )

  }
  searchPatients(serverName: string, term: string): Observable<fhir.Bundle> {
    const url = this.getServerUrl(serverName);
    let headers = this.getHeaders();
    if (!isNaN(parseInt(term))) {
      return this.http.get<fhir.Bundle>(url + `/Patient?identifier=${term}`, {'headers': headers});
    } else {

      return this.http.get<fhir.Bundle>(url + `/Patient?name=${term}`, {'headers': headers});

    }


  }

  deleteEntry(serverName: string, uri: string) {
    let headers = this.getHeaders();

    return this.http.delete<any>(this.getServerUrl(serverName) +uri,  { 'headers' : headers} ).subscribe(result => {
        console.log('Deleted' + uri);
      },
      (err)=> {
        console.log(err);

      });
  }
  /*
  getServerObservations(serverName: string, startDate : Date, endDate : Date) {
    if (this.patient === undefined) return;
    this.observations = [];
    var url = this.getServerUrl(serverName) + '/Observation?patient='+this.patient.id;
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
*/



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
