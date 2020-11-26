import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Database } from "../../db";
import { Todo } from "../../db/entity/Todo";
import { ITodo } from "../../interfaces";
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
        Example fetching data from inside <code>getStaticProps()</code>.
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

export const getStaticPaths: GetStaticPaths = async () => {
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
  const paths = todos.map(
    todo => ({
      params: {id: todo.id}
    })
  )
  return {
    paths,
    fallback: false, 
  }
}

export const getStaticProps: GetStaticProps<{}, {id: string}> = async (context) => {
  let todo: ITodo | null = null;
  const id = context?.params?.id
  if (id) {
    const db = new Database()
    const connection = await db.getConnection();
    const todoResponse: Todo | undefined = await connection.manager.findOne(Todo, {
      id
    });
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