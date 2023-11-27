/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { mapAlbumDBToModel } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");
const InvariantError = require("../../exceptions/InvariantError");

class AlbumsServices {
  constructor(cacheServices) {
    this._pool = new Pool();
    this._cacheServices = cacheServices;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapAlbumDBToModel);
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const resultSongs = await this._pool.query({
      text: "SELECT * FROM songs WHERE album_id = $1",
      values: [id],
    });

    return {
      ...result.rows.map(mapAlbumDBToModel)[0],
      songs: resultSongs.rows,
    };
  }

  async putAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE albums SET name = $2, year = $3, updated_at = $4 WHERE id = $1 RETURNING id",
      values: [id, name, year, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album, id tidak ditemukan");
    }
  }

  async editAlbumCoverById(id, fileLocation) {
    await this._pool.query({
      text: "UPDATE albums SET cover_url = $2 WHERE id = $1 RETURNING id",
      values: [id, fileLocation],
    });
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Album gagal dihapus, id tidak ditemukan");
    }
  }

  async checkAlbumExist(id) {
    const result = await this._pool.query({
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Album tidak ditemukan");
    }
  }

  async giveLikeToAlbum(id, userId) {
    await this.checkAlbumExist(id);

    const result = await this._pool.query({
      text: "SELECT * FROM user_album_likes WHERE album_id = $1 and user_id = $2",
      values: [id, userId],
    });

    if (!result.rowCount) {
      const insert = await this._pool.query({
        text: "INSERT INTO user_album_likes (album_id, user_id) VALUES ($1, $2) RETURNING id",
        values: [id, userId],
      });

      if (!insert.rowCount) {
        throw new InvariantError("Gagal menyukai album");
      }

      const msg = "Berhasil menyukai album";

      await this._cacheServices.delete(`user_album_likes:${id}`);
      return msg;
    }

    throw new InvariantError("Album sudah disukai");
  }

  async unlikeTheAlbum(id, userId) {
    await this.checkAlbumExist(id);

    const deleteResult = await this._pool.query({
      text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [id, userId],
    });

    if (!deleteResult.rowCount) {
      throw new InvariantError("Gagal membatalkan menyukai album");
    }

    const msg = "Batal menyukai album";

    await this._cacheServices.delete(`user_album_likes:${id}`);
    return msg;
  }

  async getAlbumLikesById(id) {
    try {
      const source = "cache";
      const likes = await this._cacheServices.get(`user_album_likes:${id}`);
      return { likes: +likes, source };
    } catch (error) {
      await this.checkAlbumExist(id);

      const source = "server";
      const result = await this._pool.query({
        text: "SELECT * FROM user_album_likes WHERE album_id = $1",
        values: [id],
      });

      const likes = result.rowCount;
      await this._cacheServices.set(`user_album_likes:${id}`, likes, 1800);

      return { likes, source };
    }
  }
}

module.exports = AlbumsServices;
