/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class CollaborationsServices {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const createCollaboration = await this._pool.query({
      text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, userId],
    });

    if (!createCollaboration.rowCount) {
      throw new InvariantError("Kolaborasi gagal ditambahkan");
    }

    return createCollaboration.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const deleteCollaboration = await this._pool.query({
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    });

    if (!deleteCollaboration.rowCount) {
      throw new InvariantError("Kolaborasi gagal dihapus");
    }
  }

  async verifyCollaboration(playlistId, userId) {
    const verifyCollaboration = await this._pool.query({
      text: "SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
      values: [playlistId, userId],
    });

    if (!verifyCollaboration.rowCount) {
      throw new InvariantError("Kolaborasi gagal diverifikasi");
    }
  }
}

module.exports = CollaborationsServices;
