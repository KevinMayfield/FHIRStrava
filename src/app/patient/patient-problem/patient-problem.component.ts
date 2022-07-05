import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-patient-problem',
  templateUrl: './patient-problem.component.html',
  styleUrls: ['./patient-problem.component.scss']
})
export class PatientProblemComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }
  patientId = undefined;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientid');
    console.log(this.patientId);
  }
}
