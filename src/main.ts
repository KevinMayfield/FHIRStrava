import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
//import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {Amplify} from "aws-amplify";

Amplify.configure(awsconfig);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
