import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatChip} from '@angular/material/chips';
import {IAlertConfig, TdDialogService} from '@covalent/core/dialogs';
import {FhirService} from "../../services/fhir.service";
import {EprService} from "../../services/epr.service";


@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css']
})
export class PatientSummaryComponent implements OnInit {


    lhcrcolor = 'info';
    Virtuallycolor = 'info';
    gpcolor = 'info';

    patientId = undefined;

    @ViewChild('gpchip', {static: false}) gpchip: MatChip;

  constructor(private router: Router,
              private fhir: FhirService,
              private route: ActivatedRoute,
              private eprService: EprService,
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef) { }

  ngOnInit() {

      this.patientId = this.route.snapshot.paramMap.get('patientid');

      console.log(this.patientId);

    this.fhir.queryPatients('AWS',this.patientId);
    this.fhir.patientsChanged.subscribe((patients) => {

      }, (error) =>
      {
        console.log(error);
      }
    );

      this.clearDown();

  }



    clearDown() {
    }

    selectEncounter(encounter: fhir4.Reference) {

        const str = encounter.reference.split('/');
        console.log(this.route.root);
        this.router.navigate(['..', 'encounter', str[1]] , { relativeTo : this.route});

    }

    selectCarePlan(carePlan: fhir4.Reference) {

        this.router.navigate(['..', 'careplan', carePlan.id] , { relativeTo : this.route});

    }



}
