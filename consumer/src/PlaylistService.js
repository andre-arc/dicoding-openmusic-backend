const { Pool } = require("pg");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(playlistId) {
    const getPlaylists = await this._pool.query({
      text: `SELECT id, name FROM playlists WHERE id = $1`,
      values: [playlistId],
    });

    const getSongsByPlaylist = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
                    LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
                    WHERE playlist_songs.playlist_id = $1`,
      values: [getPlaylists.rows[0].id],
    });

    const playlist = getPlaylists.rows[0];
    playlist.songs = getSongsByPlaylist.rows;

    return { playlist };
  }
}

module.exports = PlaylistsService;
