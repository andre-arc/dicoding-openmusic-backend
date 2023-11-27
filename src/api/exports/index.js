/* eslint linebreak-style: ["error", "windows"] */

const ExportsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { services, playlistsServices, validator }) => {
    const exportsHandler = new ExportsHandler(services, playlistsServices, validator);
    server.route(routes(exportsHandler));
  },
};
