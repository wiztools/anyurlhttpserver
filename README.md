# Any Url Http Server

A HTTP server that responds with the content of the input file, irrespective of what path / method is requested. Can be used for quickly mocking a API response for dev / testing purposes.

## Install

    npm install anyurlhttpserver -g

## Run

    anyurlhttpserver -p 3000 -f a.json

When the above command is executed, any URL that is hit at http://localhost:3000/ will serve the contents of `a.json`. To see help:

    anyurlhttpserver -h
