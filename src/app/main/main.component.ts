import {Component, HostListener, OnInit} from '@angular/core';
import {StravaService} from "../services/strava.service";
import {Router} from "@angular/router";
import {WithingsService} from "../services/withings.service";
import {IhealthService} from "../services/ihealth.service";
import {HrvService} from "../services/hrv.service";
import {FhirService} from "../services/fhir.service";
import {PhrService} from "../services/phr.service";
import {FormControl} from "@angular/forms";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private strava: StravaService,
    private withings: WithingsService,
              private hrv : HrvService,
              private ihealth: IhealthService,
            private  fhirService : FhirService,
    public phr : PhrService,
    private route : Router,
    private auth: AuthService) {
    this.onResize();
  }

  screenWidth : number;
  screenHeight : number;

  files: File | FileList;

  withingsConnect = true;

  ihealthConnect = true;
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

    this.selected = this.phr.getDuration();
    this.toDate = new FormControl(new Date());
    //this.fromDate = new FormControl(this.phr.getFromDate());
    this.withings.tokenChange.subscribe(
      token => {

        if (token != undefined) this.withingsConnect = false;
      }
    );
    this.ihealth.tokenChange.subscribe(
      token => {

        if (token != undefined) this.ihealthConnect = false;
      }
    );
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

    this.hrv.hrvChange.subscribe(result => {

      this.fhirService.postTransaction(result);
    })

    this.ihealth.iHealthChange.subscribe(result => {
      this.fhirService.postTransaction(result);
    });
/*
    this.strava.athleteChange.subscribe(
      athlete  => {
        var name = '';
        if (athlete.firstname != undefined) {
          name = athlete.firstname + ' ';
        }
        if (athlete.lastname != undefined) {
          name += athlete.lastname;
        }
        this.name = name;
      }
    );

 */
  }

  connectWithings() {
    this.withings.authorise(window.location.href);
  }

  connectIHealth() {
    this.ihealth.authorise(window.location.href);
  }


  selectEvent(files: FileList | File): void {
    if (files instanceof FileList) {
      console.log('Files '+ files);
    } else if (files instanceof File) {

      var file : File = files;
      //  console.log('file ' +  file);
      this.hrv.postCSVFile(file);
    }
  };

  selectSPO2Event(files: File | FileList) {
    if (files instanceof FileList) {
      console.log('Files '+ files);
    } else if (files instanceof File) {

      var file : File = files;
      //  console.log('file ' +  file);
      this.ihealth.postCSVFile(file);
    }
  }

  toggle(chart: any) {
    if (chart.ticked == undefined) chart.ticked = false;
    chart.ticked = !chart.ticked;
  }

  selectDuration(event) {
    if (!event.isUserInput) {


      this.phr.setFromDuration(this.selected);
    //  this.phrLoad(true);
    }
  }
  dateToChanged(event){
    this.phr.setToDate(this.toDate.value);
   //
  }

}
