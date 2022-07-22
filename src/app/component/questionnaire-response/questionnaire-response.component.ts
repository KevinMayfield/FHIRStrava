import {Component, Input, OnInit, ViewChild} from '@angular/core';
import Identifier = fhir.Identifier;
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FhirService} from "../../services/fhir.service";
import Bundle = fhir.Bundle;
import QuestionnaireResponse = fhir.QuestionnaireResponse;
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";

@Component({
  selector: 'app-questionnaire-response',
  templateUrl: './questionnaire-response.component.html',
  styleUrls: ['./questionnaire-response.component.scss']
})
export class QuestionnaireResponseComponent implements OnInit {

  @Input() encounter: string;
  resourcesLoaded = false;
  @Input() serverName: string;

  questionnaires : QuestionnaireResponse[] = [];

  dataSource : any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private fhir : FhirService,
              public dialog: MatDialog) { }
  displayedColumns = ['item', 'resource'];

  ngOnInit(): void {
      this.fhir.getQuesionnaireResponse('AWS',this.encounter).subscribe( result  => {
        const bundle = result as Bundle;
        this.questionnaires = [];
        for (const entry of bundle.entry) {
          this.questionnaires.push(entry.resource as fhir.QuestionnaireResponse);
        }
        this.dataSource = new MatTableDataSource(this.questionnaires);
        this.dataSource.sort = this.sort;
    });
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
