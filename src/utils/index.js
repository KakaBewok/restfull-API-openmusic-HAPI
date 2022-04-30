const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapAlbumDBToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
});

const mapUserDBToModel = ({ id, username, password, fullname }) => ({
  id,
  username,
  password,
  fullname,
});

const mapGetPlaylistDBToModel = ({ id, name, username }) => ({
  id,
  name,
  username,
});

const mapGetPlaylistActivitiesDBToModel = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapAlbumDBToModel,
  mapSongDBToModel,
  mapUserDBToModel,
  mapGetPlaylistDBToModel,
  mapGetPlaylistActivitiesDBToModel,
};
