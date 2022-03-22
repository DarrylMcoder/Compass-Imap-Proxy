var mysql = require('mysql');

var con = mysql.createConnection({
  host: "m7az7525jg6ygibs.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "mfrsr4fneo8jod2h",
  password: "ya2oxnpatakbx7jn"
  database: "kuyis9zmrmootcfw"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;