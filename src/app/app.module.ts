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
import {CovalentJsonFormatterModule} from "@covalent/core/json-formatter";
import {MatSliderModule} from "@angular/material/slider";
import {MatSortModule} from "@angular/material/sort";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {CovalentExpansionPanelModule} from "@covalent/core/expansion-panel";
import {CovalentLoadingModule} from "@covalent/core/loading";
import {CovalentFileModule} from "@covalent/core/file";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS,
  MatMomentDateModule,
  MomentDateAdapter
} from "@angular/material-moment-adapter";
import {MatInputModule} from "@angular/material/input";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {DatePipe} from "@angular/common";
import {CovalentNotificationsModule} from "@covalent/core/notifications";
import {CovalentMessageModule} from "@covalent/core/message";
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {BodyComponent} from "./body/body.component";
import {PatientFindComponent} from "./patient/patient-find/patient-find.component";
import {PatientSearchComponent} from "./component/patient-search/patient-search.component";
import {PatientComponent} from "./component/patient/patient.component";
import {ResourceDialogComponent} from "./dialog/resource-dialog/resource-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {CovalentDialogsModule} from "@covalent/core/dialogs";
import {EprService} from "./services/epr.service";
import {PatientSummaryComponent} from "./patient/patient-summary/patient-summary.component";
import {MatChipsModule} from "@angular/material/chips";
import {ConditionComponent} from "./component/condition/condition.component";
import {LinksService} from "./services/links.service";
import {MedicationRequestComponent} from "./component/medication-request/medication-request.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ObservationComponent} from "./component/observation/observation.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {DocumentReferenceComponent} from "./component/document-reference/document-reference.component";
import {CompositionComponent} from "./component/composition/composition.component";
import {ImmunisationComponent} from "./component/immunisation/immunisation.component";
import {TaskComponent} from "./component/task/task.component";
import {AllergyIntoleranceComponent} from "./component/allergy-intolerance/allergy-intolerance.component";
import {CovalentMediaModule} from "@covalent/core/media";
import { PatientObservationComponent } from './patient/patient-obsevation/patient-obsevation.component';
import { PatientMedicationComponent } from './patient/patient-medication/patient-medication.component';
import { PatientMainComponent } from './patient/patient-main/patient-main.component';
import { PatientDocumentComponent } from './patient/patient-document/patient-document.component';
import { PatientImmunisationComponent } from './patient/patient-immunisation/patient-immunisation.component';
import { PatientProblemComponent } from './patient/patient-problem/patient-problem.component';
import {EncounterComponent} from "./component/encounter/encounter.component";
import { QuestionnaireResponseComponent } from './component/questionnaire-response/questionnaire-response.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    BodyComponent,
    PatientFindComponent,
    PatientSearchComponent,
    PatientComponent,
    PatientSummaryComponent,
    ConditionComponent,
    ObservationComponent,
    MedicationRequestComponent,
    DocumentReferenceComponent,
    CompositionComponent,
    ImmunisationComponent,
    TaskComponent,
    AllergyIntoleranceComponent,
    ResourceDialogComponent,
    EncounterComponent,

    LoginComponent,
    LogoutComponent,
    PatientObservationComponent,
    PatientMedicationComponent,
    PatientMainComponent,
    PatientDocumentComponent,
    PatientImmunisationComponent,
    PatientProblemComponent,
    QuestionnaireResponseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,

    AmplifyAuthenticatorModule,


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
    CovalentNotificationsModule,
    CovalentMessageModule,
    CovalentDialogsModule,
    CovalentMediaModule,

    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSliderModule,

    MatDatepickerModule,
    MatMomentDateModule,
    MatInputModule,

    NgxChartsModule,
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule

  ],
  providers: [
    DatePipe,
    EprService,
    LinksService,
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
