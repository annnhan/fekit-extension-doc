/**
 * Created by an.han on 14-8-10.
 */

exports.usage = "生成js文档"

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var jsdoc = path.resolve(__dirname, './node_modules/jsdoc/jsdoc.js');
var docTemplate = path.resolve(__dirname, 'tpl');

//fekit.config
var fekitConfig = null;

//运行fekit的目录
var cwd = null;

//js源文件根目录的绝对路径
var docSrcPath = null;

//生成文档的目录
var docDest = 'docs';

//js源文件根目录
var docSrc = './src';


var task = {
    init: function (options) {
        this.options = options;
        cwd = options.cwd;
        docSrcPath = path.resolve(cwd, docSrc);
        fekitConfig = JSON.parse(fs.readFileSync(path.resolve(cwd, './fekit.config')));
        fekitConfig.docs = fekitConfig.docs || [];

        if (options.dest) {
            docDest = options.dest;
        }

        this.generate();
    },

    /**
     * 命令行执行jsdoc
     * @param file js源文件的路径
     * @param full 是否是绝对路径
     */
    cmd: function (file, full) {
        var source = full ? file : path.resolve(docSrcPath, file);
        var output = function () {
            if (full) {
                return path.resolve(cwd, docDest, file.replace(/\.js$/, '').replace(docSrcPath + '/', ''));
            }
            return path.resolve(cwd, docDest, file.replace(/\.js$/, ''));
        }();

        var process = child_process.fork(jsdoc, ['-d', output, '-t', docTemplate, source], {cwd: cwd});

        console.log('[LOG] 开始生成文档:', source);

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
                    console.log('[LOG] 成功生成文档:', source, ' => ', output);
                    break;
            }
        });

        return process;
    },

    generate: function () {
        var self = this;
        var cur = 0,
            docs = fekitConfig.docs;
            len = docs.length;

        function cmd() {
            if (cur <= (len - 1) && len) {
                self.cmd(docs[cur], false).on('exit', cmd);
                ++cur;
            }
        }

        cmd();

//        fekitConfig.docs.forEach(function (file) {
//            self.cmd(file, false);
//        });
    }
}


exports.set_options = function (optimist) {
    optimist.alias('d', 'dest');
    return optimist.describe('d', '指定文档输出路径，如 fekit doc -d docs， 默认为docs');
}


exports.run = function (options) {
    task.init(options);
}
