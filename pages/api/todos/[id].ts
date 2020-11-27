import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { Database } from "../../../db";
import { Todo } from "../../../db/entity/Todo";
import { BaseController } from "../../../utils/controller";

export const fetchTodoById = async (
  connection: Connection,
  id: string,
): Promise<Todo> => {
  const todo = await connection.manager.findOneOrFail(Todo, id as string);

  return todo;

}

export const updateTodoById = async (
  connection: Connection,
  id: string,
  newTodo: { task?: string, done?: boolean }
): Promise<Todo> => {

  const {
    task = null,
    done = null,
  } = newTodo;

  const todoRepo = await connection.getRepository(Todo)
  const todoToUpdate = await todoRepo.findOneOrFail({ id: id as string });

  if (task !== null) todoToUpdate.task = String(task);
  if (done !== null) todoToUpdate.done = Boolean(done);

  const updatedTodo = await todoRepo.save(todoToUpdate);

  return updatedTodo;

}

export const deleteTodoById = async (
  connection: Connection,
  id: string,
): Promise<boolean> => {

  const todoRepo = await connection.getRepository(Todo);

  await todoRepo.delete({
    id: id as string,
  });

  return true;
  
}

class TodoController extends BaseController {

  readonly db: Database;

  constructor(
    readonly req: NextApiRequest,
    readonly res: NextApiResponse,
  ) {
    super(req, res, {
      allowedMethods: ['GET', 'POST', 'DELETE'],
    });
    this.db = new Database();
  }

  async get() {
    try {

      const { query: { id = null } } = this.req;

      if (id === null) {
        this.sendBadRequest('Missing id paramaeter.')
      }

      const connection = await this.db.getConnection();
      const todo = await fetchTodoById(connection, (id as string));

      this.sendResponse(todo);

    } catch (error) {

      this.sendError(error?.message ?? error);

    }

  }

  async post() {
    try {

      const {
        query: {
          id = null
        },
        body: {
          done = null,
          task = null,
        }
      } = this.req;

      if (id === null) {
        this.sendBadRequest('Missing id parameter.');
      }

      const connection = await this.db.getConnection();

      const newTodo = await updateTodoById(
        connection,
        (id as string),
        {
          task, done
        }
      )

      this.sendResponse(newTodo);

    } catch (error) {

      this.sendError(error?.message ?? error);

    }
  }

  async delete() {
    try {

      const {
        query: {
          id = null
        },
      } = this.req;

      if (id === null) {
        this.sendBadRequest('Missing id parameter.');
      }

      const connection = await this.db.getConnection();
      const isDeleted = await deleteTodoById(
        connection,
        (id as string)
      );

      if ( isDeleted ) {

        this.res.status(204).end();

      } else {
        throw new Error(`Todo with id ${id} not found.`);
      }


    } catch (error) {

      this.sendError(error?.message ?? error);

    }
  }

}

export default BaseController.createController(TodoController);