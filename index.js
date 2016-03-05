var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var marko = require('marko');
var bodyParser=require("body-parser");
require("babel-core").transform("code", {});

app.use(express.static('components'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

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
    var getPackageJson = require('./components/'+compName+'/package.json');
    var readMe = fs.readFileSync('./components/'+compName+'/README.md');    
    var tpl = marko.load(require.resolve('./template/component.marko'));
    tpl.render({
        $global: {
            'host': req.headers.host
        },
        compName: compName,
        mock: JSON.stringify(getMockData),
        pack:JSON.stringify(getPackageJson),
        readMe: readMe,
        isServer: (req.query.server != '' ? req.query.server : true)
    }, res);
});

app.post('/save/:slug', function (req, res) {
var dataSlug = req.params.slug;
  res.send('PUT request to homepage');
  //console.log("iam hitted");
  fs.writeFile('./components/'+dataSlug+'/data/data.json', req.body.data, (err) => {
      if (err) throw err;
      console.log('It\'s saved!');
    });
  res.send('Saved Successfully');
});

app.post('/saveData/:slug',function(req,res){
    var compName = req.params.slug;    
    console.log(req.body);
    res.send('saved sucessfully');
})


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