#!/usr/bin/env node

'use strict';

var fs = require('fs');
var ngrokTunnel = require('ngrok');

// Constants:
const DEF_CONTENT = '{"hello": "world"}';
const DEF_CT = 'application/json';
const DEF_STATUS = 200;

// Load package.json:
var pjson = require(__dirname + '/package.json');

// Cli configuration:
var Program = require('wiz-cliparse');
var prg = new Program(pjson.name,
  'Serve one file for any url path / method.',
  '[options]');

prg.addOpt('p', 'port',
  `[Mandatory] Port to listen.`,
  {hasArg: true, isMandatory: true});
prg.addOpt('f', 'file',
  `File to serve. When not given, serves content '${DEF_CONTENT}'.`,
  {hasArg: true});
prg.addOpt('c', 'content-type',
  `Response content type. Default is '${DEF_CT}'.`,
  {hasArg: true});
prg.addOpt('C', 'cors',
  `Add CORS headers to response. Optional Allow-Origin URL as param. Default is '*'.`,
  {hasArg: true, defaultArg: '*'});
prg.addOpt('H', 'header',
  `* Response header in the format 'header:value'.`,
  {hasArg: true, multiArg: true});
prg.addOpt('n', 'ngrok',
  `Provides an ngrok tunnel url for the running server.`);
prg.addOpt('s', 'status-code',
  `Response status code. Default is '${DEF_STATUS}'.`,
  {hasArg: true});
prg.addOpt('v', 'version', `Display ${pjson.name} version.`, {noMandatoryOptCheck: true});

prg.addHelpOpt('Output usage information.');

// Cli parse:
try {
  var res = prg.parse();
}
catch(err) {
  console.error(`Cli parse error: ${err}`);
  process.exit(1);
}

if(res.gopts.has('h')) {
  prg.printHelp(res);
  console.log('  Parameters with * can be used more than once.');
  console.log();
  process.exit();
}

if(res.gopts.has('v')) {
  console.log(`v${pjson.version}`);
  process.exit();
}

// Assign to variables:
var port = (function(){
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

var corsUrl = (function() {
  if(res.gopts.has('C')) {
    return res.goptArg.get('C');
  }
  else {
    return null;
  }
})();

var ngrok = (function() {
  if(res.gopts.has('n')) {
    return true;
  }
  else {
    return false;
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
  if(corsUrl) {
    res.setHeader('Access-Control-Allow-Origin', corsUrl);
    res.setHeader('Access-Control-Request-Method', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token');
  }
  res.status(status);
  res.send(data);
});

console.log(`Starting server in port ${port}.`);
app.listen(port, function(){
  if (ngrok) {
    ngrokTunnel.connect(port, function (err, url) {
      console.log('\nngrok url:');
      console.log(url);
    });
  }
});
