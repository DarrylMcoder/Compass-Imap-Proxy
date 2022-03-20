"use strict";

module.exports = function (/*config*/) {
  return function originHeader(data) {
    if(data.headers.origin) {
      let url = new URL(data.url);
      data.headers.origin = url.origin;
    }
  };
};