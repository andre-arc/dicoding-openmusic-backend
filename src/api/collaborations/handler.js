/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(collaborationsServices, playlistsServices, usersServices, validator) {
    this._collaborationsServices = collaborationsServices;
    this._playlistsServices = playlistsServices;
    this._usersServices = usersServices;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsServices.verifyPlaylistOwner(playlistId, credentialId);

    await this._usersServices.getUserById(userId);

    const collaborationId = await this._collaborationsServices.addCollaboration(playlistId, userId);

    const response = h.response({
      status: "success",
      message: "Kolaborasi berhasil ditambahkan",
      data: { collaborationId },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsServices.verifyPlaylistOwner(playlistId, credentialId);

    await this._usersServices.getUserById(userId);

    await this._collaborationsServices.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Kolaborasi berhasil dihapus",
    };
  }
}

module.exports = CollaborationsHandler;
