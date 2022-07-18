import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from "../../services/fhir.service";
import {LinksService} from "../../services/links.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import Condition = fhir.Condition;
import {MatPaginator} from "@angular/material/paginator";


@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})
export class ConditionComponent implements OnInit {

  @Input() conditions: fhir.Condition[];

  @Input() patientId: string;

  @Input() useBundle :boolean = false;

  @Input() clinicalStatus :string = undefined;

  @Input() serverName: string;

  @Output() condition = new EventEmitter<fhir.Condition>();

  @Output() encounter = new EventEmitter<fhir.Reference>();
  resourcesLoaded = false;

  dataSource : any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['onsetDateTime', 'code','codelink','category','categorylink', 'clinicalStatus','severity','asserterLink','contextLink', 'resource'];

  constructor(
              public  linkService: LinksService,
              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.conditions);
        this.fhir.queryConditions(this.serverName,this.patientId, this.clinicalStatus);
        this.fhir.conditionsChanged.subscribe((conditions) => {
          this.resourcesLoaded = true;
          this.conditions = conditions;
          this.dataSource = new MatTableDataSource(this.conditions);
          /*
            this.dataSource.filterPredicate = (data:
                                                 {name: string}, filterValue: string) =>
              data.name.trim().toLowerCase().indexOf(filterValue) !== -1;
            this.applyFilter('dora');*/
            this.dataSource.sort = this.sort;
        }, () =>
      {
        this.resourcesLoaded = true;
      }
        );
      }
    }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  ngAfterViewInit() {
    console.log('Afterview init '+ this.sort)
    this.dataSource.sort = this.sort;
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
