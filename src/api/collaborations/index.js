/* eslint linebreak-style: ["error", "windows"] */

const CollaborationsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "collaborations",
  version: "1.0.0",
  register: (server, {
    collaborationsServices, playlistsServices, usersServices, validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsServices,
      playlistsServices,
      usersServices,
      validator,
    );

    server.route(routes(collaborationsHandler));
  },
};
