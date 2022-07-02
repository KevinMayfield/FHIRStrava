import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from "@angular/router";

import {FhirService} from "../services/fhir.service";
import {FormControl} from "@angular/forms";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(

    private  fhirService : FhirService,

    private route : Router,
    private auth: AuthService) {
    this.onResize();
  }

  screenWidth : number;
  screenHeight : number;

  files: File | FileList;

  name: string = 'My PHR';

  durations  = [
    {value: 7, viewValue: 'Week'},
    {value: 28, viewValue: '4 Weeks'},
    {value: 91, viewValue: 'Quarter'},
    {value: 365, viewValue: 'Year'}
  ];
  selected = undefined;

 // fromDate : any = undefined;
  toDate : any = undefined;
  @HostListener
  ('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }
  ngOnInit(): void {


    this.toDate = new FormControl(new Date());
    //this.fromDate = new FormControl(this.phr.getFromDate());

    // Should be defined as login should have occured
    if (this.auth.currentUser != undefined) {
      this.name = this.auth.currentUser.attributes.name;
    }
    this.auth.tokenChange.subscribe(result => {
      console.log(this.auth.currentUser);
      console.log(this.auth.currentUser.username);
      this.name = this.auth.currentUser.attributes.name;
    })

    // These deal with loading the FHIR server and are triggered by


  }


  dateToChanged(value: string) {

  }

  selectDuration($event) {

  }
}
