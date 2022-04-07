const PATH = require('path');
const fs = require('fs');
const {
  exec
} = require('child_process');

const rootPath = PATH.join(__dirname, '..');
const modulesPath = PATH.resolve(__dirname, '../modules');

/**
 * 获取指定目录下的子目录列表
 * @param {*} target 
 */
function getChildFolders(target) {
  return fs.readdirSync(target).filter(folder => {
    const url = PATH.join(target, folder);
    const stat = fs.statSync(url);
    return !!((stat.isDirectory() && fs.readdirSync(url).length))
  })
}

/**
 * 异步执行指令
 * @param {*} command 
 */
function execAsync(command) {

  return new Promise((resolve, reject) => {
    // 执行
    console.log('exec start:', command);

    exec(command, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        console.log('exec end:', stdout);
        resolve(stdout);
      }
    })
  });
}

/**
 * 软连接指定的npm分块包
 * @param {*} module 
 * @param {*} chunk 
 */
function linkModule(module, chunk) {
  const fullPath = PATH.join(modulesPath, module, chunk);

  const linkToGlobalCmd = `cd ${fullPath} && npm link`;

  const linkToProjectCmd = `cd ${rootPath} && npm link ${module}/${chunk}`;

  return execAsync(linkToGlobalCmd).then(() => {
    return execAsync(linkToProjectCmd)
  })
}

/**
 * npm 系列包目录
 */
const moduleSeries = getChildFolders(modulesPath)

console.log('moduleSeries:', moduleSeries)

function linkSeries(order){
  const module = moduleSeries[order];
  const moduleRoot = PATH.join(modulesPath, module);
  const folders = getChildFolders(moduleRoot);

  function execLink(index,module) {
    const chunk = folders[index];
    if (index < folders.length - 1) {
      return linkModule(module, folders[index]).then(() => {
        return execLink(++index, module)
      })
    } else {
      return linkModule(module, folders[index])
    }
  }

  if (order < moduleSeries.length - 1) {
    return execLink(0, module).then(() => {
      linkSeries(++order)
    })
  } else {
    return execLink(0, module)
  }

}

linkSeries(0)


// function link1(index) {

//   const folder = folders[index];
//   const fullPath = PATH.join(Target, folder);

//   // 定义执行指令
//   const command = 'cd ' + fullPath + ' && npm link';

//   if (index < folders.length - 1) {
//     return execAsync(command).then(() => {
//       return link1(++index);
//     });
//   } else {
//     return execAsync(command);
//   }

// }


// function link2(index) {

//   const folder = folders[index];

//   // 定义执行指令
//   const command = 'cd ' + rootPath + ' && npm link @cloudpivot/' + folder;

//   if (index < folders.length - 1) {
//     return execAsync(command).then(() => {
//       return link2(++index);
//     });
//   } else {
//     return execAsync(command);
//   }

// }

// link1(0).then(() => {
//   link2(0);
// });