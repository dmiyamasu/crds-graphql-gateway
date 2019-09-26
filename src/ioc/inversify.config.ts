import { Container } from "inversify";
import "reflect-metadata";
import { GraphqlServer } from "../graphql";
import { Server } from "../server";
import { Types } from "./types";
import { AuthConnector } from "../graph/auth/auth.connector";
import { Analytics } from "../config/analytics";
import { Logger } from "../config/logging";
import { RestAuth } from "../sources/mp";

var container = new Container();

container.bind<Server>(Types.Server).to(Server);
container.bind<GraphqlServer>(Types.GraphQLServer).to(GraphqlServer).inSingletonScope();
container.bind<AuthConnector>(Types.AuthConnector).to(AuthConnector);
container.bind<Analytics>(Types.Analytics).to(Analytics);
container.bind<Logger>(Types.Logger).to(Logger);
container.bind<RestAuth>(Types.RestAuth).to(RestAuth);

export default container;
