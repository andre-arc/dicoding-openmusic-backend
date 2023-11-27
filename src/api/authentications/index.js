/* eslint linebreak-style: ["error", "windows"] */

const AuthenticationsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: (server, {
    authenticationsServices, usersServices, tokenManager, validator,
  }) => {
    const AuthHandler = new AuthenticationsHandler(
      authenticationsServices,
      usersServices,
      tokenManager,
      validator,
    );
    server.route(routes(AuthHandler));
  },
};
