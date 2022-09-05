class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postUploadCoverHandler(request, h) {
    await this._validator.validateCoverHeaders(
      request.payload.cover.hapi.headers
    );

    const { cover } = request.payload;
    const { id } = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;

    await this._albumsService.addCoverById(id, coverUrl);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }
}
module.exports = UploadsHandler;
