import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from "../../dialog/resource-dialog/resource-dialog.component";
import {TdDialogService} from '@covalent/core/dialogs';
import {FhirService} from "../../services/fhir.service";
import {LinksService} from "../../services/links.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-document-reference',
  templateUrl: './document-reference.component.html',
  styleUrls: ['./document-reference.component.css']
})
export class DocumentReferenceComponent implements OnInit {

  @Input() documents: fhir.DocumentReference[];

  @Input() documentsTotal: number;

  @Input() patientId: string;

  @Output() documentReference = new EventEmitter<any>();


  dataSource: any;
  resourcesLoaded = false;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['open', 'date','type','title', 'typelink', 'author','authorLink', 'mime', 'status', 'resource'];

  constructor(private router: Router,
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef,
              public fhir: FhirService,

              private linkService: LinksService,
              public dialog: MatDialog) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      this.dataSource = new MatTableDataSource <any>(this.documents);

      this.fhir.queryDocumentReferences(this.patientId);
      this.fhir.documentReferencesChanged.subscribe(() => {
        this.resourcesLoaded = true;
        this.documents = this.fhir.getDocumentReferences();
        this.dataSource = new MatTableDataSource(this.documents);
        this.dataSource.sort = this.sort;
      });
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

  selectDocument(document: fhir.DocumentReference) {

    this.documentReference.emit(document);

  }



  getMime(mimeType: string) {

    switch (mimeType) {
        case 'application/fhir+xml':
        case 'application/fhir+json':
          return 'FHIR Document';

        case 'application/pdf':
          return 'PDF';
        case 'image/jpeg':
          return 'Image';
    }
    return mimeType;
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
