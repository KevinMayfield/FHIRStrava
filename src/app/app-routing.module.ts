import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {BodyComponent} from "./body/body.component";

import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";
import {AuthGuard} from "./services/auth-guard";
import {PatientSearchComponent} from "./component/patient-search/patient-search.component";

const routes: Routes = [
  {
    path: '', component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
      path: '', component: PatientSearchComponent
    },

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
