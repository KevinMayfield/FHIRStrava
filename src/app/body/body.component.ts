import {Component, HostListener, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {DatePipe} from "@angular/common";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {TdLoadingService} from "@covalent/core/loading";
// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Bundle = fhir.Bundle;
import {FhirService} from "../services/fhir.service";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(
              private _loadingService: TdLoadingService,
              private fhirService : FhirService,
              private auth: AuthService) {
    this.onResize();
  }

  weight = true;
  pwv = false;
  overlayStarSyntax: boolean = false;

  screenWidth : number;
  screenHeight : number;

  stravaConnect = true;

  stravaComplete = false;

  datepipe: DatePipe = new DatePipe('en-GB')


  activityDisplayedColumns = ['start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_cadence', 'average_heartrate', 'weighted_average_watts', 'kilojoules', 'suffer_score', 'intensity'];


  showMeasures = false;
  ihealthToken = false;
  withingsToken = false;
  stravaPatient = false;

 // obs: Obs[] = [];


  tabValue: string = 'strava';


  @ViewChild(MatSort) sort: MatSort;

  sleepscore = false;
  bp = false;


  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      //this.activityDataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  ngOnInit(): void {


    // this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

   // this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);

    this.fhirService.loaded.subscribe(result => {
      console.log("FHIR CDR Loaded");
      this.loadComplete();
      if (result) {
        this.showMeasures = true;
       // console.log("FHIR CDR Processing results " + result.length);

      }
    });
    this.fhirService.patientChange.subscribe( result => {
      if (result != undefined) {
        console.log('FHIR Patient present');

      }

    })



  }

  loadComplete() {
    this._loadingService.resolve('overlayStarSyntax');
  }

  loadStart() {
    this._loadingService.register('overlayStarSyntax');
  }



  pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  hhmm(num) {
    var min = Math.round(num / 60);
    var mins = this.pad(Math.round((min % 60)), 2)
    return Math.trunc(min / 60) + ':' + mins.substring(0, 2);
  }

  ratio(kj, suffer) {
    if (kj != +kj) return '';
    if (suffer != +suffer) return '';
    var ratio = +(kj / suffer);
    ratio = Math.round(ratio * 10) / 10;
    return ratio;
  }

  isNum(val) {
    return (val === +val);
  }

  round(num) {
    return Math.round(num);
  }




  @HostListener
  ('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > 740) {
      this.activityDisplayedColumns = [ 'start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_cadence', 'average_heartrate', 'weighted_average_watts', 'kilojoules', 'suffer_score', 'intensity'];
    } else if (this.screenWidth > 640 ) {
      this.activityDisplayedColumns = [ 'start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_heartrate', 'kilojoules', 'suffer_score', 'intensity'];
    } else if (this.screenWidth > 375 ) {
      this.activityDisplayedColumns = ['start_date', 'type', 'name', 'moving_time',  'kilojoules', 'suffer_score', 'intensity'];
    } else {
      this.activityDisplayedColumns = ['start_date', 'type', 'name', 'moving_time',  'kilojoules', 'suffer_score'];
    }
  }















}
