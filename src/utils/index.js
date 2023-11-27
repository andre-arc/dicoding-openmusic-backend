/* eslint-disable camelcase */
/* eslint linebreak-style: ["error", "windows"] */

const mapAlbumDBToModel = ({
  cover_url, id, name, year, created_at, updated_at,
}) => ({
  coverUrl: cover_url,
  id,
  name,
  year,
  created_at,
  updated_at,
});

const mapSongDBToModel = ({
  id, title, year, performer, genre, duration, album_id, created_at, updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
  created_at,
  updated_at,
});

const mapShortSongToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel, mapShortSongToModel };
