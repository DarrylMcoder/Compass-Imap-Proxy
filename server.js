var express = require("express"),
    unblocker = require("unblocker"),
    serveStatic = require('serve-static'),
    fs = require('fs'),
    origin = require("./origin.js"),
    mysql = require('./mysql.js'),
    port = process.env.PORT || 80,
    app = express();
///*

app.use(express.json());

//
app.get('/create', (req, res, next) => {
  var sql = "CREATE TABLE whitelist(id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(255) UNIQUE, created_at BIGINT, expires BIGINT)";
  mysql.query(sql, (err) => console.log(err));
});

app.get('/delete', (req, res, next) => {
  var sql = 'DROP TABLE whitelist';
  mysql.query(sql, (err) => console.log(err));
});
//*/

app.post('/add/ip', (req, res, next) => {
  var password = req.body.password,
      ip = req.body.ip,
      dollars = req.body.dollars;
  if(password != process.env.PASSWORD) {
    res.status(403).send('Wrong password');
    return;
  }
  var timestamp = Math.floor(new Date().getTime() / 1000),
      paidtime = dollars / 2 * 30 * 24 * 60 * 60,
      expires = timestamp + paidtime,
      sql = "INSERT INTO whitelist(ip, created_at, expires) VALUES('" + ip + "', " + timestamp + ", " + expires + ")";
  if(ip && timestamp && expires){

  }else{
    res.status(400).send('Empty fields');
  }
  mysql.query(sql,(err) => {
    if(err) throw err;
    res.send('IP added to whitelist');
  });
});

app.use('/proxy', (req,res,next) => {
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
          res.setHeader('Content-type', 'text/html');
          res.send(date.getHours() + " \n " + date.getMinutes() + data);
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