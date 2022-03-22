var express = require("express"),
    unblocker = require("unblocker"),
    serveStatic = require('serve-static'),
    fs = require('fs'),
    origin = require("./origin.js"),
    mysql = require('./mysql.js'),
    port = process.env.PORT || 80,
    app = express();
///*

app.get('/create', (req, res, next) => {
  var sql = "CREATE TABLE whitelist(id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(255) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
  mysql.query(sql, (err) => console.log(err));
});

app.use((req,res,next) => {
  var sql = 'SELECT * FROM whitelist WHERE ip = \'' + req.headers['x-forwarded-for'] + '\'';
  mysql.query(sql, (err, result, fields) => {
    if (err) throw err;
    if(result[0]) {
      next();
    }else{
      var date = new Date();
      if(date.getHours() === 12 && date.getMinutes() <= 30) {
        next();
      }else{
        fs.readFile('blocked.html', (err, data) => {
          if(err) throw err;
          res.send(data);
        });
      }
    }
  });
});

app.use(
  unblocker({
    requestMiddleware: [
      origin()
    ],
    responseMiddleware: [
     
    ],
  })
);

app.use("/",serveStatic("public", {
  index: [
    "index.html",
    "index.htm"
  ],
}));

app.listen(port);

console.log("app listening on port "+ port);