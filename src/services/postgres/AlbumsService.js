const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumsDBToModel } = require('../../utils/index2');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;
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
  // album likes
  async addAlbumLikes(albumId, userId) {
    const id = `like-albums-${nanoid(16)}`;

    await this.getAlbumById(albumId);

    await this._cacheService.delete(`user_album_likes:${albumId}`);

    const Liked = await this.verifyAlbumLikes(albumId, userId);

    if (Liked) {
      const query = {
        text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
        values: [albumId, userId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Gagal tidak menyukai album');
      }

      return 'Berhasil tidak menyukai album';
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }
    return 'Berhasil menyukai album';
  }
  async verifyAlbumLikes(albumId, userId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount) return true;
    return false;
  }
  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(
        `user_album_likes:${albumId}`
      );
      return { likes: +result, isCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = +result.rows[0].count;

      await this._cacheService.set(`user_album_likes:${albumId}`, likes);

      return { likes, isCache: false };
    }
  }
}
module.exports = AlbumService;
