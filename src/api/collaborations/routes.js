/* eslint linebreak-style: ["error", "windows"] */
const routes = (handler) => [
  {
    method: "POST",
    path: "/collaborations",
    handler: handler.postCollaborationHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/collaborations",
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
];

module.exports = routes;
