/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class AuthenticationServices {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    await this._pool.query({
      text: "INSERT INTO authentications VALUES($1)",
      values: [token],
    });
  }

  async verifyRefreshToken(token) {
    const verifyToken = await this._pool.query({
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    });

    if (!verifyToken.rowCount) {
      throw new InvariantError("Refresh token tidak valid");
    }
  }

  async deleteRefreshToken(token) {
    await this._pool.query({
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    });
  }
}

module.exports = AuthenticationServices;
