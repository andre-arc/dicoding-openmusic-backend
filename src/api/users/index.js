/* eslint linebreak-style: ["error", "windows"] */

const UsersHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "users",
  version: "1.0.0",
  register: (server, { usersServices, validator }) => {
    const usersHandler = new UsersHandler(usersServices, validator);
    server.route(routes(usersHandler));
  },
};
