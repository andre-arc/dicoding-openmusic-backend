const SongsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "songs",
  version: "1.0.0",
  register: async (server, { songsServices, songsValidator }) => {
    const songsHandler = new SongsHandler(songsServices, songsValidator);
    server.route(routes(songsHandler));
  },
};
