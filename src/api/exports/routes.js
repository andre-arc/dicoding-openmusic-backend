/* eslint linebreak-style: ["error", "windows"] */

const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
];

module.exports = routes;
