'use strict';

/* 配置项
 *接口IP必须以XXX_HOST命名,
 *接口方法名必须指明GET请求还是POST请求，命名为XXX_GET或XXX_POST,
 *需要远程调取JS的地址必须以XXX_URL命名,
 *其他自定义配置参数避免以上的命名冲突
 */
var wyml={
    wymls:{
        ID:'913bf547-fda9-4c4d-afb6-ec58ab4e3bf4',
        secret:'S7NoMjUwMjIwMjIxNTM5NDg3NjgeiZ',
        url:'https://onekey.zhejianglab.com/maxkey',
    },
    // 领导组
    ldroleId:'督办领导组(勿删勿改)',
    // 督查督办管理员
    glyId:'督办管理员(勿删勿改)'
}


//     兼容性写法
//  同时满足script标签直接引入
//  和ES6语法下直接require引入 

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = wyml;
} else {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return wyml;
        });
    } else {
        window.wyml = wyml;
    }
}
