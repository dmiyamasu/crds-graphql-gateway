
import { Analytics } from "../analytics";
import { Logger } from "../logging";
import { IAuthData } from "../auth/auth.interface";

export interface IContext {
  authData: IAuthData;
  dataSources: IDataSources;
  forceRefresh: boolean
}

export interface IDataSources {
  analytics: Analytics;
  logger: Logger;
}
