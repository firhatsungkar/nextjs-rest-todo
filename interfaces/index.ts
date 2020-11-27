// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

import { NextApiRequest, NextApiResponse } from "next";

export type User = {
  id: number
  name: string
}
export interface ITodo {
  id: string,
  task: string,
  done: boolean,
  updatedAt: string,
  createdAt: string,
}

export type ApiMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IApiController {
  req: NextApiRequest;
  res: NextApiResponse;
  controllerOptions?: IBaseControllerOptions;
  init: () => any;
}

export interface IBaseControllerOptions {
  allowedMethods?: ApiMethods[];
}
export interface IConstructableController {
  new (req: NextApiRequest, res: NextApiResponse): IApiController;
}