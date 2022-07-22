import {Component, OnInit, ViewContainerRef} from '@angular/core'

import {ActivatedRoute} from '@angular/router';
import {IAlertConfig, TdDialogService} from '@covalent/core/dialogs';
import {FhirService} from "../../services/fhir.service";

@Component({
  selector: 'app-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.css']
})
export class BinaryComponent implements OnInit {

  private document: fhir.DocumentReference;

  public docType: string;

  public binaryId: string;

  private documentReferenceId: string;


  constructor(
              private fhirService: FhirService,
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef,
              private route: ActivatedRoute) { }

  ngOnInit() {

    this.documentReferenceId = this.route.snapshot.paramMap.get('docid');

    if (this.document !== undefined) {
     // this.process(this.patientEprService.documentReference);
    } else {
      if (this.documentReferenceId !== undefined) {
        this.fhirService.getResource('AWS','/DocumentReference/' + this.documentReferenceId).subscribe(resource => {
            this.process(resource);
          },
          () => {
            const alertConfig: IAlertConfig = {message: 'Unable to locate document.'};
            alertConfig.disableClose = false; // defaults to false
            alertConfig.viewContainerRef = this._viewContainerRef;
            alertConfig.title = 'Alert'; // OPTIONAL, hides if not provided
            alertConfig.closeButton = 'Close'; // OPTIONAL, defaults to 'CLOSE'
            alertConfig.width = '400px'; // OPTIONAL, defaults to 400px
            this._dialogService.openAlert(alertConfig);
          });
      }
    }

  }

  process(resource: any) {
    this.document = <fhir.DocumentReference> resource;
    this.processDocument();

  }

  processDocument() {
    // TODO KGM Need to move to actual URL
    // const array: string[] = this.document.content[0].attachment.url.split('/');
    // KGM 21 Jan 2019 Use given url rather than using binary Id
    this.binaryId = this.document.content[0].attachment.url;

    if (this.binaryId !== undefined) {
      if (this.document.content[0].attachment.contentType === 'application/fhir+xml'
      || this.document.content[0].attachment.contentType === 'application/fhir+json') {
        this.docType = 'fhir';
      } else if (this.document.content[0].attachment.contentType === 'application/pdf') {
        this.docType = 'pdf';
      } else if (this.document.content[0].attachment.contentType.indexOf('image') !== -1) {
        this.docType = 'img';
      }
    }
    // console.log('DocumentRef Id = ' + this.binaryId);
  }
}
