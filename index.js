/**
 * Created by an.han on 14-8-10.
 */
var jsdocConfig = {
    "source": {
        "include": [],
        "exclude": [],
        "includePattern": ".+\\.js(doc)?$",
        "excludePattern": "(^|\\/|\\\\)_"
    }
}

exports.usage = "生成js文档"

var fs = require('fs');
var rd = require('rd');
var path = require('path');
var child_process = require('child_process');
var jsdoc = path.resolve(__dirname, './node_modules/jsdoc/jsdoc.js');

var fekitConfig = null; //fekit.config
var cwd = null;         //运行fekit的目录
var complete = true;    //是否全部生成文档

var docSrcPath = null;  //js源文件根目录的绝对路径
var docDest = 'docs';   //生成文档的目录
var docSrc = './src';   //js源文件根目录


var task = {
    init: function (options) {
        this.options = options;
        cwd = options.cwd;
        docSrcPath = path.resolve(cwd, docSrc);
        fekitConfig = JSON.parse(fs.readFileSync(path.resolve(cwd, './fekit.config')));

        if (options.dest) {
            docDest = options.dest;
        }
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

        var process = child_process.fork(jsdoc, ['--destination', output, source], {cwd: cwd});

        console.log('[LOG] 开始生成文档: ', source);

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
                    console.log('[LOG] 成功生成文档: ', source, ' ==> ', output);
                    break;
            }
        });

        return process;
    },

    generate: function () {
        var self = this;
        if (complete) {
            rd.each(docSrcPath, function (file, fileType, next) {
                if (fileType.isFile() && /\.js$/.test(file)) {
                    self.cmd(file, true).on('exit', next);
                }
                else {
                    next();
                }

            }, function (err) {
                if (err) {
                    throw err;
                }
            });
        }
        else {
            (fekitConfig.docs || []).forEach(function (file) {
                self.cmd(file, false);
            });
        }
    }
}


exports.set_options = function (optimist) {
    optimist.alias('d', 'dest')
    return optimist.describe('d', '指定文档输出路径，如 fekit doc -d docs， 默认为docs');
}


exports.run = function (options) {
    task.init(options);
    task.generate();
}
