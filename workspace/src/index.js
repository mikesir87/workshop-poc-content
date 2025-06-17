import express from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from 'node:url';
import { getTodoItems, addTodoItem, closeDb, markTodoItemComplete, removeTodoItem } from "./db.mjs";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// List todos
app.get('/', async (req, res) => {
  const todos = await getTodoItems();
  res.render('index', { todos });
});

// Add todo
app.post('/add', async (req, res) => {
  const { todo } = req.body;
  if (todo && todo.trim() !== '') {
    await addTodoItem(todo.trim());
  }
  res.redirect('/');
});

// Mark as complete
app.post('/complete/:id', async (req, res) => {
  await markTodoItemComplete(req.params.id);
  res.redirect('/');
});

// Remove todo
app.post('/remove/:id', async (req, res) => {
  await removeTodoItem(req.params.id);
  res.redirect('/');
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});

["SIGTERM", "SIGINT"].forEach(signal => {
  process.on(signal, async () => {
    closeDb();
    console.log(`Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  });
});