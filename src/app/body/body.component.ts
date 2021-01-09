import {Component, HostListener, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {StravaService} from "../services/strava.service";
import {Athlete} from "../models/athlete";
import {SummaryActivity} from "../models/summary-activity";
import {DatePipe} from "@angular/common";
import {WithingsService} from "../services/withings.service";
import {Obs} from "../models/obs";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {TdLoadingService} from "@covalent/core/loading";

import {IhealthService} from "../services/ihealth.service";

import {HrvService} from "../services/hrv.service";

// @ts-ignore
import Observation = fhir.Observation;
// @ts-ignore
import Bundle = fhir.Bundle;
import {PhrService} from "../services/phr.service";
import {FhirService} from "../services/fhir.service";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  constructor(private strava: StravaService,
              private withings: WithingsService,
              private hrv: HrvService,
              private ihealth: IhealthService,
              private phr: PhrService,
              private _loadingService: TdLoadingService,
              private fhirService : FhirService) {
    this.onResize();
  }

  weight = true;
  pwv = false;
  overlayStarSyntax: boolean = false;

  screenWidth : number;
  screenHeight : number;

  athlete: Athlete;

  stravaConnect = true;

  stravaComplete = false;

  datepipe: DatePipe = new DatePipe('en-GB')


  activityDisplayedColumns = ['start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_cadence', 'average_heartrate', 'weighted_average_watts', 'kilojoules', 'suffer_score', 'intensity'];


  showMeasures = false;

 // obs: Obs[] = [];

  activityDataSource: MatTableDataSource<SummaryActivity>;

  activities: SummaryActivity[] = [];

  tabValue: string = 'strava';



  intensityRange = {
    "tough": 95,
    "medium": 80,
    "low": 65
  };
  sufferRange = {
    "tough": 400,
    "medium": 200,
    "low": 50
  };
  enerygRange = {
    "tough": 1500,
    "medium": 1000,
    "low": 600
  }

  @ViewChild(MatSort) sort: MatSort;

  sleepscore = false;
  bp = false;


  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      this.activityDataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  ngOnInit(): void {


    // this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

    this.activities = [];

    this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);

    this.ihealth.tokenChange.subscribe(
      token => {
        console.log('iHealth token present')
        this.showMeasures = true;
        this.fhirService.patientChange.pipe(first()).subscribe(result => {
            this.ihealth.getSpO2();

          }
        )
      }
    )
    this.withings.tokenChange.subscribe(
      token => {
        this.showMeasures = true;
        // Have ok to query withings but need to wait until FHIR patient (and initialisation) present
        //
        this.fhirService.patientChange.pipe(first()).subscribe(result => {
            this.withings.getObservations();
            this.withings.getDayActivity();
            this.withings.getSleep();
          }
        )
      }
    )
    this.strava.tokenChange.subscribe(
      token => {
        if (token != undefined) this.stravaConnect = false;
        this.stravaLoad();
      }
    );

    this.fhirService.loaded.subscribe(result => {
      console.log("FHIR CDR Loaded");
      this.loadComplete();
      if (result) {
        this.showMeasures = true;
       // console.log("FHIR CDR Processing results " + result.length);
        this.processIHealthGraph(result);
        this.processHRVGraph(result);
        this.buildGraph(result);
      }
    });

    this.strava.loaded.subscribe(result => {
     console.log("Strava Loaded");
      this.loadComplete();
      if (result) {

        this.activities = this.strava.activities;
        this.stravaComplete = true;

        this.activityDataSource.data = this.activities;
        // Convert Activities into Observations
        this.processStravaObs();

      } else {
        console.log('Strava Loaded - No result');
      }
    });
    this.withings.loaded.subscribe(result => {
      console.log("Withings Loaded");
      if (result) {
        this.buildGraph(result);
      }
    });
    this.ihealth.loaded.subscribe(result => {
      console.log("iHealth Loaded");
      console.log(result);
      if (result) {
        this.buildGraph(result);
      }
    });
    this.phr.dateRangeChange.subscribe(result => {
      console.log('Date Changed '+ result);
      this.phrLoad(true);
    })

    this.strava.connect();
    this.withings.connect();
    this.ihealth.connect()
  }

  stravaLoad() {
    this.getAthlete();

    this.phrLoad(false);
  }

  loadComplete() {
    this._loadingService.resolve('overlayStarSyntax');
  }

  loadStart() {
    this._loadingService.register('overlayStarSyntax');
  }

  phrLoad(withing : boolean) {
    this.stravaComplete = false;
    this.clearCharts();
    this.loadStart();
    this.strava.getActivities();
    this.ihealth.getSpO2();

    if (this.showMeasures && withing) {
      this.withings.getObservations();
      this.withings.getDayActivity();
      this.withings.getSleep();
    }

    this.fhirService.getServerObservations(this.phr.getFromDate(),this.phr.getToDate());
  }

  clearCharts() {
    this.phr.alerts = [];
    this.activities = [];
    this.activityDataSource.data = this.activities;
    for (const chart of this.phr.charts) {
      chart.chart = [];
    }
    for (const chart of this.phr.bars) {
      chart.chart = [];
    }
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



  connectStrava() {

    this.athlete = undefined;
    this.activities = undefined;

    this.strava.authorise(window.location.href);
  }


  getAthlete() {

    this.strava.getAthlete().subscribe(
      result => {
        this.athlete = result;
        this.strava.setAthlete(result);

      },
      (err) => {
        console.log(err);
        if (err.status == 401) {
          this.stravaConnect = true;
        }
      }
    );
  }


  processStravaObs() {
    var observations : Obs[] = [];
    for (const activity of this.activities) {
      var date = new Date(activity.start_date).toISOString();
        var obs: Obs = {
          'obsDate': new Date(date),
          'name': activity.name,
          'suffer': activity.suffer_score,
          'energy': activity.kilojoules,
          'average_heartrate': activity.average_heartrate,
          'weighted_average_watts': activity.weighted_average_watts,
          'distance': activity.distance / 1000,
          'duration': Math.round(activity.moving_time),
          'intensity': activity.intensity
        }
        observations.push(obs);
    }
    this.buildGraph(observations);
  }

  round(num) {
    return Math.round(num);
  }



  openStrava(id) {

    window.open(
      'https://www.strava.com/activities/' + id,
      '_blank' // <- This is what makes it open in a new window.
    );
  }

  openPowerCC(id) {

    window.open(
      'https://power-meter.cc/activities/' + id + '/power-analysis',
      '_blank' // <- This is what makes it open in a new window.
    )
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




  buildGraph(observations : Obs[]) {


    for (const obs of observations) {
      if (obs.weight != undefined) {
        this.addEntry(0, 0, "Weight", {
          name: obs.obsDate,
          value: obs.weight
        });
        if (obs.hydration != undefined) {
          this.addEntry(1, 0, "Hydration", {
            name: obs.obsDate,
            value: Math.round((obs.hydration / obs.weight) * 1000) / 10
          })
        }
        if (obs.muscle_mass != undefined) {
          this.addEntry(1, 1, "Muscle Mass", {
            name: obs.obsDate,
            value: Math.round((obs.muscle_mass / obs.weight) * 1000) / 10
          });
        }
        if (obs.fat_mass != undefined) {
          this.addEntry(1, 2, "Fat Mass", {
            name: obs.obsDate,
            value: Math.round((obs.fat_mass / obs.weight) * 1000) / 10
          })
        }
      }
      if (obs.pwv != undefined) {
        this.addEntry(2, 0, "PVW", {
          name: obs.obsDate,
          value: obs.pwv
        });
      }

      if (obs.sleep_score != undefined) {
        this.addEntry(3, 0, "Sleep Score", {
          name: obs.obsDate,
          value: obs.sleep_score
        })
      }
      if (obs.diastolic != undefined && obs.systolic != undefined) {
        this.addEntry(4, 0, "Systolic", {
          name: obs.obsDate,
          value: obs.systolic
        });
        this.addEntry(4, 1, "Diastolic", {
          name: obs.obsDate,
          value: obs.diastolic
        });

      }
      if (obs.sleep_duration != undefined) {
        this.addEntry(5, 0, "Sleep Duration", {
          name: obs.obsDate,
          value: obs.sleep_duration
        })
        if (obs.deepsleepduration != undefined) {
          this.addEntry(6, 0, "Deep Sleep Duration", {
            name: obs.obsDate,
            value: obs.deepsleepduration
          })
        }
        if (obs.lightsleepduration != undefined) {
          this.addEntry(6, 1, "Light Sleep Duration", {
            name: obs.obsDate,
            value: obs.lightsleepduration
          })
        }
        if (obs.remsleepduration != undefined) {
          this.addEntry(6, 2, "REM Sleep Duration", {
            name: obs.obsDate,
            value: obs.remsleepduration
          })
        }
      }
      if (obs.bodytemp != undefined) {
        this.addEntry(12,0,"Body Temperature",{
          name: obs.obsDate,
          value: obs.bodytemp
        })
      }
      var chartNum = 0;
      var chartName= '';
      if (obs.energy != undefined && obs.energy > 0 && obs.duration != undefined) {
        if (obs.energy != +obs.energy) console.log(obs.energy);
        if (obs.duration != +obs.duration) console.log(obs.duration);

        var energy = obs.energy / (obs.duration / 600);
        if (energy < 80) {
          chartNum = 0;
          chartName= "Endurance";
        } else if (energy < 110) {
          chartNum = 1;
          chartName = 'Moderate';
        } else if (energy < 130) {
          chartNum = 2;
          chartName = 'Tempo';
        } else {
          chartNum = 3;
          chartName= 'Threshold';
        }
        this.addBarChartEntry(0,chartNum,chartName,{
          name: obs.name,
          x: obs.obsDate,
          y: +obs.energy,
          r: +energy
        });
      }
      if (obs.suffer != undefined && obs.suffer > 0 && obs.duration != undefined) {

        var suffer = obs.suffer / (obs.duration / 600);
        if (suffer < 10) {
          chartNum = 0;
          chartName= "Endurance";
        } else if (suffer < 20) {
          chartNum = 1;
          chartName = 'Moderate';
        } else if (suffer < 30) {
          chartNum = 2;
          chartName = 'Tempo';
        } else {
          chartNum = 3;
          chartName= 'Threshold';
        }
        this.addBarChartEntry(1,chartNum,chartName,{
          name: obs.name,
          x: obs.obsDate,
          y: +obs.suffer,
          r: +suffer
        });
      }
      if (obs.intensity != undefined && obs.intensity > 0 && this.isNum(obs.intensity) && obs.duration != undefined) {

        if (obs.intensity < this.intensityRange.low) {
          chartNum = 0;
          chartName= "Endurance";
        } else if (obs.intensity < this.intensityRange.medium) {
          chartNum = 1;
          chartName = 'Moderate';
        } else if (obs.intensity < this.intensityRange.tough) {
          chartNum = 2;
          chartName = 'Tempo';
        } else {
          chartNum = 3;
          chartName= 'Threshold';
        }
        this.addBarChartEntry(2,chartNum,chartName,{
          name: obs.name,
          x: obs.obsDate,
          y: obs.duration / 3600,
          r: +obs.intensity
        });
      }

      if (obs.average_heartrate != undefined && obs.average_heartrate > 0 && this.isNum(obs.average_heartrate) && obs.duration != undefined) {
        var intensity = (obs.average_heartrate / this.phr.maxhr) * 100;
        if (intensity < this.intensityRange.low) {
          chartNum = 0;
          chartName= "Endurance";
        } else if (intensity < this.intensityRange.medium) {
          chartNum = 1;
          chartName = 'Moderate';
        } else if (intensity < this.intensityRange.tough) {
          chartNum = 2;
          chartName = 'Tempo';
        } else {
          chartNum = 3;
          chartName= 'Threshold';
        }
        this.addBarChartEntry(3,chartNum,chartName,{
          name: obs.name,
          x: obs.obsDate,
          y: obs.duration / 3600,
          r: +intensity
        });
      }

    }
  }
  addEntry(chart : number, series : number, name: string, entry) {

    if (this.phr.charts[chart] === undefined) return;
    while (this.phr.charts[chart].chart.length < (series+1)) {
      this.phr.charts[chart].chart.push( {
        series: []
      });
    }
    if (this.phr.charts[chart].chart[series].name == undefined) {
      this.phr.charts[chart].chart[series].name = name;
    }
    this.phr.charts[chart].chart[series].series.push(entry);
  }

  addBarChartEntry(chart : number, series : number, name: string, entry) {

    if (this.phr.bars[chart] === undefined) return;
    while (this.phr.bars[chart].chart.length < (series+1)) {
      this.phr.bars[chart].chart.push( {
        series: []
      });
    }
    if (this.phr.bars[chart].chart[series].name == undefined) {
      this.phr.bars[chart].chart[series].name = name;
    }
    this.phr.bars[chart].chart[series].series.push(entry);
  }



  processHRVGraph(observations : Obs[]) {

    for (const obs of observations) {
      if (obs.sdnn != undefined) {
        this.addEntry(7,0,"HRV",{
          name: obs.obsDate,
          value: obs.sdnn
        })
      }
      if (obs.recoverypoints != undefined) {
        this.addEntry(8,0,"Recovery",{
          name: obs.obsDate,
          value: obs.recoverypoints
        })

      }
      if (obs.vo2max != undefined) {
        this.addEntry(9,0,"VO2 Max",{
          name: obs.obsDate,
          value: obs.vo2max
        })
      }
    }

  }

  processIHealthGraph(observations: Obs[]) {

    for (const obs of observations) {
      if (obs.spo2 != undefined) {
        this.addEntry(10,0,"SP02",{
          name: obs.obsDate,
          value: obs.spo2
        })
      }
      if (obs.pi != undefined && obs.pi < 50) {
        this.addEntry(11,0,"Perfusion Index",{
          name: obs.obsDate,
          value: obs.pi
        })
      }
    }
  }


}
