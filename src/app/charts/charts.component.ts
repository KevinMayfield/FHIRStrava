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


  multi: any[];
  strava: any[];
  pwv: any[];

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
    var chart  = [];
    var chart2= [];
    var chart3= [];
    var weight = {
      "name": "Weight",
      "series": [
      ]
    }
    var energy = {
      "name": "Energy",
      "series": [
      ]
    }
    var pwv = {
      "name": "Pulse Wave Velocity",
      "series": [
      ]
    }
    var suffer = {
      "name": "Suffer Score",
      "series": [
      ]
    }
    for (const obs of this.observations) {
       if (obs.weight != undefined ) {
          weight.series.push({
            name : obs.obsDate,
            value : obs.weight
          })
       }
      if (obs.energy != undefined ) {
        energy.series.push({
          name : obs.obsDate,
          value : obs.energy
        })
      }
      if (obs.pwv != undefined ) {
        pwv.series.push({
          name : obs.obsDate,
          value : obs.pwv
        })
      }
      if (obs.suffer != undefined ) {
        suffer.series.push({
          name : obs.obsDate,
          value : obs.suffer
        })
      }
    }
    chart.push(weight);
    chart2.push(energy);
    chart3.push(pwv);
    chart2.push(suffer);
    this.multi = chart;
    this.strava = chart2;
    this.pwv = chart3;
  }
}
