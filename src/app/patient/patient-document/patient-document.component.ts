import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-patient-document',
  templateUrl: './patient-document.component.html',
  styleUrls: ['./patient-document.component.scss']
})
export class PatientDocumentComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }
  patientId = undefined;
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientid');
    console.log(this.patientId);
  }

}
