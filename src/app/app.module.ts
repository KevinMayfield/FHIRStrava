import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import {MatIconModule} from "@angular/material/icon";
import {CovalentLayoutModule} from "@covalent/core/layout";
import {CovalentStepsModule} from "@covalent/core/steps";
import {CovalentHttpModule} from "@covalent/http";
import {CovalentHighlightModule} from "@covalent/highlight";
import {CovalentMarkdownModule} from "@covalent/markdown";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CovalentCommonModule} from "@covalent/core/common";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatSelectModule} from "@angular/material/select";
import {MatToolbarModule} from "@angular/material/toolbar";
import { BodyComponent } from './body/body.component';
import {CovalentJsonFormatterModule} from "@covalent/core/json-formatter";
import { ExchangeTokenComponent } from './exchange-token/exchange-token.component';
import {MatSliderModule} from "@angular/material/slider";
import { WithingsComponent } from './withings/withings.component';
import {MatSortModule} from "@angular/material/sort";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import { LineChartComponent } from './line-chart/line-chart.component';
import {CovalentExpansionPanelModule} from "@covalent/core/expansion-panel";
import { BarChartComponent } from './bar-chart/bar-chart.component';
import {CovalentLoadingModule} from "@covalent/core/loading";
import { IhealthComponent } from './ihealth/ihealth.component';
import {CovalentFileModule} from "@covalent/core/file";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS,
  MatMomentDateModule,
  MomentDateAdapter
} from "@angular/material-moment-adapter";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {DatePipe} from "@angular/common";


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    BodyComponent,
    ExchangeTokenComponent,
    WithingsComponent,

    LineChartComponent,
    BarChartComponent,
    IhealthComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,


    CovalentLayoutModule,
    CovalentStepsModule,
    // (optional) Additional Covalent Modules imports
    CovalentHttpModule.forRoot(),
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentCommonModule,
    CovalentJsonFormatterModule,
    CovalentExpansionPanelModule,
    CovalentLoadingModule,
    CovalentFileModule,

    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSortModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatInputModule,

    NgxChartsModule

  ],
  providers: [
    DatePipe,
    {provide: MAT_DATE_LOCALE
      , useValue: 'en-GB'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
