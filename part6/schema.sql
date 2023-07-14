DROP TABLE IF EXISTS Details;
CREATE TABLE Details (
  id INT,
  text TEXT,
  lat TEXT,
  lon TEXT,
  location TEXT,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS Images;
CREATE TABLE Images (
  detail_id INT,
  image TEXT
);
CREATE INDEX detail_id on Images(detail_id);