var React = require('react');
var ReactDOMServer = require('react-dom/server');
var extend = require('react/lib/Object.assign');
var path = require('path');
var api = require('../../middleware/serviceAPI');
var fs = require('fs');
module.exports = function (input, out) {
    var asyncOut = out.beginAsync();
    var obj = extend(input, {
        isServer: input.isServer ? input.isServer : true
    });
    if (!obj.dataComponentName || !obj.dataRenderPath) {
        if (obj.dataComponentName) {
            obj.dataRenderPath = obj.dataComponentName;
        } else if (obj.dataRenderPath) {
            obj.dataComponentName = obj.dataRenderPath;
        } else {
            return asyncOut.end('Component reference data-component-name or data-render-path is required');
        }
    }
    if (!obj.dataContentModel) {
        return asyncOut.end('Component ' + obj.dataComponentName + ' has no data-content-model available');
    } else if (!obj.dataComponentUrl) {
        return asyncOut.end('Component ' + obj.dataComponentName + ' has no data-component-url available');
    }
    var renderPath = obj.dataRenderPath,
        state = {},
        hostURL = 'http://' + out.global.host + obj.dataContentModel;
    //iso = out.global.iso;
    if (obj.isServer === 'true') {
        api.getData(hostURL)
            .then(function (res) {
                state[renderPath] = res;
                state['host'] = hostURL;
                state['component_meta'] = obj;
                if (Object.keys(res).length) {
                    try {
                        var fragment,
                            component;
                        if (obj.dataEngine === 'hbs') {
                            var Handlebars = require('handlebars');
                            try {
                                component = fs.readFileSync(path.resolve(obj.dataTenantPath + '/template/index.hbs'));
                                var listOfPartials = getFiles(path.resolve(obj.dataTenantPath + '/template/'));
                                listOfPartials.map(function (item) {
                                    if (item !== 'index.hbs') {
                                        Handlebars.registerPartial('./' + item, fs.readFileSync(path.resolve(obj.dataTenantPath + '/template/' + item)).toString().trim());
                                    }
                                });
                                var compiledTpl = Handlebars.compile(component.toString());
                                fragment = compiledTpl(res);
                            } catch (hbsReadErr) {
                                console.log({err: hbsReadErr}, 'Handlebar template rendering failed from server');
                                asyncOut.end(hbsReadErr);
                            }
                        } else {
                            component = require(path.resolve(__dirname, '../../' + input.dataComponentUrl));
                            fragment = '<div id=' + renderPath + '>' + ReactDOMServer.renderToString(React.createElement(component, {
                                    data: res,
                                    contentModel: obj.dataContentModel
                                })) + '</div>';
                            //iso.add('', state, renderPath);
                        }
                        asyncOut.end(fragment);
                    } catch (reactComponentRenderErr) {
                        console.log({err: reactComponentRenderErr}, 'React Component rendering failed from server');
                        asyncOut.end(reactComponentRenderErr);
                    }
                } else {
                    return asyncOut.end('Please verify ' + obj.dataComponentName + ' component data model' + hostURL);
                }
            }, function (err) {
                console.log({err: err}, 'React Component API data fetch failed');
            });
    } else {
        state[renderPath] = '';
        state['host'] = hostURL;
        state['component_meta'] = obj;
        var fragment = '<div data-role="' + obj.dataComponentName + '" data-path="../' + obj.dataComponentDataPath + '/data/index.json' + '"></div>';
        //iso.add('', state, renderPath);
        asyncOut.end(fragment);
    }
};


function getFiles(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isFile();
    });
}