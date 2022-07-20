import {Component, Input, OnInit, Output, ViewChild} from "@angular/core";
import {EventEmitter} from "events";
import {LinksService} from "../../services/links.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FhirService} from "../../services/fhir.service";
import {MatTableDataSource} from "@angular/material/table";
import Encounter = fhir.Encounter;
import {FHIREvent} from "../../model/eventModel";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";


@Component({
  selector: 'app-encounter',
  templateUrl: './encounter.component.html',
  styleUrls: ['./encounter.component.css']
})
export class EncounterComponent implements OnInit {

  @Input() encounters: fhir.Encounter[];

  locations: fhir.Location[];

  @Input() showDetail = false;

  @Input() patient: fhir.Patient;


  selectedEncounter: fhir.Encounter;

  @Input() patientId: string;

  @Input() useBundle = false;

  dataSource : any;

  resourcesLoaded = false;
  @Input() serverName: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = [ 'period.start', 'forms', 'resource'];

  constructor(public  linkService: LinksService,
              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.encounters);
      this.fhir.queryEncounters(this.serverName,this.patientId);
      this.fhir.encountersChanged.subscribe((event : FHIREvent) => {
          this.resourcesLoaded = true;
          this.encounters = event.encounters;
          this.dataSource = new MatTableDataSource(this.encounters);
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


}
