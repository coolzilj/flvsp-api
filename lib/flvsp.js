'use strict';

var Base64       = require('./base64');
var request      = require('request');
var cheerio      = require('cheerio');

function extract (body) {
  var $ = cheerio.load(body);

  var title   = $('.panel.panel-default').first().find('.panel-body .media-body .media-heading').text();
  var site    = $('.panel.panel-default').first().find('.panel-body .media-body > span > span > a').text();
  var streams = [];
  var raw_streams = $('.panel.panel-default').get().slice(1);

  $(raw_streams).each(function() {
    var parts  = $(this).find('.panel-heading > code').text().split('_');
    var length = $(this).find('.panel-heading > span.r code').first().text();
    var urls   = $(this).find('.panel-body a.file_url').map(function() {
      return $(this).attr('href');
    }).get();

    streams.push({
      segment: parts[0],
      quality: parts[1],
      format: parts[2],
      length: length,
      urls: urls
    });
  });

  return {
    title: title,
    site: site,
    streams: streams
  };
}

module.exports = function(pageURL, cb) {
  var page    = pageURL.replace(/(https?:)\/\//g,'$1##');
  var host    = 'http://www.flvsp.com';
  var path    = '/parse/getData.php?url=';
  var url     =  host + path + Base64.encode(page);
  var options = {
    url: url,
    headers: {
      'Host': 'www.flvsp.com',
      'Referer': 'http://www.flvsp.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  console.log('#### Fetching ' + pageURL + ' #### \n');
  request(options, function(err, res, body) {
    cb(extract(body));
  });
};
