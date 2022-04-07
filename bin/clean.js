const shell = require('shelljs');

if (shell.find('./entries/admin', 'node_modules')) {
    shell.echo('delete the admin modules ->>>>>');
    shell.rm('-rf','./entries/admin/node_modules');
    shell.echo('admin module has been deleted.');
}

if (shell.find('./entries/portal', 'node_modules')) {
    shell.echo('delete the portal modules ->>>>>');
    shell.rm('-rf','./entries/portal/node_modules');
    shell.echo('portal module has been deleted.');
}
if (shell.find('./entries/mobile', 'node_modules')) {
    shell.echo('delete the mobile modules ->>>>>');
    shell.rm('-rf','./entries/mobile/node_modules');
    shell.echo('mobile module has been deleted.');
}
if (shell.find('./', 'node_modules')) {
    shell.rm('-rf','./node_modules');
}
shell.echo('All modules are deleted.');
