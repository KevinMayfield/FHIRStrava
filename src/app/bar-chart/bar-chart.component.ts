import {Component, Input, OnInit} from '@angular/core';
import {PhrService} from "../services/phr.service";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

  multi: any[]= [
    {
      "name": new Date('2012/1/1'),
      "series": [
        {
          "name": "2010",
          "value": 7300000
        },
        {
          "name": "2011",
          "value": 8940000
        }
      ]
    },

    {
      "name": 'b',
      "series": [
        {
          "name": "2010",
          "value": 7870000
        },
        {
          "name": "2011",
          "value": 8270000
        }
      ]
    },

    {
      "name": new Date(),
      "series": [
        {
          "name": "2010",
          "value": 5000002
        },
        {
          "name": "2011",
          "value": 5800000
        }
      ]
    }
  ];

  view: any[] = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;

  @Input()
  xAxisLabel = 'Country';

  @Input()
  yAxisLabel = 'Population';

  @Input()
  xScaleMin: Date;

  xScaleMax: Date = new Date();

  colorScheme = {
    domain: ['#1976d2', '#00695c',  '#ef6c00', '#c62828']
  };

  constructor(private phr : PhrService) { }

  ngOnInit(): void {
    this.xScaleMin = this.phr.getFromDate();
    this.xScaleMax = this.phr.getToDate();
    console.log(this.phr.getToDate());
  }

}
