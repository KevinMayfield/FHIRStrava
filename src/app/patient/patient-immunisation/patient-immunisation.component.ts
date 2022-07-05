import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-patient-immunisation',
  templateUrl: './patient-immunisation.component.html',
  styleUrls: ['./patient-immunisation.component.scss']
})
export class PatientImmunisationComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }
  patientId = undefined;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientid');
    console.log(this.patientId);
  }

}
