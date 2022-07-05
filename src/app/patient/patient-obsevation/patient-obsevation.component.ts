import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-patient-obsevation',
  templateUrl: './patient-obsevation.component.html',
  styleUrls: ['./patient-obsevation.component.scss']
})
export class PatientObservationComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }
  patientId = undefined;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientid');
    console.log(this.patientId);
  }

}
