import { GetServerSideProps } from "next";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import Layout from "../../components/Layout";
import { Database } from "../../db";
import { Todo } from "../../db/entity/Todo";
import { ITodo } from "../../interfaces";
import { resetInputElement } from "../../utils/form";

interface IProps {
  todos: ITodo[],
}

const TodoPage = (props: IProps): JSX.Element => {
  const { todos = [] } = props;
  const [allTodos, setAllTodos] = useState<ITodo[]>(todos);
  const [isLoading, setLoading] = useState<boolean>(false);

  const toggleTodo = (todo: ITodo) => {
    setLoading(true);
    fetch(`/api/todos/${todo.id}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ done: !todo.done })
    }).then((response) => response.json())
      .then((response: ITodo) => {
        setAllTodos((prevTodos) => prevTodos.map(
          (prevTodo) => prevTodo.id === response.id ? ({
            ...response
          }) : prevTodo
        ))
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }

  const deleteTodo = (todo: ITodo) => {
    setLoading(true);
    fetch(`/api/todos/${todo.id}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
    }).then(() => {
        setAllTodos((prevTodos) => prevTodos.filter(
          prevTodo => prevTodo.id !== todo.id
        ))
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }


  const handleSumbitForm = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const target = e.target as Element;
    const taskField = target.querySelector('input#task') as HTMLInputElement
    const task = taskField.value.replace(/[^\w\s]/gi, '');

    if (task.length === 0) return resetInputElement(
      taskField,
      () => setLoading(false)
    );

    fetch(`/api/todos`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ task })
    }).then((response) => response.json())
      .then((response: ITodo) => {
        setAllTodos((prevTodos) => [response, ...prevTodos])
        resetInputElement(taskField, () => setLoading(false));
      })
      .catch(error => {
        console.error(error);
        resetInputElement(taskField, () => setLoading(false));
      });
  }

  return (
    <Layout title="Users List | Next.js + TypeScript Example">
      <h1>Todos</h1>
      <p>
        Example fetching data from inside <code>getServerSideProps()</code>.
      </p>
    <p>You are currently on: /todos</p>
    {allTodos.length === 0 && (
      <p>No todo left.</p>
    )}
    <div>
      <form onSubmit={handleSumbitForm}>
        <label htmlFor="task">Add new task:</label>
        <input id="task" name="task" type="text" disabled={isLoading} />
        <input  type="submit" value="Add" disabled={isLoading}/>
      </form>
    </div>
    {isLoading && (
      <p><strong>Loading please wait...</strong></p>
    )}
    <ul>
      {allTodos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            disabled={isLoading}
            onChange={() => toggleTodo(todo)}/>
          <Link href={`/todos/${todo.id}`}>
            <a>{todo.task}</a>
          </Link>
          {'   '}
          {todo.done && (
            <button onClick={() => deleteTodo(todo)}>&times;</button>
          )}
        </li>
      ))}
    </ul>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
    </Layout>
  )
} 

export const getServerSideProps: GetServerSideProps = async () => {
  const db = new Database()
  const connection = await db.getConnection();
  const todosResponse: Todo[] = await connection.manager.find(Todo, {
    order: {createdAt: 'DESC'}
  });
  const todos : ITodo[] = !(todosResponse?.length > 0) ? [] : todosResponse.map(
    todo => ({
      id: todo.id,
      task: todo.task,
      done: Boolean(todo.done),
      updatedAt: String(todo.updatedAt),
      createdAt: String(todo.createdAt),
    })
  )
  return {
    props: { todos }
  }
};

export default TodoPage;