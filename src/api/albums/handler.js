/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

const autoBind = require("auto-bind");

class AlbumsHandler {
  constructor(albumsServices, albumsValidator, storageServices, uploadsValidator) {
    this._albumsServices = albumsServices;
    this._albumsValidator = albumsValidator;
    this._storageServices = storageServices;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsServices.addAlbum({
      name,
      year,
    });

    const response = h.response({
      status: "success",
      message: "Album berhasil ditambahkan",
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsServices.getAlbums();
    return {
      status: "success",
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._albumsServices.getAlbumById(id);
    return {
      status: "success",
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    const { id } = request.params;

    this._albumsValidator.validateAlbumPayload(request.payload);
    await this._albumsServices.putAlbumById(id, request.payload);
    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsServices.deleteAlbumById(id, request.payload);
    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    await this._albumsServices.checkAlbumExist(id);

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageServices.writeFile(cover, cover.hapi);

    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    await this._albumsServices.editAlbumCoverById(id, fileLocation);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });

    response.code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._albumsServices.giveLikeToAlbum(id, credentialId);
    const response = h.response({
      status: "success",
      message,
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._albumsServices.unlikeTheAlbum(id, credentialId);
    const response = h.response({
      status: "success",
      message,
    });

    response.code(200);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, source } = await this._albumsServices.getAlbumLikesById(id);

    const response = h.response({
      status: "success",
      data: { likes },
    });

    response.header("X-Data-Source", source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
