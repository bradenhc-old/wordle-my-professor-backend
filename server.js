const express = require('express');
const app = express();
const backend = require('.');
const port = 8000;

// /search?name={{name}} will search for the professor with the given name

// /reviews/{{id}} will retrieve the reviews for the professor with the given ID

app.get('/search', (request, response) => {
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
  backend.scrape(request.params.id, (err, words) => {
    if (err) return respondBadRequest(response);
    respondOk(response, words);
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
