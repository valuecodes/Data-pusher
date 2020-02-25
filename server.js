const express = require('express');
const app = express();
const config = require('./config');
const mysql = require('mysql');
const myConnection  = require('express-myconnection');
const bodyParser = require('body-parser');
const main = require('./routes/main');
const port = 5000;

let dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}

app.use(myConnection(mysql, dbOptions, 'pool'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', main);

app.listen(port, () => console.log('Server started on port'+port));