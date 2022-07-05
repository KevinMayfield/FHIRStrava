import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {BodyComponent} from "./body/body.component";

import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";
import {AuthGuard} from "./services/auth-guard";
import {PatientSearchComponent} from "./component/patient-search/patient-search.component";
import {PatientSummaryComponent} from "./patient/patient-summary/patient-summary.component";
import {PatientObservationComponent} from "./patient/patient-obsevation/patient-obsevation.component";
import {PatientMedicationComponent} from "./patient/patient-medication/patient-medication.component";
import {PatientMainComponent} from "./patient/patient-main/patient-main.component";
import {PatientImmunisationComponent} from "./patient/patient-immunisation/patient-immunisation.component";
import {PatientDocumentComponent} from "./patient/patient-document/patient-document.component";
import {PatientProblemComponent} from "./patient/patient-problem/patient-problem.component";

const routes: Routes = [
  {
    path: '', component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
      path: '', component: PatientSearchComponent,

    },{
        path: 'patient', component: PatientMainComponent,
        children: [
          {
            path: ':patientid', component: PatientSummaryComponent,
          },
          {
            path: ':patientid/observation', component: PatientObservationComponent
          },
          {
            path: ':patientid/medication', component: PatientMedicationComponent
          },
          {
            path: ':patientid/immunisation', component: PatientImmunisationComponent
          },{
            path: ':patientid/document', component: PatientDocumentComponent
          },{
            path: ':patientid/problem', component: PatientProblemComponent

          }
          ]
      }
    ]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'logout', component: LogoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
