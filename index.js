/**
 * Created by an.han on 14-8-10.
 */

exports.usage = "生成js文档"

var path = require('path')
var fs = require('fs')
var child_process = require('child_process')

var jsdoc = path.resolve(__dirname,'./node_modules/jsdoc/jsdoc.js')
var cwd = null
var fekitConfig = null;
var docSources = null;

var task = {

    init: function (options) {
        this.options = options;
        cwd = options.cwd;
        fekitConfig = JSON.parse(fs.readFileSync(path.resolve(cwd, './fekit.config')));
        docSources = fekitConfig.docs || [];
    },

    cmd: function (jsPath) {
        var process = child_process.fork(jsdoc, ['--destination', 'doc', path.resolve(cwd, './src/', jsPath)], {cwd: cwd});

        process.on('error', function (err) {
            console.log(err);
        })

        process.on('exit', function (code, signal) {
            switch (code) {
                case 1:
                    console.log('[ERROR] code:' + code);
                    break;
                case 127:
                    console.log('[ERROR] can not find this command, code:' + code);
                    break;
                default:
                    console.log('[LOG] jsdoc: ' + jsPath + ' is finished. code:' + code);
                    break;
            }
        });
    },

    generate: function () {
        var self = this;
        docSources.forEach(function (jsPath) {
            self.cmd(jsPath);
        })
    }
}

exports.run = function (options) {
    task.init(options);
    task.generate();
}
