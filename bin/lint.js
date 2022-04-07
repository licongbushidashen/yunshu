const shell = require('shelljs');

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

shell.echo('开始检查admin');
shell.exec('npm run admin-lint');
if (shell.error()) {
    shell.echo('lint fail: find error');
    shell.exit(1);
}
shell.echo('admin检查完毕');

shell.echo('开始检查portal');
shell.exec('npm run portal-lint');
if (shell.error()) {
    shell.echo('lint fail: find error');
    shell.exit(1);
}
shell.echo('portal检查完毕');

shell.echo('开始检查mobile');
shell.exec('npm run mobile-lint');
if (shell.error()) {
    shell.echo('lint fail: find error');
    shell.exit(1);
}
shell.echo('mobile检查完毕');


shell.echo('eslint check success! commit continue');

