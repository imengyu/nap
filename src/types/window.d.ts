
import Datastore from 'nedb'
import { Logger } from 'log4js';

declare global {
  interface Window {
    app : any;
    appInited : boolean;
    appDb : Datastore;
    appDir : string;
    appBuildDate : string;
    appVesrsion : string;
  }
}