import "reflect-metadata";
import container from "./ioc/inversify.config";
import { Types } from "./ioc/types";
import { Server } from "./server";
import { Vault } from "crds-vault-node";

async function start() {
  await new Vault(process.env.CRDS_ENV).process(["common", "graphql"]);
  await sleep(1000);
  return container.get<Server>(Types.Server).start();
}

export const server = start();

function sleep(ms){
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}
