const mapAlbumsDBToModel = ({ id, name, year, cover: coverUrl }) => ({
  id,
  name,
  year,
  coverUrl,
});

module.exports = { mapAlbumsDBToModel };
