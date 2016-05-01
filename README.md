# Any Url Http Server

A HTTP server that responds with the content of the input file, irrespective of what path / method is requested. Can be used for quickly mocking a API response for dev / testing purposes.

## Install

    npm install anyurlhttpserver -g

## Run

    anyurlhttpserver -p 3000 -f a.json

When the above command is executed, any URL that is hit at http://localhost:3000/* will serve the contents of `a.json` for all HTTP methods. To see help:

```
  $ anyurlhttpserver -h

  anyurlhttpserver: Serve one file for any url path / method.

  Usage: anyurlhttpserver [options]

  Options:

    -p, --port           Port to listen. Default is `10101`.
    -f, --file           File to serve. When not given, serves content `{"hello": "world"}`.
    -c, --content-type   Response content type. Default is `application/json`.
    -H, --header         * Response header in the format `header:value`.
    -s, --status-code    Response status code. Default is `200`.
    -h, --help           output usage information.

  Parameters with * can be used more than once.

```
