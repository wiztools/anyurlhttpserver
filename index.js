#!/usr/bin/env node

"use strict";

var fs = require('fs');

// Constants:
const DEF_PORT = 10101;
const DEF_CONTENT = '{"hello": "world"}';
const DEF_CT = 'application/json';
const DEF_STATUS = 200;

// Cli configuration:
var Program = require('wiz-cliparse');
var prg = new Program('anyurlhttpserver',
  'Serve one file for any url path / method.',
  '[options]');

prg.addOpt('p', 'port', `Port to listen. Default is \`${DEF_PORT}\`.`, {hasArg: true});
prg.addOpt('f', 'file', `File to serve. When not given, serves content \`${DEF_CONTENT}\`.`, {hasArg: true});
prg.addOpt('c', 'content-type', `Response content type. Default is \`${DEF_CT}\`.`, {hasArg: true});
prg.addOpt('H', 'header', '* Response header in the format `header:value`.', {hasArg: true, multiArg: true});
prg.addOpt('s', 'status-code', `Response status code. Default is \`${DEF_STATUS}\`.`, {hasArg: true});

prg.addHelpOpt('Output usage information.');

// Cli parse:
try {
  var res = prg.parse();
}
catch(err) {
  console.error(`Cli parse error: ${err}.`);
  process.exit(1);
}

if(res.gopts.has('h')) {
  prg.printHelp(res);
  console.log('  Parameters with * can be used more than once.');
  console.log();
  process.exit();
}

// Assign to variables:
var port = (function(){
  if(!res.gopts.has('p')) {
    return DEF_PORT;
  }
  let p = parseInt(res.goptArg.get('p'));
  if(Number.isNaN(p)) {
    console.error(`Invalid port specified: ${p}.`);
    process.exit(1);
  }
  return p;
})();

var data = (function(){
  if(res.gopts.has('f')) {
    let f = res.goptArg.get('f');
    try {
      return fs.readFileSync(f);
    }
    catch(err) {
      console.error(`Error reading ${f}: ${err}.`);
      process.exit(1);
    }
  }
  else {
    return DEF_CONTENT;
  }
})();

var ct = (function(){
  if(res.gopts.has('c')) {
    return res.goptArg.get('c');
  }
  else {
    return DEF_CT;
  }
})();

var status = (function(){
  if(res.gopts.has('s')) {
    let s = parseInt(res.goptArg.get('s'));
    if(Number.isNaN(s)) {
      console.error(`Status code is invalid: ${s}.`);
      process.exit(1);
    }
    return res.goptArg.get('s');
  }
  else {
    return DEF_STATUS;
  }
})();

var headers = (function(){
  if(res.gopts.has('H')) {
    return res.goptArg.get('H');
  }
  else {
    return [];
  }
})();

// Web server start:
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.all('/*', function(req, res){
  res.type(ct);
  for(let header of headers) {
    let arr = header.split(/\s*:\s*/);
    if(arr.length === 2) {
      res.header(arr[0], arr[1]);
    }
    else {
      console.error(`Not setting unparsable header: ${header}.`);
    }
  }
  res.status(status);
  res.send(data);
});

console.log(`Starting server in port ${port}.`);
app.listen(port);
