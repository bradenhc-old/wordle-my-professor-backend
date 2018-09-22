const fs = require('fs');
const express = require('express');
const app = express();
const backend = require('.');
const port = 8000;

var ignore = [];

fs.readFile('stop-words.txt', 'utf8', (err, text) => {
  if(err) throw err;
  ignore = text.split('\n');
});

app.get('/search', (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  var query = request.query;
  if (!isValidQuery(query)) {
    return respondBadRequest(response);
  }
  backend.search(query.name, (err, professors) => {
    if (err) return respondBadRequest(response);
    respondOk(response, professors);
  });
});

app.get('/reviews/:id', (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  backend.scrape(request.params.id, (err, words) => {
    if (err) return respondBadRequest(response);
    wordCounts = {};
    words.forEach(word => {
      if (ignore.indexOf(word) < 0) {
        count = wordCounts[word];
        if (!count) {
          wordCounts[word] = 0;
        }
        wordCounts[word]++;
      }
    });
    final = [];
    for (const word in wordCounts) {
      final.push({ word: word, count: wordCounts[word] });
    }
    respondOk(response, final);
  });
});

app.listen(port, () => console.log(`Wordle My Professor backend listening on port ${port}`));

function respondOk(response, body) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  if (!body) {
    body = [];
  }
  response.end(JSON.stringify(body));
}

function respondBadRequest(response) {
  response.writeHead(400);
  response.end();
}

function isValidQuery(q) {
  if (!q || !q.name) {
    return false;
  }
  return true;
}
