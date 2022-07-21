import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {LinksService} from "../../services/links.service";
import {FhirService} from "../../services/fhir.service";
import {FHIREvent} from "../../model/eventModel";

@Component({
  selector: 'app-allergy-intolerance',
  templateUrl: './allergy-intolerance.component.html',
  styleUrls: ['./allergy-intolerance.component.css']
})
export class AllergyIntoleranceComponent implements OnInit {

  @Input() allergies: fhir.AllergyIntolerance[];

  @Output() allergy = new EventEmitter<any>();

  @Input() patientId: string;

  @Input() serverName: string;

  dataSource: any;
  resourcesLoaded = false;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['asserted','onset', 'code','codelink','reaction', 'clinicalstatus','verificationstatus', 'resource'];

  constructor(private linksService: LinksService,
              public dialog: MatDialog,
            public fhir: FhirService
  ) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.allergies);

      this.fhir.queryAllergies(this.serverName,this.patientId);
      this.fhir.allergiesChanged.subscribe((allergies : FHIREvent) => {
          if (allergies.serverName === this.serverName) {
            this.resourcesLoaded = true;
            this.allergies = allergies.allergies;
            this.dataSource = new MatTableDataSource(this.allergies);
            this.dataSource.sort = this.sort;
          }
        }, () =>
        {
          this.resourcesLoaded = true;
        }
      );
    }
  }
  getCodeSystem(system: string): string {
    return this.linksService.getCodeSystem(system);
  }

  getSNOMEDLink(code: fhir.Coding) {
    if (this.linksService.isSNOMED(code.system)) {
      window.open(this.linksService.getSNOMEDLink(code), '_blank');
    }
  }

  isSNOMED(system: string): boolean {
    return this.linksService.isSNOMED(system);
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
