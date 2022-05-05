const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumsDBToModel } = require('../../utils/index2');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }
  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }
  async getAlbumById(id) {
    const query = [
      {
        text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
        values: [id],
      },
      {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      },
    ];

    const albumsResult = await this._pool.query(query[0]);

    if (!albumsResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumsResult.rows.map(mapAlbumsDBToModel)[0];

    const songsResult = await this._pool.query(query[1]);

    if (!songsResult.rowCount) {
      album.songs = songsResult.rows;
    }

    return album;

    // const result = await this._pool.query(query);
  }
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
  // upload cover
  async addCoverById(id, file) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [file, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Sampul gagal diunggah');
    }

    return result.rows[0].id;
  }
  async verifyExistingAlbumById(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}
module.exports = AlbumService;
