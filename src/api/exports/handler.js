/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(services, playlistServices, validator) {
    this._services = services;
    this._validator = validator;
    this._playlistServices = playlistServices;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistServices.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._services.sendMessage("export:playlists", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Permintaan anda dalam antrian",
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
