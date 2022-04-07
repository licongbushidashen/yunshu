### 目录结构

```
entries 入口项目
|——admin 后台管理
|——mobile 移动端门户
|——portal PC端门户
modules 业务模块
```
### 安装依赖

   在项目根目录执行命令安装所有依赖`npm run installs`

### 启动

1. 安装依赖，如已安装请跳过
2. 在项目根目录分别执行命令启动项目：管理后台`npm run admin`，移动端`npm run mobile`，PC 端`npm run portal`

### 编译

1. 安装依赖，如已安装请跳过
2. 在项目根目录分别执行命令启动编译：管理后台`npm run build-admin`，移动端`npm run build-mobile`，PC 端`npm run build-portal`

### 本地开发 npm 依赖包

运行：

```javascript
  npm run package
```

将在当前项目的 `modules` 目录遍历 `@cloudpivot` 目录下所有文件夹，并视为 `npm` 依赖包进行本地软链接，便于本地开发。

** 进行软链接的目录下必须建立 `package.json` 文件, 并且名称格式为：@cloudpivot/{name} **

```json
  "name": "@cloudpivot/{name}",
  "version": "1.13.0",
```
### 新增快捷脚本
* npm run clean-all
      可删除当前项目所有依赖包，注意⚠️:需先 npm i ,依赖shelljs
* npm run build-all
      可一键打包三端，输出在最外层
        
### pre-commit
    新增commit前，三端eslint校验，需安装完依赖才可执行
    
### 代码规范
     https://github.com/airbnb/javascript    
    

## 注意⚠️

### 1.Nodejs版本问题

推荐安装`Node.js 14.x LTS`版本 (Node.js 15.x 版本执行npm link有不兼容的情况出现)

### 2.本地开发运行portal,admin,mobile三端登录问题

请确保联调的后端对前端本地访问地址进行了注册, 如:

```sql
update base_security_client
set registeredRedirectUris = concat(registeredRedirectUris, ',http://localhost:9000/admin,http://localhost:9000/admin#/oauth,http://localhost:9100/oauth,http://localhost:8089/mobile/oauth') 
where clientId = 'api';
```

        
              
