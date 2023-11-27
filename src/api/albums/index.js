const AlbumsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "albums",
  version: "1.0.0",
  register: async (server, {
    albumsServices,
    albumsValidator,
    storageServices,
    uploadsValidator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      albumsServices,
      albumsValidator,
      storageServices,
      uploadsValidator,
    );
    server.route(routes(albumsHandler));
  },
};
