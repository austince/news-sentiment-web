// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
import { testdata } from './articleData';
import { testdata as linkdata } from './articleDataLinked';

export const environment = {
  production: false,
  articleApiUrl: 'http://localhost:5000',
  testdata: testdata,
  testdataLinked: linkdata,
};
