var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var marko = require('marko');
require("babel-core").transform("code", {});

app.use(express.static('components'));

app.get('/_content/:slug', function (req, res) {
    var dataSlug = req.params.slug;
    res.send(require('./components/' + dataSlug + '/data/data'));
});

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    var tpl = marko.load(require.resolve('./template/index.marko')),
        directoryList = getDirectories('./components');
    tpl.render({
        dirs: directoryList
    }, res);
});

app.get('/_components/:slug', function (req, res) {
    var compName = req.params.slug;
    var getMockData = require('./components/'+compName+'/data/data.json');
    var tpl = marko.load(require.resolve('./template/component.marko'));
    tpl.render({
        $global: {
            'host': req.headers.host
        },
        compName: compName,
        mock: JSON.stringify(getMockData),
        isServer: (req.query.server != '' ? req.query.server : true)
    }, res);
});

var port = process.env.port || 3000;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://' + host + ':' + port);
});


function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}