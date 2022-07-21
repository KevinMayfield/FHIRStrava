import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ResourceDialogComponent} from '../../dialog/resource-dialog/resource-dialog.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {LinksService} from "../../services/links.service";
import {FhirService} from "../../services/fhir.service";
import {FHIREvent} from "../../model/eventModel";

@Component({
  selector: 'app-medication-request',
  templateUrl: './medication-request.component.html',
  styleUrls: ['./medication-request.component.css']
})
export class MedicationRequestComponent implements OnInit {

  @Input() medicationRequests: fhir.MedicationRequest[];

  @Input() patientId: string;

  @Input() showDetail = false;

  @Input() serverName: string;

  @Output() medicationRequest = new EventEmitter<any>();

    @Output() context = new EventEmitter<any>();
  resourcesLoaded = false;
  dataSource : any;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [
    'medication', 'medicationlink', 'dose', 'quantity', 'route', 'routelink', 'instructions',
    'status', 'authored', 'visit',  'resource'];


  constructor(private linkService: LinksService,

              private fhir: FhirService,
              public dialog: MatDialog) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.medicationRequests);

      this.fhir.queryMedicationRequests(this.serverName,this.patientId);
      this.fhir.medicationRequestsChanged.subscribe((requests : FHIREvent) => {
        if (requests.serverName === this.serverName) {
          this.medicationRequests = requests.medicationRequests;
          this.resourcesLoaded = true;
          this.dataSource = new MatTableDataSource(this.medicationRequests);
          this.dataSource.sort = this.sort;
        }
      }, (event) =>
      {
        console.log(event);
        console.log('error');
        this.resourcesLoaded = true;
      }, (event) =>
      {
        console.log('complete');
        this.resourcesLoaded = true;
      });
    }

  }
  isSNOMED(system: string): boolean {
    return this.linkService.isSNOMED(system);
  }
  getCodeTip(codeableConcept : fhir.CodeableConcept) {
    for (var code of codeableConcept.coding) {
      if (this.linkService.isSNOMED(code.system)) {
        return "SNOMED "+code.code
      }
    }
    return undefined;
  }


  getDMDLink(codeableConcept: fhir.CodeableConcept) {
    for (var code of codeableConcept.coding) {
      if (this.linkService.isSNOMED(code.system)) {
        window.open(this.linkService.getDMDLink(code),  '_blank');
      }
    }
  }
  getSNOMEDLink(codeableConcept: fhir.CodeableConcept) {
    for (var code of codeableConcept.coding) {
      if (this.linkService.isSNOMED(code.system)) {
        window.open(this.linkService.getSNOMEDLink(code), '_blank');
      }
    }
  }
/*
  onClick(medicationRequest: fhir.MedicationRequest) {
    console.log('Clicked - ' + medicationRequest.id);
    this.selectedMeds = [];

    if (this.bundleService.getBundle() !== undefined) {

      if (medicationRequest.medicationReference != null) {
        console.log('medicationReference - ' + medicationRequest.medicationReference.reference);
        this.bundleService.getResource(medicationRequest.medicationReference.reference).subscribe(
          (medtemp) => {
            if (medtemp !== undefined && medtemp.resourceType === 'Medication') {
              console.log('meds list ' + medtemp.id);
              this.selectedMeds.push(<fhir.Medication> medtemp);

              const dialogConfig = new MatDialogConfig();

              dialogConfig.disableClose = true;
              dialogConfig.autoFocus = true;
              dialogConfig.data = {
                id: 1,
                medications: this.selectedMeds
              };
              const resourceDialog: MatDialogRef<MedicationDialogComponent> = this.dialog.open(MedicationDialogComponent, dialogConfig);
            }
          }
        );
      }
    } else {
      const reference = medicationRequest.medicationReference.reference;
      console.log(reference);
      const refArray: string[] = reference.split('/');
      if (refArray.length > 1) {
        this.fhirService.get('/Medication/' + (refArray[refArray.length - 1])).subscribe(data => {
            if (data !== undefined) {
              this.meds.push(<fhir.Medication>data);
              this.selectedMeds.push(<fhir.Medication>data);
            }
          },
          error1 => {
          },
          () => {
            console.log('Content = ');
            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.data = {
              id: 1,
              medications: this.selectedMeds
            };
            const resourceDialog: MatDialogRef<MedicationDialogComponent> = this.dialog.open( MedicationDialogComponent, dialogConfig);
          }
        );
      }
    }
  }
*/
  viewEncounter(request: fhir.MedicationRequest) {
    if (request.context !== undefined) {
      this.context.emit(request.context);
    }
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
