var express = require("express"),
    unblocker = require("unblocker"),
    serveStatic = require('serve-static'),
    port = process.env.PORT || 80,
    app = express();
///*

app.use(
  unblocker({
    requestMiddleware: [
      
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