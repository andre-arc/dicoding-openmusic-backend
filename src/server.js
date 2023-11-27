/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

require("dotenv").config();

const Hapi = require("@hapi/hapi");

// import external plugins
const Inert = require("@hapi/inert");
const Jwt = require("@hapi/jwt");
const path = require("path");

// import album depedency
const AlbumsServices = require("./services/postgres/AlbumsServices");
const albums = require("./api/albums");
const AlbumsValidator = require("./validator/albums");

// import song depedency
const SongsServices = require("./services/postgres/SongsServices");
const songs = require("./api/songs");
const SongsValidator = require("./validator/songs");

// import user depedency
const UsersServices = require("./services/postgres/UsersServices");
const users = require("./api/users");
const UsersValidator = require("./validator/users");

// import authentication depedency
const AuthenticationServices = require("./services/postgres/AuthenticationServices");
const authentications = require("./api/authentications");
const TokenManager = require("./tokenize/TokenManager");
const AuthValidator = require("./validator/authentications");

// import playlist depedency
const playlists = require("./api/playlists");
const PlaylistsServices = require("./services/postgres/PlaylistsServices");
const PlaylistsValidator = require("./validator/playlists");

// import collaboration depedency
const CollaborationsServices = require("./services/postgres/CollaborationsServices");
const collaborations = require("./api/collaborations");
const CollaborationsValidator = require("./validator/collaborations");

// import exports depedency
const ProducerService = require("./services/rabbitmq/ProducerService");
const _exports = require("./api/exports");
const ExportsValidator = require("./validator/exports");

// import upload depedency
const StorageService = require("./services/storage/StorageService");
const uploads = require("./api/uploads");
const UploadsValidator = require("./validator/uploads");

// import cache service
const CacheServices = require("./services/redis/CacheServices");

const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const cacheServices = new CacheServices();
  const albumsServices = new AlbumsServices(cacheServices);
  const songsServices = new SongsServices();
  const usersServices = new UsersServices();
  const authenticationsServices = new AuthenticationServices();
  const collaborationsServices = new CollaborationsServices();
  const playlistsServices = new PlaylistsServices(collaborationsServices);
  const storageServices = new StorageService(
    path.resolve(__dirname, "api/albums/file/covers"),
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // register external plugins
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  // registry auth strategy for private APIs
  server.auth.strategy("openmusic_auth_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // register plugins
  await server.register([
    {
      plugin: albums,
      options: {
        albumsServices,
        albumsValidator: AlbumsValidator,
        storageServices,
        uploadsValidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        songsServices,
        songsValidator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        usersServices,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsServices,
        usersServices,
        tokenManager: TokenManager,
        validator: AuthValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsServices,
        songsServices,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsServices,
        playlistsServices,
        usersServices,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        services: ProducerService,
        playlistsServices,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageServices,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
