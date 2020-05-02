-- if the database already exists,
-- login to psql shell as root user, (e.g. $ ```psql postgres -U ykmbp```)
-- then drop database to initialize
-- ```DROP DATABASE sparkling_joys;```
-- CREATE DATABASE sparkling_joys;

\c sparkling_joys;

CREATE TABLE users (
	id varchar(255) PRIMARY KEY,
	name varchar(255),
	password varchar(255), -- encrypted
	signup_type varchar(255) -- guest, email, google, facebook, etc.
);

CREATE TABLE items (
	id VARCHAR(255) PRIMARY KEY, -- increment by 1 every time an item is generated
	user_id VARCHAR(255) REFERENCES users(id),
	title VARCHAR(255),
	description VARCHAR(255),
	category_id VARCHAR(255),
	category_name VARCHAR(255),
	price BIGINT,
	price_currency VARCHAR(10),
	price_last_update_time TIMESTAMP WITH TIME ZONE,
	creation_time TIMESTAMP WITH TIME ZONE,
	image_url VARCHAR(255),
	is_owned BOOLEAN
);

CREATE TABLE listings (
	id VARCHAR(255) PRIMARY KEY, -- increment by 1 every time a listing is generated
	item_id VARCHAR(255) REFERENCES items (id),
	end_date DATE,
	title VARCHAR(255),
	source VARCHAR(100), --ebay, facebook marketplace, etc.
	price BIGINT,
	price_currency_code VARCHAR(10),
	url VARCHAR(255),
	image_url VARCHAR(255)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO younggyolee;
