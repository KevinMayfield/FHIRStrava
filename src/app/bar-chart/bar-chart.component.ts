import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {


  view: any[] = [700, 400];

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
  xScaleMin: any = new Date('2020-07-14');

  xScaleMax= new Date();

  @Input()
  results : [];

  colorScheme = {
    domain: ['#1976d2', '#00695c',  '#ef6c00', '#c62828']
  };
  constructor() {

  }

  onSelect(event) {
    console.log(event);
  }


  ngOnInit(): void {

  }



}
