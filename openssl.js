const crypto = require('crypto')
const _assign = require('lodash/assign')

// 设置
const opensslSettings = {
    publicKey: '',
}

/**
 * 公钥加密
 */
function publicEncrypt(value) {
    try {
        return crypto.publicEncrypt({
            // 密钥
            key: opensslSettings.publicKey,
            // 和 php 保持一致
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, Buffer.from(JSON.stringify(value))).toString('base64')

    } catch (e) {}
    return null
}

/**
 * 公钥解密
 */
function publicDecrypt(value) {
    try {
        return JSON.parse(crypto.publicDecrypt({
            // 密钥
            key: opensslSettings.publicKey,
            // 和 php 保持一致
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, Buffer.from(value.toString('base64'), 'base64')))

    } catch (e) {}
    return null
}

/**
 * 私钥加密(在客户端不需要)
 */
// function privateEncrypt(value) {
//     try {
//         return crypto.privateEncrypt({
//             // 密钥
//             key: privateKey,
//             // 和 php 保持一致
//             padding: crypto.constants.RSA_PKCS1_PADDING,
//         }, Buffer.from(utils.json.stringify(value))).toString('base64')
//
//     } catch (e) {
//         // 记录异常日志
//         throwLogger(e, 'private_encrypt', 'Parameter Error')
//     }
//     return null
// }

/**
 * 私钥解密(在客户端不需要)
 */
// function privateDecrypt(value) {
//     try {
//         return utils.json.parse(crypto.privateDecrypt({
//             // 密钥
//             key: privateKey,
//             // 和 php 保持一致
//             padding: crypto.constants.RSA_PKCS1_PADDING,
//         }, Buffer.from(value.toString('base64'), 'base64')))
//
//     } catch (e) {
//         // 记录异常日志
//         throwLogger(e, 'private_decrypt', 'Parameter Error')
//     }
//     return null
// }

/**
 * 设置
 */
function settings(params) {
    _assign(opensslSettings, params)
}

module.exports = {
    // 公钥加密
    publicEncrypt,
    // 公钥解密
    publicDecrypt,
    // // 私钥加密(在客户端不需要)
    // privateEncrypt,
    // // 私钥解密(在客户端不需要)
    // privateDecrypt,
    // 设置
    settings,
}
