const _assign = require('lodash/assign')
const knex = require('knex')

// mysql 设置
const mysqlSettings = {
    // 主机
    host: '127.0.0.1',
    // 数据库
    database: '',
    // 账号
    username: '',
    // 密码
    password: '',
    // 端口
    port: 3306,
}

// 数据库实例
let _db = null

/**
 * 初始化数据库
 */
function database() {

    // 获取 mysql 配置
    const {
        // 主机
        host,
        // 数据库
        database,
        // 账号
        username,
        // 密码
        password,
        // 端口
        port,

    } = mysqlSettings

    // 初始化数据库
    if (_db === null) {
        _db = knex({
            client: 'mysql',
            connection: {
                host,
                database,
                user: username,
                password,
                port,
            },
            pool: {
                min: 0,
                max: 10,
            },
        })
    }

    return _db
}

// 参数设置
database.settings = function(params) {
    _assign(mysqlSettings, params)
}

module.exports = database
