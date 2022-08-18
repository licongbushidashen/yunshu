'use strict';

/* 配置项
 *接口IP必须以XXX_HOST命名,
 *接口方法名必须指明GET请求还是POST请求，命名为XXX_GET或XXX_POST,
 *需要远程调取JS的地址必须以XXX_URL命名,
 *其他自定义配置参数避免以上的命名冲突
 */
var wyml={
    wyml:{
        ID:'ba59c997-fa3a-40fe-b9cf-208d9dbeabc6',
        secret:'KTWvMjUwMjIwMjIxNTMzMTYyMDE1NF',
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
    // localStorage.setItem(
    //   "token",
    //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6IjhhZTQ5Y2MxODAxM2IwODkwMTgwMTNiNDQ1ZmYwMDAxIiwidXNlcl9uYW1lIjoiMDAwODE0Iiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2NTU3MTU0OTcsImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6ImI1NzYwNjgyLWViOWEtNDgyMy05ZWU5LWMzZGUzNmMzNWM5NSIsImNsaWVudF9pZCI6ImFwaSJ9.iygx2ep7SvEx716D4f9CrkKrhXZUsoinFQVZwvbp6vZT0e7V-Ovg387NfchqMZ-8zgt1sXJjNuDnNtvzUmi69rSDdBjYhHiCwYOYbgKAD0BxmRopWbff6xaZipB7N0HZpNn3O-HLBQpfvS6sSrtNEXnoS3qjQuPArpEqKfnThLrX_Mj_v8TkuEiP1NaP8OwVmT3wjMvVol-1TacjNKIkInMsHWmNFoALH5PW8sKtxcoYvZ3PolxHileeRqGsMUBtqNBskDyykXI7wRK4DodsLBGtdByyBrUrPfaOshM_Or-ugKnKdS9RPjlm8Uyokhm1YxhAqsyTRXi18-ZNBLHt2w"
    //               );
