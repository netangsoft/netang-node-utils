const _assign = require('lodash/assign')
const { createClient } = require('redis')

// redis 设置
const redisSettings = {
    // 主机
    host: '127.0.0.1',
    // 密码
    password: '',
    // 端口
    port: 6379,
    // 缓存前缀
    prefix: '',
    // 缓存有效期
    expire: 86400,
}

// redis 实例
let _client = null
const obj = {}

/**
 * 获取缓存 key
 */
function getCacheKey(key) {
    return redisSettings.prefix + key
}

/**
 * 触发连接 client
 */
function clientConnect() {
    return new Promise(function(resolve) {
        _client.on('connect', function(err) {
            resolve(true)
        })
    })
}

/**
 * 实例化 redis
 */
async function client() {

    if (_client === null) {

        const { host, password, port } = redisSettings

        _client = createClient({
            // 主机
            host,
            // 密码
            password,
            // 端口
            port,
        })

        // _client.on('error', function(err) {
        //     console.log(11111, err)
        // })

        await clientConnect()
    }
}

/**
 * 删除单个缓存
 */
function _delete(key) {
    return new Promise(function(resolve, reject) {
        _client.del(key, function(err) {
            if (err) {
                reject(err)
                return
            }
            resolve(true)
        })
    })
}

/**
 * 退出
 */
async function quit() {
    return new Promise(function(resolve) {

        if (_client === null) {
            resolve(true)
            return
        }

        _client.quit(function() {
            _client = null
            resolve(true)
        })
    })
}

/**
 * 长连 redis 封装方法
 */
function connect(method) {
    return async function(...args) {
        try {
            await client()
            return await obj[method](...args)
        } catch (e) {
            await quit()
            await client()
        }
        return await obj[method](...args)
    }
}

/**
 * 读取缓存(带项目前缀)
 */
obj.get = async function(key, defaultValue = null) {
    return new Promise(function(resolve, reject) {
        _client.get(getCacheKey(key), function(err, value) {

            if (err) {
                reject(err)
                return
            }

            if (value === null) {
                resolve(defaultValue)
                return
            }

            resolve(JSON.parse(value.toString()))
        })
    })
}

/**
 * 写入缓存(带项目前缀)
 */
obj.set = function(key, value, expire = null) {
    return new Promise(function(resolve, reject) {

        if (expire === null) {
            expire = redisSettings.expire
        }

        key = getCacheKey(key)
        value = JSON.stringify(value)

        function callback(err) {
            if (err) {
                reject(err)
                return
            }
            resolve(true)
        }

        if (expire) {
            _client.setex(key, expire, value, callback)
        } else {
            _client.set(key, value, callback)
        }
    })
}

/**
 *
 * 删除缓存(带项目前缀)
 */
obj.delete = function(key) {
    return new Promise(function(resolve, reject) {

        if (! key) {
            resolve(false)
            return
        }

        // 获取 * 的索引位置
        const index = key.indexOf('*')

        // 如果 key 中没有 *, 则是删除单个缓存
        if (index === -1) {
            _delete(getCacheKey(key))
                .then(function() {
                    resolve(true)
                })
            return
        }

        // 如果 * 不在初始位置, 则加前缀
        if (index > 0) {
            key = getCacheKey(key)
        }

        function scanAndDelete(cursor) {

            _client.scan(cursor, 'MATCH', key, 'COUNT', 100, async function(err, res) {

                if (err) {
                    reject(err)
                    return
                }

                const [cursor, keys] = res

                // 如果找到 keys 则批量删除
                if (keys.length) {
                    try {
                        for (const k of keys) {
                            await _delete(k)
                        }
                    } catch(e) {
                        reject(e)
                        return
                    }
                }

                // 遍历结束
                if (cursor === '0') {
                    resolve(true)
                    return
                }

                scanAndDelete(cursor)
            })
        }

        scanAndDelete(0)
    })
}

/**
 * 获取缓存剩余时间(秒)(带项目前缀)
 */
obj.getTtl = async function(key) {
    return new Promise(function(resolve, reject) {
        _client.ttl(getCacheKey(key), function(err, value) {

            if (err) {
                reject(err)
                return
            }

            resolve(value > 0 ? value : 0)
        })
    })
}

module.exports = {
    client,
    quit,
    get: connect('get'),
    set: connect('set'),
    delete: connect('delete'),
    getTtl: connect('getTtl'),
    settings(params) {
        _assign(redisSettings, params)
    },
}
