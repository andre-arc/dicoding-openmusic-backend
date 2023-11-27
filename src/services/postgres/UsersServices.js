/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersServices {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await this._pool.query({
      text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id",
      values: [id, username, hashedPassword, fullname],
    });

    if (!createUser.rowCount) {
      throw new InvariantError("User gagal ditambahkan");
    }

    return createUser.rows[0].id;
  }

  async verifyNewUsername(username) {
    const checkUser = await this._pool.query({
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    });

    if (checkUser.rowCount > 0) {
      throw new InvariantError("Gagal menambahkan user. Username sudah digunakan.");
    }
  }

  async getUserById(id) {
    const getUser = await this._pool.query({
      text: "SELECT id, username, fullname FROM users WHERE id = $1",
      values: [id],
    });

    if (!getUser.rowCount) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return getUser.rows[0];
  }

  async verifyUserCredential(username, password) {
    const userAuth = await this._pool.query({
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    });

    if (!userAuth.rowCount) {
      throw new AuthenticationError("Kredensial yang anda berikan salah");
    }

    const { id, password: hashedPassword } = userAuth.rows[0];
    const matchPassword = await bcrypt.compare(password, hashedPassword);

    if (!matchPassword) {
      throw new AuthenticationError("Kredensial yang anda berikan salah");
    }

    return id;
  }

  async getUsersByUsername(username) {
    const getUser = await this._pool.query({
      text: "SELECT id, username, fullname FROM users WHERE username LIKE $1",
      values: [`%${username}%`],
    });

    if (!getUser.rowCount) {
      throw new NotFoundError("User dengan Username ini tidak ditemukan");
    }

    return getUser.rows[0];
  }
}

module.exports = UsersServices;
