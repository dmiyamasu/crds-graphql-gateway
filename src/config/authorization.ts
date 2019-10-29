import { AuthenticationError } from "apollo-server-express";
import { IAuthData } from "./auth/auth.interface";

export function authorize(authData: IAuthData, roles?: string[]): void {
    if (!authData) throw new AuthenticationError('Unauthorized.');
    if ((!roles || !roles.length) && authData.userInfo) return;
    if (!Object.keys(authData.roles)
        .find(role =>
            roles.indexOf(authData.roles[role]) > -1))
        throw new AuthenticationError('Unauthorized.');

}
