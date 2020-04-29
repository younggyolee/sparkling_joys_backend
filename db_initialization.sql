\c sparkling_joys;

-- CREATE TABLE users {
-- 	id int PRIMARY KEY,
-- 	email varchar(255),
-- 	signup_type varchar(255), // email, google, facebook, etc.
-- }

CREATE TABLE items {
	id int PRIMARY KEY,
	FOREIGN KEY (user_id) REFERENCES users (id),
	title varchar(255),
	description varchar(255),
	category_lv1 varchar(255),
	category_lv2 varchar(255),
	category_lv3 varchar(255),
	category_lv4 varchar(255),
	price_new_usd int,
	price_current_usd int
}

CREATE TABLE recent_listings {
	id int PRIMARY KEY,
	FOREIGN KEY (item_id) REFERENCES items (id),
	date_sold date,
	title varchar(255),
	source varchar(255),
	price_sold_usd int
}
