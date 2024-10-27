/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as function_dm from "../function/dm.js";
import type * as function_friend from "../function/friend.js";
import type * as function_helpers from "../function/helpers.js";
import type * as function_message from "../function/message.js";
import type * as function_user from "../function/user.js";
import type * as http from "../http.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "function/dm": typeof function_dm;
  "function/friend": typeof function_friend;
  "function/helpers": typeof function_helpers;
  "function/message": typeof function_message;
  "function/user": typeof function_user;
  http: typeof http;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
