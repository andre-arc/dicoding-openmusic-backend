/* eslint linebreak-style: ["error", "windows"] */
const Joi = require("joi");

const ImageHeadersSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/tiff",
    )
    .required(),
}).unknown();

module.exports = { ImageHeadersSchema };
