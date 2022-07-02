import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from "../../services/fhir.service";
import {LinksService} from "../../services/links.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";


@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})
export class ConditionComponent implements OnInit {

  @Input() conditions: fhir.Condition[];

  @Input() patientId: string;

  @Input() useBundle :boolean = false;

  @Output() condition = new EventEmitter<fhir.Condition>();

  @Output() encounter = new EventEmitter<fhir.Reference>();
  resourcesLoaded = false;

  dataSource : any;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['asserted','onset', 'code','codelink','category','categorylink', 'clinicalstatus','severity','asserterLink','contextLink', 'resource'];

  constructor(
              public  linkService: LinksService,
              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.conditions);

        this.fhir.queryConditions(this.patientId);
        this.fhir.conditionsChanged.subscribe(() => {
          this.resourcesLoaded = true;
          this.conditions = this.fhir.getConditions();
          this.dataSource = new MatTableDataSource(this.conditions);
          this.dataSource.sort = this.sort;
        });
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
  getCodeSystem(system: string): string {
    return this.linkService.getCodeSystem(system);
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



  showEncounter(condition: fhir.Condition) {

    this.encounter.emit(condition.context);

  }


}
