import { IContext } from "../context/context.interface";

const resolverMap: any = {
  Query: {
    lifeStages: (parent, args, { authData, dataSources }: IContext) => {
      return dataSources.lifeStageConnector.getLifeStages();
    },
    lifeStageContent: (parent, args, { authData, dataSources }: IContext) => {
      return dataSources.lifeStageConnector.getLifeStageContent(args.id);
    }
  },
  LifeStageContent: {
    references: (parent, args, { authData, dataSources }: IContext) => {
      return dataSources.lifeStageConnector.getReferencedContent(parent);
    }
  }
};

export default resolverMap;
