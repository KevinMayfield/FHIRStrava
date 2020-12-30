import {Component, Input, OnInit} from '@angular/core';
import {PhrService} from "../services/phr.service";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {


  view: any[] = [700, 300];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;

  @Input()
  yAxisLabel: string = 'KJ';
  showYAxisLabel: boolean = true;
  @Input()
  xAxisLabel: string = 'Date';
  maxRadius: number = 7;
  minRadius: number = 0;
  @Input()
  xScaleMin: Date;

  xScaleMax = new Date();

  @Input()
  results : [];

  colorScheme = {
    domain: ['#1976d2', '#00695c',  '#ef6c00', '#c62828']
  };
  constructor(private phr : PhrService) {

  }

  onSelect(event) {
    console.log(event);
  }


  ngOnInit(): void {

    if (this.xScaleMin = undefined) {
      this.xScaleMin = this.phr.getFromDate();
    }

  }



}
