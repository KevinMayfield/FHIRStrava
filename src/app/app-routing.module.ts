import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {BodyComponent} from "./body/body.component";
import {ExchangeTokenComponent} from "./exchange-token/exchange-token.component";
import {WithingsComponent} from "./withings/withings.component";
import {IhealthComponent} from "./ihealth/ihealth.component";
import {LoginComponent} from "./login/login.component";
import {LogoutComponent} from "./logout/logout.component";

const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      {
      path: '', component: BodyComponent
    }
    ]
  },
  {
    path: 'exchange_token', component: ExchangeTokenComponent
  },
  {
    path: 'withings', component: WithingsComponent
  },
  {
    path: 'ihealth', component: IhealthComponent
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
