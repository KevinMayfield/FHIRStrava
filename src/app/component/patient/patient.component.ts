
import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {ResourceDialogComponent} from '../../dialog/resource-dialog/resource-dialog.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {PatientDataSource} from "../../datasource/patient-data-source";
import {FhirService} from "../../services/fhir.service";



@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  @Input() patients: fhir4.Patient[];

  @Input() patientsObservable: Observable<fhir4.Patient[]>;

  @Input() useObservable = false;

  @Input() showResourceLink = true;

  @Input() serverName: string;

  @Output() patient = new EventEmitter<any>();

  dataSource: PatientDataSource;

  practitioners: fhir4.Practitioner[];

  organisations: fhir4.Organization[];

  displayedColumns = ['patient', 'dob', 'gender', 'identifier', 'contact',  'practice', 'resource'];

  constructor( private dialog: MatDialog,
               public fhirService: FhirService) {

  }

  ngOnInit() {
    if (!this.showResourceLink) {
      this.displayedColumns = ['select', 'patient', 'dob', 'gender', 'identifier', 'contact',  'practice', 'resource'];
    }
    if (this.useObservable) {
      this.dataSource = new PatientDataSource( undefined, this.patientsObservable, this.useObservable);
    } else {
      if (this.patients !== undefined) {
        this.dataSource = new PatientDataSource( this.patients, undefined, this.useObservable);
      }
    }
  }

  getFirstAddress(patient: fhir4.Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.address === undefined || patient.address.length === 0) {
      return '';
    }
    return patient.address[0].line.join(', ') + ', ' + patient.address[0].city + ', ' + patient.address[0].postalCode;

  }
  getLastName(patient: fhir4.Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.name === undefined || patient.name.length === 0) {
      return '';
    }

    let name = '';
    if (patient.name[0].family !== undefined) { name += patient.name[0].family.toUpperCase(); }
   return name;

  }
  getFirstName(patient: fhir4.Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.name === undefined || patient.name.length === 0) {
      return '';
    }
    // Move to address
    let name = '';
    if (patient.name[0].given !== undefined && patient.name[0].given.length > 0) {
      name += ', ' + patient.name[0].given[0];
    }

    if (patient.name[0].prefix !== undefined && patient.name[0].prefix.length > 0) {
      name += ' (' + patient.name[0].prefix[0] + ')' ;
    }
    return name;

  }

  getFirstTelecom(patient: fhir4.Patient): String {
    if (patient === undefined) {
      return '';
    }
    if (patient.telecom === undefined || patient.telecom.length === 0) { return ''; }
    // Move to address
    return patient.telecom[0].value;

  }

  getIdentifier(identifier: fhir4.Identifier): String {

    let name: String = identifier.system;
    if (identifier.system.indexOf('nhs-number') !== -1) {
      name = 'NHS Number';
    } else if (identifier.system.indexOf('pas-number') !== -1) {
      name = 'PAS Number';
    } else if (identifier.system.indexOf('PPMIdentifier') !== -1) {
      name = 'LTH PPM Id';
    }
    else if (identifier.system.indexOf('Patient/DBID') !== -1) {
      name = 'EMIS Id';
    }
    else if (identifier.system.indexOf('ID') !== -1) {
      name = 'Patient Id';
    }
    return name;
  }

  getNHSIdentifier(patient: fhir4.Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.identifier === undefined || patient.identifier.length === 0) { return ''; }
    // Move to address
    let NHSNumber: String = '';
    for (let f = 0; f < patient.identifier.length; f++) {
      if (patient.identifier[f].system.includes('nhs-number') ) {
        NHSNumber = patient.identifier[f].value.substring(0, 3) + ' '
          + patient.identifier[f].value.substring(3, 6) + ' ' + patient.identifier[f].value.substring(6);
      }
    }
    return NHSNumber;

  }



  selectPatient(patient: fhir4.Patient) {
    this.patient.emit(patient);
  }
  select(resource) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource: resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }

}
