import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
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
import {FormControl} from "@angular/forms";
import {Charts} from "../models/charts";
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

  }

  weight = true;
  pwv = false;
  overlayStarSyntax: boolean = false;


  athlete: Athlete;

  stravaConnect = true;

  stravaComplete = false;

  datepipe: DatePipe = new DatePipe('en-GB')

  durations  = [
    {value: 31, viewValue: 'Month'},
    {value: 91, viewValue: 'Quarter'},
    {value: 365, viewValue: 'Year'}
  ];
  selected = 91;
  charts : Charts[] = [
    {
      "unit": "Kg",
      "name": "Weight",
      "chart": []
    },
    {
      "unit": "%",
      "name": "Body Composition",
      "chart": []
    },
    {
      "unit": "m/s",
      "name": "Pulse Wave Velocity",
      "chart": []
    },
    {
      "unit": "score",
      "name": "Sleep Score",
      "chart": []
    },
    {
      "unit": "mmHg",
      "name": "Blood Pressure",
      "chart": []
    },
    {
      "unit": "h",
      "name": "Sleep Duration",
      "chart": []
    },
    {
      "unit": "h",
      "name": "Sleep Composition",
      "chart": []
    }
  ];

  bars : Charts[] = [
    {
      "unit": "kJ",
      "name": "Energy",
      "chart": [
      ]
    },
    {
      "unit": "Score",
      "name": "Suffer",
      "chart": [
        ]
    },
    {
      "unit": "hour",
      "name": "Intensity (Power)",
      "chart": []
    },
    {
      "unit": "hour",
      "name": "Intensity (HR)",
      "chart": []
    }
  ];

  hrvcharts : Charts[] = [
    {
      "unit": "SDNN",
      "name": "HRV",
      "chart": [
        ]
    },
    {
      "unit": "points",
      name: "Recovery",
      "chart": []
    },
    {
      "unit": "mL/(kg·min)",
      name: "VO2 Max",
      "chart": []
    },

  ];



  ihealthcharts: Charts[] =[
    {
      "unit": "%",
      "name": "SPO2",
      "chart": [
        {
          "name": "SPO2",
          "series": []
        }]
    },
    {
      "unit": "ratio",
      name: "Perfusion Index",
      "chart": [{
        name: "Perfusion Index",
        series: []
      }]
    }
  ];


  activityDisplayedColumns = ['link', 'start_date', 'type', 'name', 'powerlink', 'distance', 'moving_time', 'average_cadence', 'average_heartrate', 'weighted_average_watts', 'kilojoules', 'suffer_score', 'intensity'];


  showMeasures = false;

 // obs: Obs[] = [];

  activityDataSource: MatTableDataSource<SummaryActivity>;

  activities: SummaryActivity[] = [];

  tabValue: string = 'strava';

  fromDate : any = undefined;
  toDate : any = undefined;


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


    this.toDate = new FormControl(new Date());
    this.fromDate = new FormControl(this.phr.getFromDate());

    // this.obsDataSource = new MatTableDataSource<Obs>(this.obs);

    this.activities = [];

    this.activityDataSource = new MatTableDataSource<SummaryActivity>(this.activities);

    this.ihealth.tokenChange.subscribe(
      token => {
        this.showMeasures = true;

      }
    )
    this.withings.tokenChange.subscribe(
      token => {
        this.showMeasures = true;
        // Have ok to query withings but need to wait until FHIR patient (and initialisation) present
        //
        this.fhirService.patientChange.pipe(first()).subscribe(result => {
            this.withings.getObservations();
            this.withings.getWorkouts();
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
      if (result) {
       // console.log("FHIR CDR Processing results " + result.length);
        this.processIHealthGraph(result);
        this.processHRVGraph(result);
        this.buildGraph(result);
      }
    });

    this.strava.loaded.subscribe(result => {
     console.log("Strava Loaded");
      if (result) {

        this.activities = this.strava.activities;
        this.stravaComplete = true;
        this._loadingService.resolve('overlayStarSyntax');
        this.activityDataSource.data = this.activities;
        // Convert Activities into Observations
        this.processStravaObs();

      }
    });
    this.withings.loaded.subscribe(result => {
      console.log("Withings Loaded");
      if (result) {

     // REENABLE   this.buildGraph(result);
      }
    });

    this.strava.connect();
    this.withings.connect();
  }

  stravaLoad() {
    this.getAthlete();
    this.phrLoad(false);
  }

  phrLoad(withing : boolean) {
    this.stravaComplete = false;
    this.clearCharts();
    this._loadingService.register('overlayStarSyntax');
    this.strava.getActivities();

    if (this.showMeasures && withing) {
      this.withings.getObservations();
      this.withings.getWorkouts();
      this.withings.getSleep();
    }

    this.fhirService.getServerObservations(this.phr.getFromDate(),this.phr.getToDate());
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


  clearCharts() {
    for (const chart of this.charts) {
      chart.chart = [];
    }
    for (const chart of this.bars) {
      chart.chart = [];
    }
    for (const chart of this.ihealthcharts) {
      chart.chart = [];
    }
    for (const chart of this.hrvcharts) {
      chart.chart = [];
    }
  }


  buildGraph(observations : Obs[]) {

    var bars = [
      {
        "unit": "kJ",
        "name": "Energy and Duration",
        "chart": [
          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }
        ]
      },
      {
        "unit": "Score",
        "name": "Suffer and Duration",
        "chart": [
          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }]
      },
      {
        "unit": "hour",
        "name": "Duration and Intensity",
        "chart": [

          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }]
      },
      {
        "unit": "hour",
        "name": "Duration and Av Heart Rate",
        "chart": [

          {
            "name": "Endurance",
            "series": []
          },
          {
            "name": "Moderate",
            "series": []
          },
          {
            "name": "Tempo",
            "series": []
          },
          {
            "name": "Threshold",
            "series": []
          }]
      }
    ];


    for (const obs of observations) {
      if (obs.weight != undefined) {
        this.addEntry(0,0,"Weight",{
          name: obs.obsDate,
          value: obs.weight
        });
        if (obs.hydration != undefined) {
          this.addEntry(1,0,"Hydration",{
            name: obs.obsDate,
            value: Math.round((obs.hydration / obs.weight) *1000)/ 10
          })
        }
        if (obs.muscle_mass != undefined) {
          this.addEntry(1,1,"Muscle Mass",{
            name: obs.obsDate,
            value: Math.round((obs.muscle_mass / obs.weight) *1000)/ 10
          });
        }
        if (obs.fat_mass != undefined) {
          this.addEntry(1,2,"Fat Mass",{
            name: obs.obsDate,
            value: Math.round((obs.fat_mass / obs.weight) *1000)/ 10
          })
        }
      }
      if (obs.pwv != undefined) {
        this.addEntry(2,0,"PVW",{
          name: obs.obsDate,
          value: obs.pwv
        });
      }

      if (obs.sleep_score != undefined) {
        this.addEntry(3,0,"Sleep Score",{
          name: obs.obsDate,
          value: obs.sleep_score
        })
      }
      if (obs.diastolic != undefined && obs.systolic != undefined) {
        this.addEntry(4,0,"Systolic",{
          name: obs.obsDate,
          value: obs.systolic
        });
        this.addEntry(4,1,"Diastolic",{
          name: obs.obsDate,
          value: obs.diastolic
        });

      }
      if (obs.sleep_duration != undefined) {
        this.addEntry(5,0,"Sleep Duration",{
          name: obs.obsDate,
          value: obs.sleep_duration
        })
        if (obs.deepsleepduration != undefined) {
          this.addEntry(6,0,"Deep Sleep Duration",{
            name: obs.obsDate,
            value: obs.deepsleepduration
          })
        }
        if (obs.lightsleepduration != undefined) {
          this.addEntry(6,1,"Light Sleep Duration",{
            name: obs.obsDate,
            value: obs.lightsleepduration
          })
        }
        if (obs.remsleepduration != undefined) {
          this.addEntry(6,2,"REM Sleep Duration",{
            name: obs.obsDate,
            value: obs.remsleepduration
          })
        }
      }
      var chartNum = 0;
      if (obs.energy != undefined && obs.energy> 0 && obs.duration != undefined) {
        if (obs.energy != +obs.energy) console.log(obs.energy);
        if (obs.duration != +obs.duration) console.log(obs.duration);
        var energy = obs.energy / (obs.duration/ 600);
        if (energy < 80) {
          chartNum = 0;
        } else if (energy < 110) {
          chartNum = 1;
        } else if (energy < 130) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[0].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: +obs.energy,
          r: +energy
        })
      }
      if (obs.suffer != undefined && obs.suffer > 0 && obs.duration != undefined) {

        var suffer = obs.suffer / (obs.duration/600);
        if (suffer < 10) {
          chartNum = 0;
        } else if (suffer < 20) {
          chartNum = 1;
        } else if (suffer < 30) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[1].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: +obs.suffer,
          r: +suffer
        })
      }
      if (obs.intensity != undefined && obs.intensity> 0 && this.isNum(obs.intensity) && obs.duration != undefined) {

        if (obs.intensity < this.intensityRange.low) {
          chartNum = 0;
        } else if (obs.intensity < this.intensityRange.medium) {
          chartNum = 1;
        } else if (obs.intensity < this.intensityRange.tough) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[2].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: obs.duration /3600,
          r: +obs.intensity
        });
      }

      if (obs.average_heartrate != undefined && obs.average_heartrate> 0 && this.isNum(obs.average_heartrate) && obs.duration != undefined) {
        var intensity = (obs.average_heartrate / this.phr.maxhr) * 100;
        if (intensity < this.intensityRange.low) {
          chartNum = 0;
        } else if (intensity < this.intensityRange.medium) {
          chartNum = 1;
        } else if (intensity < this.intensityRange.tough) {
          chartNum = 2;
        } else {
          chartNum = 3;
        }
        bars[3].chart[chartNum].series.push({
          name: obs.name,
          x: obs.obsDate,
          y: obs.duration /3600,
          r: +intensity
        });
      }

    }

      for (const bar in bars) {
        this.bars[bar].chart = bars[bar].chart;
      }
  }

  addEntry(chart : number, series : number, name: string, entry) {

    if (this.charts[chart] === undefined) return;
    while (this.charts[chart].chart.length < (series+1)) {
      this.charts[chart].chart.push( {
        series: []
      });
    }
    if (this.charts[chart].chart[series].name == undefined) {
      this.charts[chart].chart[series].name = name;
    }
    this.charts[chart].chart[series].series.push(entry);
  }

  togglePWV() {
    this.pwv = !this.pwv;
  }

  toggleWeight() {
    this.weight = !this.weight;
  }

  toggleSleep() {
    this.sleepscore = !this.sleepscore;
  }

  toggleBP() {
    this.bp = !this.bp;
  }


  toggle(chart: any) {
    if (chart.ticked == undefined) chart.ticked = false;
    chart.ticked = !chart.ticked;
  }




  processHRVGraph(observations : Obs[]) {

    var charts :any = [
      {
        unit: "SDNN",
        name: "HRV",
        chart: [

          {
            "name": "SDNN",
            "series": []
          }]
      },
      {
        unit: "points",
        name: "Recovery",
        chart: [{
          name: "Recovery",
          series: []
        }]
      },
      {
        unit: "mL/(kg·min)",
        name: "VO2 Max",
        chart: [{
          name: "Recovery",
          series: []
        }]
      },

    ];


    for (const obs of observations) {
      if (obs.sdnn != undefined) {
        charts[0].chart[0].series.push({
          name: obs.obsDate,
          value: obs.sdnn
        })
      }
      if (obs.recoverypoints != undefined) {
        charts[1].chart[0].series.push({
          name: obs.obsDate,
          value: obs.recoverypoints
        })
      }
      if (obs.vo2max != undefined) {
        charts[2].chart[0].series.push({
          name: obs.obsDate,
          value: obs.vo2max
        })
      }
    }

    // copy in new series values
    for (const chart in charts) {
      for (const series of charts[chart].chart) {
        this.hrvcharts[chart].chart.push(series);
      }
    }
  }

  processIHealthGraph(observations: Obs[]) {

    var charts = [
      {
        "unit": "%",
        "name": "SPO2",
        "chart": [

          {
            "name": "SPO2",
            "series": []
          }]
      },
      {
        "unit": "ratio",
        name: "Perfusion Index",
        "chart": [{
          name: "Perfusion Index",
          series: []
        }]
      }

    ];

    for (const obs of observations) {
      if (obs.spo2 != undefined) {
        charts[0].chart[0].series.push({
          name: obs.obsDate,
          value: obs.spo2
        })
      }
      if (obs.pi != undefined && obs.pi < 50) {
        charts[1].chart[0].series.push({
          name: obs.obsDate,
          value: obs.pi
        })
      }

    }
    // copy in new series values
    for (const chart in charts) {
      for (const series of charts[chart].chart) {

        this.ihealthcharts[chart].chart.push(series);
      }
    }
  }

  dateToChanged(event){
    this.phr.setToDate(this.toDate.value);
    this.phrLoad(true);
  }

  selectDuration(event) {
    if (!event.isUserInput) {
      console.log(this.selected);

      this.phr.setFromDuration(this.selected);
      this.phrLoad(true);
    }

  }
}
