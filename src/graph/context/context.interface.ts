import { IAuthData } from "../auth/auth.interface";
import { Analytics } from "../../config/analytics";
import { Logger } from "../../config/logging";


export interface IContext {
  authData: IAuthData;
  dataSources: IDataSources;
}

export interface IDataSources {
  analytics: Analytics;
  logger: Logger;
}
