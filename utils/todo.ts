import { Todo } from "../db/entity/Todo";
import { ITodo } from "../interfaces";

export const mapTodoToObj = (todo: Todo): ITodo => {
  return ({
    id: todo.id,
    task: todo.task,
    done: Boolean(todo.done),
    updatedAt: String(todo.updatedAt),
    createdAt: String(todo.createdAt),
  })
}