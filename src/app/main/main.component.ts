import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

import {FhirService} from "../services/fhir.service";
import {FormControl} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {TdMediaService} from "@covalent/core/media";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(
    public media: TdMediaService,
    private  fhirService : FhirService,
    private route: ActivatedRoute,
    private router : Router,
    private auth: AuthService) {
    this.onResize();
  }

  screenWidth : number;
  screenHeight : number;

  files: File | FileList;

  name: string = 'Virtually Test';

  durations  = [
    {value: 7, viewValue: 'Week'},
    {value: 28, viewValue: '4 Weeks'},
    {value: 91, viewValue: 'Quarter'},
    {value: 365, viewValue: 'Year'}
  ];
  selected = undefined;
  patient=false;
  patientId= undefined;
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
    this.router.events.subscribe((val) => {
      // see also

     // console.log(val instanceof NavigationEnd)
      if (val instanceof NavigationEnd) {
        if (this.router.url.startsWith('/patient')) {
          this.patient = true;
          var split = this.router.url.split('/');
         //amp console.log(split);
          if (split.length > 2 && split[1] === 'patient') {
              this.patientId = split[2]
          }
         // console.log(this.router.url);
        } else {
          this.patient= false;
        }

      }
    });

    // These deal with loading the FHIR server and are triggered by


  }

  onClickR(route) {
    console.log(this.patientId);
      if (this.patientId !== undefined) {
        this.router.navigate([ '/patient/'+this.patientId+'/'+ route ]);
      }
  }
  dateToChanged(value: string) {

  }

  selectDuration($event) {

  }
}
