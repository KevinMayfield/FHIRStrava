import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-patient-medication',
  templateUrl: './patient-medication.component.html',
  styleUrls: ['./patient-medication.component.scss']
})
export class PatientMedicationComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }
  patientId = undefined;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientid');
    console.log(this.patientId);
  }

}
