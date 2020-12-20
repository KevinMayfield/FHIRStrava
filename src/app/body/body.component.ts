import { Component, OnInit } from '@angular/core';
import {StravaService} from "../strava.service";
import {Athlete} from "../models/athlete";
import {SummaryActivity} from "../models/summary-activity";
import {ActivityDataSource} from "../activity-data-source";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";


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

  activityDisplayedColumns = ['link', 'date', 'type', 'name',  'powerlink', 'energy', 'distance', 'duration', 'suffer'];

  activities : SummaryActivity[] = [];

  ngOnInit(): void {



    if (localStorage.getItem('accessToken') != undefined) {
       this.strava.accesToken = localStorage.getItem('accessToken');
    }

    if (this.strava.accesToken != undefined) {
      this.connect = false;

      this.getAthlete();
      this.getActivities()
    }
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
      }
    );
  }

  round(num) {
    return Math.round(num);
  }
}
