var express = require("express"),
    unblocker = require("unblocker"),
    serveStatic = require('serve-static'),
    fs = require('fs'),
    cookieParser = require('cookie-parser'),
    origin = require("./origin.js"),
    mysql = require('./mysql.js'),
    port = process.env.PORT || 80,
    app = express();
///*

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

//
app.get('/create', (req, res, next) => {
  var sql = "CREATE TABLE whitelist(id INT AUTO_INCREMENT PRIMARY KEY, proxyuserid VARCHAR(255) UNIQUE, created_at BIGINT, expires BIGINT)";
  mysql.query(sql, (err) => console.log(err));
  res.send('done');
});

app.get('/delete', (req, res, next) => {
  var sql = 'DROP TABLE whitelist';
  mysql.query(sql, (err) => console.log(err));
  res.send('done');
});
//*/

app.get('/myip', (req, res, next) => {
  res.status(200).send(req.headers['x-forwarded-for']);
});

app.get('/activate', (req, res, next) => {
  var id = req.body.proxyuserid;
  res.cookie('proxyuserid', id, {
    maxAge: 60*60*24*365,
    httpOnly: true
  });
  res.redirect(req.headers['referer'] || '/');
});

app.post('/add/id', (req, res, next) => {
  var password = req.body.password,
      id = Math.random(),
      dollars = req.body.dollars;
  if(password === process.env.PASSWORD) {
  }else{
    res.status(403).send('Wrong password: ' + req.body.password);
    return;
  }
  var timestamp = Math.floor(new Date().getTime() / 1000),
      paidtime = dollars / 2 * 30 * 24 * 60 * 60,
      expires = timestamp + paidtime;
  insertID(id, timestamp, expires, req, res);
});

app.use('/proxy', (req,res,next) => {
  var id = req.cookies.proxyuserid,
      sql = 'SELECT * FROM whitelist WHERE proxyuserid = \'' + id + '\'';
  mysql.query(sql, (err, result, fields) => {
    if (err) throw err;
    if(result[0]) {
      next();
    }else{
      var date = new Date();
      if(date.getHours() === 16 && date.getMinutes() <= 30) {
        next();
      }else{
        res.sendFile('/blocked.html', {
          root: __dirname
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

function insertID(id, timestamp, expires, req, res) {
  var sql = "INSERT INTO whitelist(proxyuserid, created_at, expires) VALUES('" + id + "', " + timestamp + ", " + expires + ")";
  if(id && timestamp && expires){

  }else{
    res.status(400).send('Empty fields');
  }
  mysql.query(sql,(err) => {
    if(err){
      if(err.errno ==1062){
        insertID(Math.random(), timestamp, expires, req, res);
      }else{
        throw err;
      }
    }
    res.send('<h2> ID added to whitelist:<br>' + id + '</h2>');
  });
}