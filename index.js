/**
 * 生成文档
 * @type {string}
 */


exports.usage = "生成文档"

var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn

var CWD = null
var command = './node_modules/.bin/jsdoc'

var fekitConfig = JSON.parse(fs.readFileSync(path.resolve(CWD, './fekit.config')))
var docSources = fekitConfig.docs


function use(args, cb) {
    if (typeof args == 'function') {
        cb = args
        args = []
    }
    var cmd = spawn(command, args, {
        cwd: CWD
    })

    var err = ''
    cmd.stderr.on('data', function (data) {
        err += data
    })

    var output = ''
    cmd.stdout.on('data', function (data) {
        output += data
    })

    cmd.on('error', function (err) {
        if (err.code == 'ENOENT') {
            return cb('[ERROR] 找不到' + command + '命令。')
        }
    })

    cmd.on('exit', function (code, signal) {
        switch (code) {
            case 1:
                cb('[ERROR] ' + err)
                break
            case 127:
                cb('[ERROR] 找不到' + command + '命令。')
                break
            default:
                cb(null, output)
                break
        }
    })
}

function jsdoc(options) {
    docSources.forEach(function (js) {
        use(['--destination', 'doc', 'src/' + jsPath])
    })
}

exports.set_options = function (optimist) {
    optimist.alias('c', 'checkout')
    optimist.describe('c', '检出指定项目的trunk，如 fekit svn -c flight')

    optimist.alias('b', 'branch')
    return optimist.describe('b', '创建新的分支，如 fekit svn -b flight:bugfix')
}

exports.run = function (options) {
    CWD = options.cwd
    use(function (err, output) {
        console.info(err || output);
    })
}