import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {BodyComponent} from "./body/body.component";

import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";
import {AuthGuard} from "./services/auth-guard";

const routes: Routes = [
  {
    path: '', component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
      path: '', component: BodyComponent
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
