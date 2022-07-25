import {EventEmitter, Injectable} from '@angular/core';

import {FhirService} from './fhir.service';


@Injectable()
export class EprService {

  public routes: Object[] = [
    {
      icon: 'search',
      route: '/hie',
      title: 'Patient Find'
    }
  ];

  public oauth2routes: Object[] = [
     {
      icon: 'apps',
      route: '/hie/smart',
      title: 'SMART on FHIR Apps',
    }
  ];



  patient: fhir4.Patient = undefined;

  resource: any = undefined;

  section: string;

  userName: string;

  userEmail: string;

  gpConnectStatusEmitter: EventEmitter<string> = new EventEmitter();

  nrlsConnectStatusEmitter: EventEmitter<string> = new EventEmitter();

  VirtuallyConnectStatusEmitter: EventEmitter<string> = new EventEmitter();

  flagEmitter: EventEmitter<fhir4.Flag> = new EventEmitter();

  patientAllergies: fhir4.AllergyIntolerance[] = [];

  patientFlags: fhir4.Flag[] = [];

  constructor(
    private fhirService: FhirService
  ) { }

  documentReference: fhir4.DocumentReference;

  private title: string;

  private titleChangeEvent: EventEmitter<string> = new EventEmitter<string>();

  private patientChangeEvent: EventEmitter<fhir4.Patient> = new EventEmitter();

  private resourceChangeEvent: EventEmitter<any> = new EventEmitter();

  private sectionChangeEvent: EventEmitter<string> = new EventEmitter();

  set(patient: fhir4.Patient) {

    this.patient = patient;

    this.patientAllergies = [];

    this.patientChangeEvent.emit(this.patient);
  }

  getTitleChange() {
    return this.titleChangeEvent;
  }

  setTitle(title: string) {
    this.patientFlags = [];
    this.getFlagChangeEmitter().emit(undefined);
    this.title = title;
    this.titleChangeEvent.emit(title);
  }

  clear() {
    this.patient = undefined;
    this.patientChangeEvent.emit(this.patient);
  }
  getPatientChangeEmitter() {
    return this.patientChangeEvent;
  }

  getFlagChangeEmitter() {
     return this.flagEmitter;
  }

  addFlag(flag: fhir4.Flag) {
    this.patientFlags.push(flag);
    this.flagEmitter.emit(flag);
  }

  getVirtuallyStatusChangeEvent() {
    return this.VirtuallyConnectStatusEmitter;
  }


    getEMISStatusChangeEvent() {
        return this.gpConnectStatusEmitter;
    }
    getNRLSStatusChangeEvent() {
        return this.nrlsConnectStatusEmitter;
    }

  getResourceChangeEvent() {
    return this.resourceChangeEvent;
  }

  getSectionChangeEvent() {
    return this.sectionChangeEvent;
  }

  setSection(section: string) {
    this.section = section;
    this.sectionChangeEvent.emit(section);
  }

  setResource(resource) {
    this.resource = resource;
    this.resourceChangeEvent.emit(resource);
  }

  setDocumentReference(document: fhir4.DocumentReference) {
    this.documentReference = document;
  }
  getDocumentReference() {
    return this.documentReference;
  }

}
