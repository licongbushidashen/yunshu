const shell = require('shelljs');
// # 打包代码
const starttime = new Date().getTime();
const dist="./portal";
const admin_dist="./entries/admin/dist";
const portal_dist="./entries/portal/dist";
const mobile_dist="./entries/mobile/dist";

shell.echo("删除缓存");
shell.rm('-rf',admin_dist);
shell.rm('-rf',portal_dist);
shell.rm('-rf',mobile_dist);
shell.rm('-rf','./portal.zip');


const startportaltime = new Date().getTime();
shell.echo("打包portal");
shell.exec('npm run build-portal');
const endportaltime = new Date().getTime();
shell.echo("构建portal用时：" + (endportaltime-startportaltime)/1000 +"s")

const startmobiletime = new Date().getTime();
shell.echo("打包mobile");
shell.exec('npm run build-mobile');
const endmobiletime = new Date().getTime();
shell.echo("构建mobile用时：" + (endmobiletime-startmobiletime)/1000 + "s")

const startadmintime = new Date().getTime();
shell.echo("打包admin");
shell.exec('npm run build-admin');
const endadmintime = new Date().getTime();
shell.echo("构建admin用时：" + (endadmintime-startadmintime)/1000 +"s")

shell.echo("开始拷贝portal代码");
shell.cp('-R', portal_dist, dist) ;
shell.echo("开始拷贝mobile代码");
shell.cp('-R', mobile_dist, dist + "/mobile");
shell.echo("开始拷贝admin代码");
shell.cp('-R', admin_dist, dist + "/admin");
// shell.echo("开始压缩代码");
// if (shell.exec('tar -zvcf portal.zip portal').code !== 0) {
//     shell.echo('压缩失败: ...');
//     shell.exit(1);
//   }
// shell.echo("删除文件");
// shell.rm('-rf', dist);
shell.echo("完成");

const endtime = new Date().getTime();

shell.echo("打包构建总时长：" + (endtime-starttime)/1000 + "s");
