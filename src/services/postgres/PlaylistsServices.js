/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsServices {
  constructor(collaborationsServices) {
    this._pool = new Pool();
    this._collaborationsServices = collaborationsServices;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const createPlaylist = await this._pool.query({
      text: "INSERT INTO playlists VALUES($1, $2, $3) returning id",
      values: [id, name, owner],
    });

    if (!createPlaylist.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return createPlaylist.rows[0].id;
  }

  async getPlaylists(userId) {
    const getPlaylists = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
                    LEFT JOIN users ON users.id = playlists.owner
                    LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    });
    return getPlaylists.rows;
  }

  async deletePlaylistById(id) {
    const deletePlaylist = await this._pool.query({
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    });

    if (!deletePlaylist.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const insertSong = await this._pool.query({
      text: "INSERT INTO playlist_songs (playlist_id, song_id) VALUES($1, $2) RETURNING id",
      values: [playlistId, songId],
    });

    if (!insertSong.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }
  }

  async getSongsOfPlaylist(playlistId) {
    const getDetailPlaylist = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON playlists.owner = users.id
                    WHERE playlists.id = $1`,
      values: [playlistId],
    });

    const getSongs = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
                    JOIN playlist_songs ON songs.id = playlist_songs.song_id
                    WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    });

    return { ...getDetailPlaylist.rows[0], songs: getSongs.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const deleteSong = await this._pool.query({
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      values: [playlistId, songId],
    });

    if (!deleteSong.rowCount) {
      throw new InvariantError("Lagu gagal dihapus");
    }
  }

  async addActivityToPlaylist(playlistId, songId, userId, action) {
    const addActivity = await this._pool.query({
      text: "INSERT INTO playlist_activities (playlist_id, song_id, user_id, action) VALUES($1, $2, $3, $4) RETURNING id",
      values: [playlistId, songId, userId, action],
    });

    if (!addActivity.rows[0].id) {
      throw new InvariantError("Activity gagal ditambahkan ke playlist");
    }
  }

  async getActivitiesFromPlaylist(playlistId) {
    const getActivities = await this._pool.query({
      text: `SELECT users.username, songs.title, action, time FROM playlist_activities
                    JOIN songs ON playlist_activities.song_id = songs.id
                    JOIN users ON playlist_activities.user_id = users.id
                    WHERE playlist_activities.playlist_id = $1`,
      values: [playlistId],
    });

    return getActivities.rows;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const getPlaylist = await this._pool.query({
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    });

    if (!getPlaylist.rowCount) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = getPlaylist.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsServices.verifyCollaboration(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsServices;
