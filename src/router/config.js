var authRoutes = [
  {
    path: '/',
    name: 'NotesLogin',
    component: 'Notes/NotesLogin'
  },
  {
    path: '/notes',
    name: 'Notes',
    component: 'Notes/Notes'
  }
];

var baseRoutes = [
  // 404
  {
    path: '*',
    name: 'NotFound',
    component: 'Error/NotFound'
  }
];

const routers = authRoutes.concat(baseRoutes);

export {
  routers,
  baseRoutes,
  authRoutes
};
