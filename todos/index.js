// @flow weak
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const fs = require('fs');
const { todos, todoLists } = require('./data');

const PORT = 3000;

const typeDefs = [
  fs.readFileSync('schema.graphql', 'utf8'),
  fs.readFileSync('todos.graphql', 'utf8')
];

function log(label, ...args) {
  console.log('');
  console.log(label);
  console.log('');
  console.log(...args);
  console.log('');
  console.log('-'.repeat(20));
}

const resolvers = {
  Mutation: {
    addItem(parent, { input }, context) {
      log('Mutation: addItem', parent, input, context);
      let todoList = todoLists[input.listId];
      log('List:', todoList);
      let newId = Date.now();
      let todo = {
        id: newId,
        completed: input.completed,
        editing: input.editing,
        text: input.text,
        list: todoList
      };
      todos[newId] = todo;
      todoList.items.push(todo);

      return todo;
    }
  },
  Query: {
    todoItem(parent, params, context) {
      log('Query: todoItem', parent, params, context);
      let todo = todos[params.id];
      return todo;
    },
    todoList(parent, params, context) {
      log('Query: todoList', parent, params, context);
      let list = todoLists[params.id];
      return list;
    }
  },
  TodoList: {
    items(parent, params, context) {
      log('TodoList: items', parent, params, context);
      let listId = parent.id;
      let numItems = params.first || 50;
      let items = todoLists[listId].items;
      let filteredItems = params.filter && params.filter != 'all'
        ? items.filter(({ completed }) => (params.filter == 'completed' ? completed : !completed))
        : items;
      let slicedItems = filteredItems.slice(0, numItems);

      return slicedItems;
    },
    length(parent, params, context) {
      log('TodoList: length', parent, params, context);
      let listId = parent.id;
      return todoLists[listId].items.length;
    }
  },
  TodoItem: {
    list(parent, params, context) {
      log('TodoItem: list', parent, params, context);
      let listId = parent.listId;
      return todoLists[listId];
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({ schema: schema, context: { userId: 42 } }))
);
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
