const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error:"User not found!"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const user = users.find(user => user.username === username);

  if(user){
    return response.status(400).json({error:"User already exist!"});
  }

  const userOperation = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(userOperation);

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todoOperation);

  return response.status(201).json(todoOperation);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const getTodo = user.todos.find(todos => todos.id === id);//get especific todo

  if(!getTodo){
    return response.status(404).json({error:"The todo informed was not found!"});
  }

  getTodo.title = title;
  getTodo.deadline = new Date(deadline);

  return response.json(getTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const getTodo = user.todos.find(todos => todos.id === id);//get especific todo

  if(!getTodo){
    return response.status(404).json({error:"The todo informed was not found!"});
  }

  getTodo.done = true;


  return response.json(getTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error:"The todo informed was not found!"});
  }

  user.todos.splice(todoIndex,1);

  return response.status(204).json();
});

module.exports = app;
