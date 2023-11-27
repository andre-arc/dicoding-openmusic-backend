/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class AuthenticationsHandler {
  constructor(authenticationsServices, usersServices, tokenManager, validator) {
    this._authenticationsServices = authenticationsServices;
    this._usersServices = usersServices;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  async postAuthHandler(request, h) {
    this._validator.validatePostAuthPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersServices.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsServices.addRefreshToken(refreshToken);

    const response = h.response({
      status: "success",
      message: "Authentication berhasil ditambahkan",
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthHandler(request) {
    this._validator.validatePutAuthPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsServices.verifyRefreshToken(refreshToken);
    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = await this._tokenManager.generateAccessToken({ id });

    return {
      status: "success",
      message: "Access Token berhasil diperbarui",
      data: { accessToken },
    };
  }

  async deleteAuthHandler(request) {
    this._validator.validateDeleteAuthPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authenticationsServices.verifyRefreshToken(refreshToken);
    await this._authenticationsServices.deleteRefreshToken(refreshToken);

    return {
      status: "success",
      message: "Refresh token berhasil dihapus",
    };
  }
}

module.exports = AuthenticationsHandler;
