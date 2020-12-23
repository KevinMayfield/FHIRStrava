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
  yAxisLabel: string = 'KJ';
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Date';
  maxRadius: number = 10;
  minRadius: number = 0;
 // yScaleMin: number = 70;
//  yScaleMax: number = 5000;

  @Input()
  results : [];

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  constructor() {

  }

  onSelect(event) {
    console.log(event);
  }


  ngOnInit(): void {
      console.log(this.results);
  }



}
