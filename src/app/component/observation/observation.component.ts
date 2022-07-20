import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {ResourceDialogComponent} from '../../dialog/resource-dialog/resource-dialog.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort, Sort} from "@angular/material/sort";
import {LinksService} from "../../services/links.service";
import {FhirService} from "../../services/fhir.service";
import {FHIREvent} from "../../model/eventModel";


@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.css']
})
export class ObservationComponent implements OnInit {

  @Input() observations: fhir.Observation[];

  @Input() showDetail = false;

  @Input() patientId: string;
  @Input() serverName: string;

  @Output() observation = new EventEmitter<fhir.Observation>();

  dataSource : any;
  @ViewChild(MatSort) sort: MatSort | undefined;

  resourcesLoaded = false;

  displayedColumns = ['effectiveDateTime', 'code', 'codelink', 'category', 'value',  'performer', 'resource'];

  constructor(private linkService: LinksService,

              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.observations);

      this.fhir.queryObservations(this.serverName, this.patientId);
      this.fhir.observationsChanged.subscribe((observations : FHIREvent) => {
        this.resourcesLoaded = true;
        if (observations.serverName === this.serverName) {
          this.observations = observations.observations;
          this.dataSource = new MatTableDataSource(this.observations);
          this.dataSource.sort = this.sort;
        }
      });
    }
  }



  getValue(observation: fhir.Observation): string {
    // console.log("getValue called" + observation.valueQuantity.value);
    if (observation === undefined) {
        return '';
    }

    if (observation.valueQuantity !== undefined ) {
      // console.log(observation.valueQuantity.value);
      let unit = '';
      if (observation.valueQuantity.unit !== undefined) {
        unit = observation.valueQuantity.unit;
      } else if (observation.valueQuantity.code !== undefined) {
        unit = observation.valueQuantity.code;
      }
      return observation.valueQuantity.value.toPrecision(4) + ' ' + unit;
    }

      if (observation.valueCodeableConcept !== undefined ) {
          return observation.valueCodeableConcept.coding[0].display;
      }

    if (observation.component === undefined || observation.component.length < 2) {
        return '';
    }
    // Only coded for blood pressures at present
    if (observation.component[0].valueQuantity === undefined ) {
        return '';
    }
    if (observation.component[1].valueQuantity === undefined ) {
        return '';
    }
    let unit0 = '';
    let unit1 = '';

    if (observation.component[0].code !== undefined && observation.component[0].code.coding !== undefined
        && observation.component[0].code.coding.length > 0) {
      unit0 = observation.component[0].code.coding[0].display;
    }
    if (observation.component[1].code !== undefined && observation.component[1].code.coding !== undefined
        && observation.component[1].code.coding.length > 0) {
      unit1 = observation.component[1].code.coding[0].display;
    }
    if (observation.component[0].valueQuantity.unit !== undefined) {
      unit0 = observation.component[0].valueQuantity.unit;
    } else if (observation.component[0].valueQuantity.code !== undefined) {
      unit0 = observation.component[0].valueQuantity.code;
    }
    if (observation.component[1].valueQuantity.unit !== undefined) {
      unit1 = observation.component[1].valueQuantity.unit;
    } else if (observation.component[1].valueQuantity.code !== undefined) {
      unit1 = observation.component[1].valueQuantity.code;
    }

    if (unit0 === unit1 || unit1 === '') {
      return observation.component[0].valueQuantity.value + '/' + observation.component[1].valueQuantity.value + ' ' + unit0;
    } else {
      return observation.component[0].valueQuantity.value + '/' + observation.component[1].valueQuantity.value + ' ' + unit0 + '/' + unit1;
    }

  }



  getCodeTip(codeableConcept : fhir.CodeableConcept) {
    for (var code of codeableConcept.coding) {
      if (this.linkService.isSNOMED(code.system)) {
        return "SNOMED "+code.code
      }
    }
    return undefined;
  }

  isSNOMED(system: string): boolean {
    return this.linkService.isSNOMED(system);
  }

  getSNOMEDLink(codeableConcept: fhir.CodeableConcept) {
    for (var code of codeableConcept.coding) {
      if (this.linkService.isSNOMED(code.system)) {
        window.open(this.linkService.getSNOMEDLink(code), '_blank');
      }
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





/*
    selectChart(observation: fhir.Observation) {

        if (observation !== undefined) {
            const dialogConfig = new MatDialogConfig();


            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.height = '620px';
            dialogConfig.width = '90%';
            dialogConfig.data = {
                resource: observation
            };

            console.log(observation.subject.reference);

            this.dialog.open(ObservationChartDialogComponent, dialogConfig);
        }
    }

 */
}
