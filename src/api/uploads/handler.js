/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const autoBind = require("auto-bind");

class UploadsHandler {
  constructor(storageServices, validator) {
    this._storageServices = storageServices;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { data } = request.payload;
    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._services.writeFile(data, data.hapi);

    const response = h.response({
      status: "success",
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
