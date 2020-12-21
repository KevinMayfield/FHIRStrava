import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {BodyComponent} from "./body/body.component";
import {ExchangeTokenComponent} from "./exchange-token/exchange-token.component";
import {WithingsComponent} from "./withings/withings.component";

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
