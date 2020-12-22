import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-pwvchart',
  templateUrl: './pwvchart.component.html',
  styleUrls: ['./pwvchart.component.scss']
})
export class PWVChartComponent implements OnInit {

  constructor() { }

  @Input()
  multi: any;


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
  xAxisLabel: string = 'Year';

  @Input()
  yAxisLabel: string = 'Population';
  timeline: boolean = false;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  onSelect(data): void {
 //   console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
 //   console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
//    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


  ngOnInit(): void {

  }
  onNodeSelect(event) {
 //   console.log(event);
  }

}
