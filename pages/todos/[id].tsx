import { GetServerSideProps } from "next";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Database } from "../../db";
import { Todo } from "../../db/entity/Todo";
import { ITodo } from "../../interfaces";
import { fetchTodoById } from "../api/todos/[id]";
interface IProps {
  todo: ITodo,
}

const TodoPage = (props: IProps): JSX.Element => {
  const { todo = null } = props;
  const [currentTodo, setCurrentTodo] = useState<ITodo | null>(todo);
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const toggleTodo = (todo: ITodo) => {
    setLoading(true);
    fetch(`/api/todos/${todo.id}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ done: !todo.done })
    }).then((response) => response.json())
      .then((response: ITodo) => {
        setCurrentTodo(
          () => ({...response})
        )
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
        setLoading(false);
        router.back();
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }


  return (
    <Layout title="Users List | Next.js + TypeScript Example">
      <h1>Todos</h1>
      <p>
        Example fetching data from inside <code>getServerSideProps()</code>.
      </p>
    <p>You are currently on: /todos/{currentTodo?.id}</p>
    {isLoading && (
      <p><strong>Loading please wait...</strong></p>
    )}
    {currentTodo !== null && (
      <div>
        <input
          type="checkbox"
          disabled={isLoading}
          checked={currentTodo.done}
          onChange={() => toggleTodo(currentTodo)}/>
        <span>{currentTodo.task}</span>
        <button disabled={isLoading} onClick={() => deleteTodo(currentTodo)}>&times;</button>
      </div>
    )}
    <p>
      <Link href="/todos">
        <a>Go to todos</a>
      </Link>
    </p>
    </Layout>
  )
} 

export const getServerSideProps: GetServerSideProps = async (context) => {
  let todo: ITodo | null = null;
  const id = context?.params?.id as string | null;
  if (id) {
    const db = new Database()
    const connection = await db.getConnection();
    const todoResponse: Todo | undefined = await fetchTodoById(connection, id);
    todo = todoResponse ? {
      id: todoResponse.id,
      task: todoResponse.task,
      done: Boolean(todoResponse.done),
      updatedAt: String(todoResponse.updatedAt),
      createdAt: String(todoResponse.createdAt),
    } : null;
  }
  return {
    props: { todo }
  }
}

export default TodoPage;