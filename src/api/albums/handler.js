class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    // album likes
    this.postAlbumLikes = this.postAlbumLikes.bind(this);
    this.getAlbumLikes = this.getAlbumLikes.bind(this);
  }
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = "untitled", year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: "success",
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }
  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: "success",
      data: {
        album,
      },
    };
  }
  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  }
  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }
  // handler untuk like album
  async postAlbumLikes(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    const message = await this._service.addAlbumLikes(id, credentialId);

    const response = h.response({
      status: "success",
      message,
    });
    response.code(201);
    return response;
  }
  async getAlbumLikes(request, h) {
    const { id } = request.params;

    const { likes, isCache } = await this._service.getAlbumLikes(id);

    return h
      .response({
        status: "success",
        data: {
          likes,
        },
      })
      .header("X-Data-Source", isCache ? "cache" : "db");
  }
}

module.exports = AlbumsHandler;
