import { NextApiRequest, NextApiResponse } from "next";
import { IApiController, IBaseControllerOptions, IConstructableController } from "../interfaces";

export abstract class BaseController implements IApiController {
  constructor(
    readonly req: NextApiRequest,
    readonly res: NextApiResponse,
    readonly controllerOptions?: IBaseControllerOptions
  ) {
    // switch (req.method) {
    //   case 'GET':
    //     this.get();
    //     break;
    //   case 'POST':
    //     this.post();
    //     break;
    //   case 'PUT':
    //     this.put();
    //     break;
    //   case 'PATCH':
    //     this.patch();
    //     break;
    //   case 'DELETE':
    //     this.delete();
    //     break;
    //   case 'OPTIONS':
    //     this.options();
    //     break;
    //   default:
    //     this.sendMethodNotAllowed();
    // }
  }

  static createController(Controller: IConstructableController) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const controller = new Controller(req, res);
        controller.init();
      } catch (error) {
        res.status(500).json({ error });
      }
    }
  }

  public init() {
    switch (this.req.method) {
      case 'GET':
        this.get();
        break;
      case 'POST':
        this.post();
        break;
      case 'PUT':
        this.put();
        break;
      case 'PATCH':
        this.patch();
        break;
      case 'DELETE':
        this.delete();
        break;
      case 'OPTIONS':
        this.options();
        break;
      default:
        this.sendMethodNotAllowed();
    }
  }

  public sendMethodNotAllowed() {
    this.res.status(405).end();
  }

  public sendError(error: string) {
    this.res.status(500).json({ error });
  }

  public sendResponse(response: any) {
    this.res.status(200).json(response);
  }

  public sendBadRequest(error: string) {
    this.res.status(400).json({ error });
  }

  public options() {
    const allowedMethods = this?.controllerOptions?.allowedMethods;
    if (allowedMethods) {
      this.res.setHeader('Allow', allowedMethods.join(', '));
    }
    this.res.status(200);
    this.res.end()
  }

  public get() { this.sendMethodNotAllowed(); }

  public post() { this.sendMethodNotAllowed(); }

  public patch() { this.sendMethodNotAllowed(); }

  public put() { this.sendMethodNotAllowed(); }

  public delete() { this.sendMethodNotAllowed(); }

}