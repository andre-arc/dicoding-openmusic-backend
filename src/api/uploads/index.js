/* eslint linebreak-style: ["error", "windows"] */

const UploadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "uploads",
  version: "1.0.0",
  register: async (server, { storageServices, validator }) => {
    const uploadsHandler = new UploadsHandler(storageServices, validator);
    server.route(routes(uploadsHandler));
  },
};
