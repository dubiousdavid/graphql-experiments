// @flow weak
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');

const PORT = 3000;

const typeDefs = [
  fs.readFileSync('schema.graphql', 'utf8'),
  fs.readFileSync('todos.graphql', 'utf8')
];

let todos = {
  '123': {
    completed: true,
    editing: false,
    id: '123',
    list: {},
    text: 'Milk'
  },
  '124': {
    completed: false,
    editing: false,
    id: '124',
    list: {},
    text: 'Sugar'
  },
  '125': {
    completed: false,
    editing: false,
    id: '125',
    list: {},
    text: 'Bacon'
  }
};

let todoLists = {
  '456': {
    id: '456',
    name: 'Groceries',
    items: [todos['123'], todos['124'], todos['125']],
    filter: 'completed'
  }
};

todos['123'].list = todoLists['456'];
todos['124'].list = todoLists['456'];
todos['125'].list = todoLists['456'];

const resolvers = {
  Query: {
    todoItem(root, params, context) {
      console.log(root, params, context);
      let todo = todos[params.id];
      // console.log('Todo Item:', todo);
      return todo;
    },
    todoList(root, params, context) {
      console.log(root, params, context);
      let list = todoLists[params.id];
      // console.log('Todo List:', list);
      return list;
    }
  },
  Mutation: {
    addItem(root, { input }, context) {
      console.log(root, input, context);
      let todoList = todoLists[input.listId];
      console.log('List:', todoList);
      let todo = {
        id: '128',
        completed: input.completed,
        editing: input.editing,
        text: input.text,
        list: todoList
      };
      todos['128'] = todo;
      todoList.items.push(todo);

      return todo;
    }
  },
  TodoList: {
    items(root, params, context) {
      console.log(root, params, context);
      let listId = root.id;
      let numItems = params.first || 50;
      let items = todoLists[listId].items;
      let filteredItems = params.filter && params.filter != 'all'
        ? items.filter(({ completed }) => (params.filter == 'completed' ? completed : !completed))
        : items;
      let slicedItems = filteredItems.slice(0, numItems);
      // console.log(slicedItems);

      return slicedItems;
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({ schema: schema, context: req.user }))
);
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
