var childProcess = require('child_process').exec,
    tenant = process.argv.splice(2)[0],
    child = childProcess('node ./node_modules/explorer-lego/index.js ' + tenant +' & node ./node_modules/lego-config-webpack/start.js ' + tenant);

child.stdout.on('data', function (data) {
    console.log(data);
});
child.stderr.on('data', function (data) {
    console.log(data);
});
child.on('close', function (code) {
    console.log(code);
});