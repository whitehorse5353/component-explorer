var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var marko = require('marko');
var bodyParser = require("body-parser");
var tenant = process.argv.splice(2)[0];
require('babel-register')({
    presets: ['es2015', 'react']
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/_content/:slug', function (req, res) {
    var dataSlug = req.params.slug;
    res.send(require(path.resolve('./' + tenant + ((req.query.root === 'npm') ? '/node_modules/' : '/components/') + dataSlug + '/data/index')));
});

app.get('/explorer', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    var tpl = marko.load(require.resolve('./template/index.marko')),
        tenantPath = path.resolve('./' + tenant + '/components'),
        directoryList = getDirectories(tenantPath);
    var local = getDirectories('./' + tenant + '/node_modules');
    tpl.render({
        dirs: directoryList,
        locals: local
    }, res);
});

app.get('/_components/:slug', function (req, res) {
    var compName = req.params.slug;
    var tenantPath = path.resolve('./' + tenant + ((req.query.root === 'npm') ? '/node_modules/' : '/components/') + compName);
    var getMockData = require(tenantPath + '/data/index');
    var getPackageJson = require(tenantPath + '/package.json');
    var readMe = fs.readFileSync(tenantPath + '/README.md');
    var tpl = marko.load(require.resolve('./template/component.marko'));
    tpl.render({
        $global: {
            'host': req.headers.host
        },
        compName: compName,
        mock: JSON.stringify(getMockData),
        pack: JSON.stringify(getPackageJson),
        readMe: readMe,
        isServer: (req.query.server != '' ? req.query.server : true),
        engine: req.query.engine,
        tenantPath: path.resolve('./' + tenant + ((req.query.root) ? '/node_modules/' : '/components/') + compName),
        componentDataPath: tenant + ((req.query.root) ? '/node_modules/' : '/components/') + compName,
        contentURL: '/_content/' + compName + (req.query.root ? '?root=' + req.query.root : '')
    }, res);
});

app.post('/saveData/:slug', function (req, res) {
    var compName = req.params.slug;
    var fileName = req.body.fileName;
    var tenantPath = path.resolve('./' + tenant + ((req.query.root) ? '/node_modules/' : '/components/') + compName);
    if (fileName == 'readme') {
        fileName = tenantPath + '/README.md';
    }
    else if (fileName == 'editor') {
        fileName = tenantPath + '/data/index.json';
    }
    fs.writeFile(fileName, req.body.data, function (err) {
        if (err) {
            res.send({message: 'Error while saving Data', status: 500});
        }
        res.send({message: 'Saved Successfully', status: 200});
    });

});


var port = process.env.port || 8999;
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