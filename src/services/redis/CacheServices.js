/* eslint-disable import/no-extraneous-dependencies */
/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

const redis = require("redis");

/* eslint linebreak-style: ["error", "windows"] */
class CacheServices {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on("error", (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const data = await this._client.get(key);

    if (data === null) {
      throw new Error("Cache tidak ditemukan");
    }

    return data;
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheServices;
