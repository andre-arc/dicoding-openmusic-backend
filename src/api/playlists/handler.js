/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(playlistsServices, songsServices, validator) {
    this._playlistsServices = playlistsServices;
    this._songsServices = songsServices;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsServices.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: { playlistId },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsServices.getPlaylists(credentialId);

    return {
      status: "success",
      data: { playlists },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistOwner(playlistId, credentialId);

    await this._playlistsServices.deletePlaylistById(playlistId);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postSongHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(playlistId, credentialId);

    await this._songsServices.getSongById(songId);

    await this._playlistsServices.addSongToPlaylist(playlistId, songId);

    const action = "add";
    await this._playlistsServices.addActivityToPlaylist(
      playlistId,
      songId,
      credentialId,
      action,
    );

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
    });

    response.code(201);
    return response;
  }

  async getSongListHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(playlistId, credentialId);

    const detailPlaylist = await this._playlistsServices.getSongsOfPlaylist(playlistId);

    return {
      status: "success",
      data: { playlist: detailPlaylist },
    };
  }

  async deleteSongByIdHandler(request) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsServices.deleteSongFromPlaylist(playlistId, songId);

    const action = "delete";
    await this._playlistsServices.addActivityToPlaylist(
      playlistId,
      songId,
      credentialId,
      action,
    );

    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    };
  }

  async getActivitiesHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsServices.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistsServices.getActivitiesFromPlaylist(playlistId);

    return {
      status: "success",
      data: { playlistId, activities },
    };
  }
}

module.exports = PlaylistsHandler;
