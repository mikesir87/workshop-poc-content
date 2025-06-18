import { Pool } from 'pg';

const pool = new Pool();

export async function getTodoItems() {
    const { rows } = await pool.query('SELECT * FROM todos ORDER BY id');
    return rows;
}

export async function addTodoItem(todo) {
    await pool.query('INSERT INTO todos (text) VALUES ($1)', [todo]);
}

export async function markTodoItemComplete(id) {
    await pool.query('UPDATE todos SET completed = TRUE WHERE id = $1', [id]);
}

export async function removeTodoItem(id) {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

export async function closeDb() {
    await pool.end();
}
