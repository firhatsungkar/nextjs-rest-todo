import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { Database } from "../../../db";
import { Todo } from "../../../db/entity/Todo";
import { BaseController } from "../../../utils/controller";

export const fetchAllTodos = async (connection: Connection) => {
  const todos = await connection.manager.find(Todo, {
    order: {
      createdAt: 'DESC',
    }
  })
  return todos;
}

export const createTodo = async (connection: Connection, { task } : { task: string}) => {
  let todo = new Todo();
  todo.task = task;
  todo.done = false; // new todo alway have undone task.
  const newTodo = await connection.manager.save(todo);
  return newTodo;
}

class TodosController extends BaseController {

  readonly db: Database;

  constructor(
    readonly req: NextApiRequest,
    readonly res: NextApiResponse,
  ) {
    super(req, res, {
      allowedMethods: ['GET', 'POST'],
    });
    this.db = new Database();
  }

  async get() {
    try {
      const connection = await this.db.getConnection();
      const todos = await fetchAllTodos(connection);
      this.sendResponse(todos);
    } catch (error) {
      this.sendError(error?.message ?? error)
    }
  }

  async post() {
    const { body } = this.req;
    const {
      task = null,
    } = body;

    if (!task) {
      return this.sendBadRequest('Need task field.');
    }

    try {
      const connection = await this.db.getConnection();
      const newTask = await createTodo(connection, { task });

      this.sendResponse(newTask);
    } catch (error) {
      this.sendError(error?.message ?? error);
    }

  }

}

export default BaseController.createController(TodosController);