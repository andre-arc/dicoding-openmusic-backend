/* eslint linebreak-style: ["error", "windows"] */
const PlaylistsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "playlist",
  version: "1.0.0",
  register: (server, { playlistsServices, songsServices, validator }) => {
    const playlistsHandler = new PlaylistsHandler(playlistsServices, songsServices, validator);
    server.route(routes(playlistsHandler));
  },
};
