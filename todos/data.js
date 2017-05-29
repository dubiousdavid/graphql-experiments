// @flow weak
let todos = {
  '123': {
    completed: true,
    editing: false,
    id: '123',
    listId: '456',
    text: 'Milk'
  },
  '124': {
    completed: false,
    editing: false,
    id: '124',
    listId: '456',
    text: 'Sugar'
  },
  '125': {
    completed: false,
    editing: false,
    id: '125',
    listId: '456',
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

module.exports = { todos, todoLists };
