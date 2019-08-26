import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import { Express } from "express";
import * as http from "http";
import { inject, injectable } from "inversify";
import { Types } from "./ioc/types";
import schema from "./schema";
import resolvers from "./resolvers";
import { IAuthConnector } from "./graph/auth/auth.interface";
import { IUsersConnector } from "./graph/users/users.interface";
import { ISitesConnector } from "./graph/sites/sites.interface";
import { RedisCache } from "apollo-server-cache-redis";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { ILifeStageConnector } from "./graph/content/content_types/life-stage/life-stage.interface";
import { Analytics } from "./config/analytics";
import { Logger } from "./config/logging";
import { IContentConnector } from "./graph/content/content.interface";

@injectable()
export class GraphqlServer {

    public set express(v: Express) {
        this.app = v;
    }
    private app: Express;
    private serverInstance: http.Server;

    constructor(
        @inject(Types.AuthConnector) private authConnector: IAuthConnector,
        @inject(Types.UsersConnector) private usersConnector: IUsersConnector,
        @inject(Types.SitesConnector) private sitesConnector: ISitesConnector,
        @inject(Types.LifeStageConnector) private lifeStageConnector: ILifeStageConnector,
        @inject(Types.ContentConnector) private contentConnector: IContentConnector,
        @inject(Types.Analytics) private analytics: Analytics,
        @inject(Types.Logger) private logger: Logger
    ) { }

    public async start(): Promise<void> {

        let app = this.app;

        const server = new ApolloServer({
            schema: makeExecutableSchema({
                typeDefs: schema,
                resolvers,
                inheritResolversFromInterfaces: true
            }),
            context: ({ req }) => {
                if (req.body.query.includes('IntrospectionQuery')) return;
                const token = req.headers.authorization || "";
                return this.authConnector.authenticate(token).then((user) => {
                    return user;
                });
            },
            dataSources: (): any => {
                return {
                    usersConnector: this.usersConnector,
                    sitesConnector: this.sitesConnector,
                    lifeStageConnector: this.lifeStageConnector,
                    contentConnector: this.contentConnector,
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
            plugins: [responseCachePlugin({
                sessionId: (requestContext) => (requestContext.request.http.headers.get('authorization') || null),
            })],
            cacheControl: {
                defaultMaxAge: 5,
              },
            cache: new RedisCache(`redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}/${process.env.REDIS_DB}`),

        });

        server.applyMiddleware({ app, path: "/" })

        app.listen({ port: 8000 }, () => { console.log('listening on 8000') });
    }

    public stop() {
        this.serverInstance.close();
    }
}
