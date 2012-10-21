#!/usr/bin/env node
var VERSION = '0.1.0';

var restaurants = ['aallokko', 'alvari', 'cafe-libri', 'lozzi',
    'musica', 'piato', 'wilhelmiina', 'hestia',
    'kvarkki', 'ylisto', 'novelli', 'normaalikoulu'];
var apiPrefix = 'api';
var baseUrl = 'http://www.sonaatti.fi/';

var restify = require('restify');
var io = require('node.io');
var funkit = require('funkit');

var scraper = require('../lib/scraper');

var program = require('commander');

program.
    version(VERSION).
    option('-o --output <output>', 'output file, if not provided uses stdout').
    option('-s --serve', 'serve API').
    option('-p --port', 'server port').
    option('-r --restaurant', 'pick one of these: ' + restaurants.join(', ')).
    option('--silent', 'silent if file output is used').
    parse(process.argv);

main(program);

//scraper.foodToday(baseUrl + 'piato', function(d) {console.log(d);});

function main(p) {
    console.log('sonaatti-scraper ' + VERSION + '\n');

    if(p.serve) return serve(p.port);
}

function writeJSON(filename, out, data) {
    var f = filename + '.json';
    data = funkit.concat(data).filter(funkit.id);

    fs.writeFile(f, JSON.stringify(data, null, 4), function(e) {
        if(e) throw e;

        out('JSON saved to ' + f);
    });
}

function serve(port) {
    port = port || 8000;

    var server = restify.createServer();
    var apiRoot = '/' + apiPrefix + '/';

    server.get('/', help);
    server.get(apiRoot, help);

    function help(req, res) {
        res.send('Try ' + apiRoot + '<' + restaurants.join('|') + '>/today');
    }

    restaurants.forEach(function(restaurant) {
        server.get(apiRoot + restaurant + '/today', function(req, res) {
            scraper.foodToday(baseUrl + restaurant, function(d) {
                res.send(d);
            });
        });
        // TODO: specific days
    });

    server.listen(port, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
}
