// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  gpUrl : 'https://jtm3f8nxwe.execute-api.eu-west-2.amazonaws.com/Development/EMIS/F83004',

  awsUrl : 'https://ek1wj5eye3.execute-api.eu-west-2.amazonaws.com/dev',
  gpOuth2Url : 'https://jtm3f8nxwe.execute-api.eu-west-2.amazonaws.com/Development/EMIS/F83004'
};

/*
this is the unsecured endpoint for emis

 // emisUrl : 'https://test-emis.virtually.healthcare/R4',
 */

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
