/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class UsersHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._services.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: "success",
      data: { userId },
    });

    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;

    const user = await this._services.getUserById(id);

    const response = h.response({
      status: "success",
      data: { user },
    });

    response.code(201);
    return response;
  }

  async getUserByUsernameHandler(request, h) {
    const { username = "" } = request.query;

    const user = await this._services.getUserByUsername(username);

    const response = h.response({
      status: "success",
      data: { user },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
