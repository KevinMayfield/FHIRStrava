import {Component, Input, OnInit} from '@angular/core';
import { curveBasis } from 'd3-shape';
import {PhrService} from "../services/phr.service";

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

  constructor(private phr : PhrService) { }

  @Input()
  results: any;

  curve: any = curveBasis;

  chart : [];

  view: any[] = [700, 300];

  // options
  @Input()
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  @Input()
  xAxisLabel: string =undefined;
  @Input()
  yAxisLabel: string = 'Population';

  @Input()
  xScaleMin: Date;

  xScaleMax: Date = new Date();

  timeline: boolean = false;
  yScaleMin= 0;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  onSelect(data): void {
  //  console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
  //  console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
  //  console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }



  ngOnInit(): void {
    var min=9999;

    this.xScaleMin = this.phr.getFromDate();
    this.xScaleMax = this.phr.getToDate();


      for (const chart of this.results) {
     //   console.log(chart);
        for (const val of chart.series) {
          if (val.value < min) min = val.value;
        }
      }
      if (min != 9999) {
        this.yScaleMin = Math.floor(min);
      } else {
        this.yScaleMin = 0;
      }

  }
  onNodeSelect(event) {
 //   console.log(event);
  }

}
