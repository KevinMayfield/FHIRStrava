import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../dialog/resource-dialog/resource-dialog.component';
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {LinksService} from "../../services/links.service";
import {FhirService} from "../../services/fhir.service";
import {FHIREvent} from "../../model/eventModel";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  @Input() tasks: fhir.Task[];

  @Output() task = new EventEmitter<any>();

  @Input() patientId: string;

  @Input() useBundle = false;

  @Input() serverName: string;

  dataSource: any;
  resourcesLoaded = false;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['executionPeriod.start','alert', 'status', 'author', 'resource'];

  constructor(private linksService: LinksService,
              public dialog: MatDialog,
              public fhir: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.tasks);

      this.fhir.queryTasks(this.serverName,this.patientId);
      this.fhir.tasksChanged.subscribe((tasks : FHIREvent) => {
         if (tasks.serverName === this.serverName) {
           this.resourcesLoaded = true;
           this.tasks = tasks.tasks;
           this.dataSource = new MatTableDataSource(this.tasks);
           this.dataSource.sort = this.sort;
         }
        }, () =>
        {
          this.resourcesLoaded = true;
        }
      );
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
    this.dialog.open( ResourceDialogComponent, dialogConfig);
  }




}
