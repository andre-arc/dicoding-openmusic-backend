/* eslint linebreak-style: ["error", "windows"] */

const Joi = require("joi");

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongFromPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PostActivitiesPayloadSchema = Joi.object({
  songId: Joi.string().required(),
  userId: Joi.string().required(),
  action: Joi.string().required(),
  time: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
  PostActivitiesPayloadSchema,
};
