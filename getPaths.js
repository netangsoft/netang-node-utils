const fs = require('fs')
const path = require('path')
const _startsWith = require('lodash/startsWith')
const _toUpper = require('lodash/toUpper')
const _snakeCase = require('lodash/snakeCase')
const ROOT_PATH = require('./_rootPath')

/**
 * 【node】获取所有根目录的路径
 */
function getRootPaths() {
    const paths = {
        ROOT_PATH,
    }
    const files = fs.readdirSync(ROOT_PATH)
    for (let file of files) {
        if (! _startsWith(file, '.')) {
            const fileKey = _toUpper(_snakeCase(file)) + '_PATH'
            paths[fileKey] = path.join(ROOT_PATH, file)
        }
    }
    return paths
}

module.exports = getRootPaths
