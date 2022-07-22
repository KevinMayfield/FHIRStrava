import {Component, Input, OnInit, ViewContainerRef} from '@angular/core'

import {ActivatedRoute} from '@angular/router';
import {IAlertConfig, TdDialogService} from '@covalent/core/dialogs';
import {FhirService} from "../../services/fhir.service";

@Component({
  selector: 'app-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.css']
})
export class BinaryComponent implements OnInit {

  @Input()
  private document: fhir.DocumentReference;

  @Input() serverName: string;

  public docFound: boolean =false;


  constructor(
              private fhirService: FhirService,
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef,
              private route: ActivatedRoute) { }

  ngOnInit() {

    if (this.serverName === 'AWS') {
      if (this.document !== undefined && this.document.content !== undefined && this.document.content[0].attachment !== undefined) {
        var paths = this.document.content[0].attachment.url.split('Binary/');
        console.log(paths[1]);
        this.fhirService.getResource(this.serverName, '/Binary/'+ paths[1] ).subscribe(resource => {
            // this.process(resource);
            console.log(resource);
            if (resource.presignedGetUrl !== undefined) {
              this.fhirService.getBinary(resource.presignedGetUrl).subscribe(image => {
                const fileURL = URL.createObjectURL(image);
                console.log(fileURL);
              });
            }
          },
          () => {
            const alertConfig: IAlertConfig = {message: 'Unable to locate document.'};
            alertConfig.disableClose = false; // defaults to false
            alertConfig.viewContainerRef = this._viewContainerRef;
            alertConfig.title = 'Alert'; // OPTIONAL, hides if not provided
            alertConfig.closeButton = 'Close'; // OPTIONAL, defaults to 'CLOSE'
            alertConfig.width = '400px'; // OPTIONAL, defaults to 400px
            console.log('binary not found for' + this.document.id)
            //this._dialogService.openAlert(alertConfig);
          });
      }

    }
  }

  process(resource: any) {
    this.document = <fhir.DocumentReference> resource;


  }


}
