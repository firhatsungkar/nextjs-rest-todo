import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "typeorm";
import { Database } from "../../../db";
import { Todo } from "../../../db/entity/Todo";

const createTodo = async (
  connection: Connection,
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const { body } = req;
  const {
     task = null,
  } = body;

  if (!task) {
    return res.status(400).json({error: 'Need task field.'})
  }

  let todo = new Todo();
  todo.task = task;
  todo.done = false;

  const newTask = await connection.manager.save(todo);

  return res.status(201).json({
    ...newTask
  })

}

const fetchAll = async (
  connection: Connection,
  _: NextApiRequest,
  res: NextApiResponse
) => {

  const todos = await connection.manager.find(Todo, {
    order: {
      createdAt: 'ASC',
    }
  });

  return res.status(200).json(todos);

}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const db = new Database();
    const dbCon = await db.getConnection();

    switch (req.method) {
      case 'GET':
        return fetchAll(dbCon, req, res);
      case 'POST':
        return createTodo(dbCon, req, res);
      default:
        res.status(405).end();
    }


  } catch(error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

export default handler;