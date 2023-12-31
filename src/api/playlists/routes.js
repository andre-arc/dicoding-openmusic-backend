/* eslint linebreak-style: ["error", "windows"] */

const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: handler.postPlaylistHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: handler.getPlaylistsHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{playlistId}",
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{playlistId}/songs",
    handler: handler.postSongHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{playlistId}/songs",
    handler: handler.getSongListHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{playlistId}/songs",
    handler: handler.deleteSongByIdHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{playlistId}/activities",
    handler: handler.getActivitiesHandler,
    options: {
      auth: "openmusic_auth_jwt",
    },
  },
];

module.exports = routes;
