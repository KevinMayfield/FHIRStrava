import {Component, Input, OnInit} from '@angular/core';
import {Obs} from "../models/obs";

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

  @Input()
  observations: Obs[]


  charts: any[];

  constructor() {
    //Object.assign(this, { multi });
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


  ngOnInit(): void {
    this.processGraph();
  }
  onNodeSelect(event) {
    console.log(event);
  }
  processGraph(){

    var charts = [
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Weight",
            "series": []
          }]
      },
      {
        "name": "kJ",
        "chart": [{
          name: "Energy",
          series: []
        }]
      },
        {
          "name": "m/s",
          "chart": [{
        "name": "Pulse Wave Velocity",
        "series": [
        ]
      }]},
      {
        "name": "Score",
        "chart": [{
        "name": "Suffer Score",
        "series": [
        ]
      }]},
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Muscle Mass",
            "series": []
          }]
      },
      {
        "name": "Kg",
        "chart": [

          {
            "name": "Fat Mass",
            "series": []
          }]
      },
      {
        "name": "beats/min",
        "chart": [

          {
            "name": "Avg. Heart Rate",
            "series": []
          }]
      },
      {
        "name": "W",
        "chart": [

          {
            "name": "Avg(Norm) Power",
            "series": []
          }]
      },
    ];


    for (const obs of this.observations) {
       if (obs.weight != undefined ) {
          charts[0].chart[0].series.push({
            name : obs.obsDate,
            value : obs.weight
          })
       }

      if (obs.energy != undefined ) {
        charts[1].chart[0].series.push({
          name : obs.obsDate,
          value : obs.energy
        })
      }
      if (obs.pwv != undefined ) {
        charts[2].chart[0].series.push({
          name : obs.obsDate,
          value : obs.pwv
        })
      }
      if (obs.suffer != undefined ) {
        charts[3].chart[0].series.push({
          name : obs.obsDate,
          value : obs.suffer
        })
      }
      if (obs.muscle_mass != undefined ) {
        charts[4].chart[0].series.push({
          name : obs.obsDate,
          value : obs.muscle_mass
        })
      }
      if (obs.fat_mass != undefined ) {
        charts[5].chart[0].series.push({
          name : obs.obsDate,
          value : obs.fat_mass
        })
      }
      if (obs.average_heartrate != undefined ) {
        charts[6].chart[0].series.push({
          name : obs.obsDate,
          value : obs.average_heartrate
        })
      }
      if (obs.weighted_average_watts != undefined ) {
        charts[7].chart[0].series.push({
          name : obs.obsDate,
          value : obs.weighted_average_watts
        })
      }
    }

    this.charts=[];
    for (const chart of charts) {
      if (chart.chart.length>0) {
        this.charts.push(chart);
      }
    }


  }
}
