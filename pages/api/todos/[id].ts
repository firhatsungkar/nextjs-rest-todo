import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { Database } from "../../../db";
import { Todo } from "../../../db/entity/Todo";

const fetchTodoById = async (
  connection: Connection,
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { query: { id = null } } = req;

  if (id === null) {
    res.status(401).json({ error: 'Missing id parameter.' })
  }

  const todo = await connection.manager.findOneOrFail(Todo, id as string);

  return res.status(200).json({ ...todo })
}

const updateTodoById = async (
  connection: Connection,
  req: NextApiRequest,
  res: NextApiResponse,
) => {

  const {
    query: {
      id = null
    },
    body: {
      done = null,
      task = null,
    }
  } = req;

  if (id === null) {
    res.status(401).json({ error: 'Missing id parameter.' })
  }

  const todoRepo = await connection.getRepository(Todo)
  const todoToUpdate = await todoRepo.findOne({ id: id as string });

  if (todoToUpdate?.id) {
    if (task !== null) todoToUpdate.task = String(task);
    if (done !== null) todoToUpdate.done = Boolean(done);

    const newTodo = await todoRepo.save(todoToUpdate);
    return res.status(200).json({ ...newTodo });
  }


  return res.status(200).json({ ...todoToUpdate });

}

const deleteTodoById = async (
  connection: Connection,
  req: NextApiRequest,
  res: NextApiResponse,
) => {

  const {
    query: {
      id = null
    },
  } = req;

  if (id === null) {
    res.status(400).json({ error: 'Missing id parameter.' })
  }

  try {
    const todoRepo = await connection.getRepository(Todo);

    await todoRepo.delete({
      id: id as string,
    });

    return res.status(204).end();

  } catch (error) {
    return res.status(404).json({ error: `Todo with id ${id} not found.`});
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const db = new Database();
    const dbCon = await db.getConnection();

    switch (req.method) {
      case 'GET':
        return fetchTodoById(dbCon, req, res);
      case 'POST':
        return updateTodoById(dbCon, req, res);
      case 'DELETE':
        return deleteTodoById(dbCon, req, res);
      default:
        res.status(405).end();
    }


  } catch(error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

export default handler;