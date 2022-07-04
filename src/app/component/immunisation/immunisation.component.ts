import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {LinksService} from "../../services/links.service";
import {FhirService} from "../../services/fhir.service";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";


@Component({
  selector: 'app-immunisation',
  templateUrl: './immunisation.component.html',
  styleUrls: ['./immunisation.component.css']
})
export class ImmunisationComponent implements OnInit {

  @Input() immunisations: fhir.Immunization[];

  @Input() patientId: string;

  dataSource : any;

  @ViewChild(MatSort) sort: MatSort | undefined;
  resourcesLoaded = false;


  displayedColumns = ['occurrenceDateTime', 'code','practitioner','codelink','indication','indicationlink','dose','status','procedure',  'resource'];

  constructor(private linkService: LinksService,
              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.immunisations);

      this.fhir.queryImmunizations(this.patientId);
      this.fhir.immunizationsChanged.subscribe(() => {
        this.resourcesLoaded = true;
        this.immunisations = this.fhir.getImmunizations();
        this.dataSource = new MatTableDataSource(this.immunisations);
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
