import { Component, OnInit } from '@angular/core';
import {StravaService} from "../strava.service";
import {Athlete} from "../models/athlete";
import {SummaryActivity} from "../models/summary-activity";
import {ActivityDataSource} from "../activity-data-source";
import {DatePipe} from "@angular/common";


@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(private strava: StravaService) {

  }


  athlete : Athlete;

  connect = true;

  activityDataSource: ActivityDataSource;

  datepipe: DatePipe = new DatePipe('en-GB')

  activityDisplayedColumns = ['link', 'date', 'type', 'name',  'powerlink',  'distance', 'duration','energy', 'suffer'];

  activities : SummaryActivity[] = [];

  ngOnInit(): void {

    if (localStorage.getItem('accessToken') != undefined) {
      var token: any = JSON.parse(localStorage.getItem('accessToken'));
       if (token != undefined) {
         this.strava.accesToken = token.access_token;

       }
    }

    if (this.strava.accesToken != undefined) {
      this.connect = false;

      this.getAthlete();
      this.getActivities()
    }
  }

  pad(num:number, size:number): string {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
  hhmm(num) {
    var min = Math.round(num/60);
    var mins = this.pad(Math.round((min%60) ),2)
    return Math.trunc(min/60) + ':' + mins.substring(0,2);
  }
  connectStrava() {

    this.athlete = undefined;
    this.activities = undefined;

    this.strava.authorise(window.location.href);
  }

  openStrava(id) {

    window.open(
      'https://www.strava.com/activities/'+id,
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  openPowerCC(id) {

    window.open(
      'https://power-meter.cc/activities/'+id+'/power-analysis',
      '_blank' // <- This is what makes it open in a new window.
    )
  }

  getAthlete() {

    this.strava.getAthlete().subscribe(
      result => {
        this.athlete = result;

      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.connect = true;
        }
      }
    );

  }
  getActivities() {
    this.strava.getActivities().subscribe(
      result => {

        this.activities = result;
        this.activityDataSource = new ActivityDataSource(this.activities);
      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.connect = true;
        }
      }
    );
  }

  round(num) {
    return Math.round(num);
  }

}
