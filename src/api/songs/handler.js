/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

const autoBind = require("auto-bind");

class SongsHandler {
  constructor(songsServices, songsValidator) {
    this._songsServices = songsServices;
    this._songsValidator = songsValidator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._songsValidator.validateSongPayload(request.payload);

    const songId = await this._songsServices.addSong(request.payload);

    const response = h.response({
      status: "success",
      message: "Song berhasil ditambahkan",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._songsServices.getSongs(title, performer);
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;

    const song = await this._songsServices.getSongById(id);
    return {
      status: "success",
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    const { id } = request.params;

    this._songsValidator.validateSongPayload(request.payload);
    await this._songsServices.putSongById(id, request.payload);
    return {
      status: "success",
      message: "Song berhasil diperbarui",
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    await this._songsServices.deleteSongById(id, request.payload);
    return {
      status: "success",
      message: "Song berhasil dihapus",
    };
  }
}

module.exports = SongsHandler;
