import { PostgreSqlContainer } from "@testcontainers/postgresql";
import path from "path";
import * as originalConsole from "console";
import { getTodoItems, addTodoItem, markTodoItemComplete, removeTodoItem, closeDb } from "../../src/db.mjs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Use normal console for logging testcontainer log output
const jestConsole = console;
beforeAll(() => global.console = originalConsole);
afterAll(() => global.console = jestConsole);

let postgresContainer;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer("postgres:16-alpine")
    .withBindMounts([
      {
        source: path.join(__dirname, "../../db"),
        target: "/docker-entrypoint-initdb.d",
        readOnly: true,
      },
    ])
    .start();

  // Configure the pg library
  process.env.PGUSER = postgresContainer.getUsername();
  process.env.PGPASSWORD = postgresContainer.getPassword();
  process.env.PGHOST = postgresContainer.getHost();
  process.env.PGPORT = postgresContainer.getPort();
  process.env.PGDATABASE = postgresContainer.getDatabase();
}, 60000);

afterAll(async () => {
  if (postgresContainer) {
    await postgresContainer.stop();
  }
}, 10000);


it("should connect to the database and perform basic operations", async () => {
  // Add a todo item
  await addTodoItem("Test Todo");
  
  // Get todo items
  const todos = await getTodoItems();
  expect(todos).toHaveLength(1);
  expect(todos[0].text).toBe("Test Todo");
  
  // Mark the todo item as complete
  await markTodoItemComplete(todos[0].id);
  
  // Verify the todo item is marked complete
  const updatedTodos = await getTodoItems();
  expect(updatedTodos[0].completed).toBe(true);
  
  // Remove the todo item
  await removeTodoItem(todos[0].id);
  
  // Verify the todo item is removed
  const finalTodos = await getTodoItems();
  expect(finalTodos).toHaveLength(0);

  // Close the database connection
  await closeDb();
}, 10000);