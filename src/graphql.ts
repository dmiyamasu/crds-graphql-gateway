import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import * as http from "http";
import { inject, injectable } from "inversify";
import { Types } from "./ioc/types";
import { IAuthConnector } from "./graph/auth/auth.interface";
import { RedisCache } from "apollo-server-cache-redis";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { Analytics } from "./config/analytics";
import { Logger } from "./config/logging";
import { IDataSources } from "./graph/context/context.interface";
import { IRestAuth } from "./sources/mp";
import { ApolloGateway } from "@apollo/gateway";

@injectable()
export class GraphqlServer {
  public set express(v: Express) {
    this.app = v;
  }
  private app: Express;
  private serverInstance: http.Server;

  constructor(
    @inject(Types.AuthConnector) private authAPI: IAuthConnector,
    @inject(Types.Analytics) private analytics: Analytics,
    @inject(Types.Logger) private logger: Logger,
    @inject(Types.RestAuth) private restAuth: IRestAuth,
  ) {}

  public async start(): Promise<void> {
    let app = this.app;

    const gateway = new ApolloGateway({
      serviceList: [
        { name: 'content', url: 'http://localhost:8001' },
      ],
    });

    const server = new ApolloServer({
      gateway,
      context: ({ req }) => {
        if (req.body.query.includes("IntrospectionQuery")) return;
        const token = req.headers.authorization || "";
        return this.authAPI.authenticate(token).then(user => {
          return user;
        });
      },
      dataSources: (): any => {
        return <IDataSources>{
          analytics: this.analytics,
          logger: this.logger
        };
      },
      formatResponse: response => {
        this.logger.logResponseBody(response);
        return response;
      },
      formatError: error => {
        this.logger.logError(error);
        return error;
      },
      plugins: [
        responseCachePlugin({
          sessionId: requestContext => requestContext.request.http.headers.get("authorization") || null
        })
      ],
      cacheControl: {
        defaultMaxAge: 5
      },
      cache: new RedisCache(`redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}/${process.env.REDIS_DB}`),
      subscriptions: false,
    });

    server.applyMiddleware({ app, path: "/" });

    app.listen({ port: 8000 }, () => {
      this.restAuth.authorize();
    });
  }

  public stop() {
    this.serverInstance.close();
  }
}
