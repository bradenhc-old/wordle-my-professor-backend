const rp = require('request-promise');
const cheerio = require('cheerio');

const rateMyProfessorsUrlBase = 'http://www.ratemyprofessors.com';

const transform = body => cheerio.load(body);

// Searches for the ratings of the professor with the given name.
function search(name, finished) {
  var options = {
    uri: rateMyProfessorsUrlBase + '/search.jsp',
    qs: {
      query: name
    },
    transform: transform
  };
  rp(options)
    .then($ => {
      var listings = $('li.listing.PROFESSOR a', 'ul');
      if (listings.length) {
        var professors = [];
        listings.each((i, e) => {
          var professorName = e.children[3].children[1].children[0].data;
          var professorDescription = e.children[3].children[3].children[0].data;
          var professorId = e.attribs.href.match(/[0-9]+/)[0];
          professors.push({ name: professorName, description: professorDescription, id: professorId });
        });
        finished(false, professors);
      } else {
        finished(new Error('No professors found with the provided name'));
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function scrape(id, finished) {
  var options = {
    uri: rateMyProfessorsUrlBase + '/ShowRatings.jsp',
    qs: {
      tid: id
    },
    transform: transform
  };
  var allWords = [];
  rp(options)
    .then($ => {
      $('p.commentsParagraph').each((i, e) => {
        var review = e.children[0].data.trim();
        var words = review
          .replace(/[^A-Za-z\s\']/g, '')
          .toLowerCase()
          .split(/\s+/);
        allWords = allWords.concat(words);
      });
      finished(false, allWords);
    })
    .catch(err => {
      console.log(err);
      finished(err);
    });
}

module.exports.scrape = scrape;
module.exports.search = search;
