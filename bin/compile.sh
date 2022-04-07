#!/bin/bash
current_path=$(cd `dirname $0`; pwd)
modules=(f_admin f_portal f_mobile frontEnd)
pro_path=${current_path}/..


function frontEnd_tool_check()
{
  npm --version
  [ $? -ne 0 ] && echo "npm commond is not exist" && exit 1
  #wget https://nodejs.org/dist/latest/node-v11.2.0-linux-x64.tar.gz
  #npm install -g @vue/cli
  return 0
}

function npm_install()
{
  rm -rf node_modules
  # in build module floder
  [ -d "dist" ] && rm -rf dist/
  npm config set registry http://nexus.h3yun.com:8888/repository/npm-all/
  npm install
  if [ $? -ne 0 ] ;then
    echo "$1 download needpackage fail"
    rm -rf node_modules
    npm install yorkie
    npm install
    [ $? -ne 0 ] && echo "$1 download needpackage fail again" && exit 1
  fi
  return 0
}

function npm_retry()
{
  npm run build
  if [ $? -ne 0 ] ;then
    echo "build fail again"
    exit 1
  fi
}

function npm_package()
{
  npm run package
  if [ $? -ne 0 ] ;then
    echo "npm run package failed"
    exit 1
  fi
  # npm run link2
  # if [ $? -ne 0 ] ;then
  #   echo "npm run link2 failed"
  #   exit 1
  # fi
  return 0
}

function frontEnd()
{
  #clean
  cd ${pro_path}
  npm_install frontEnd
  npm_package
  cd ${pro_path}/entries/mobile
  npm_install mobile
  npm run build
  [ $? -ne 0 ]  && echo "compile frontEnd mobile fail" && exit 1
  cd ${pro_path}/entries/portal
  npm_install portal
  npm run build
  [ $? -ne 0 ] && echo "compile frontEnd portal fail" && exit 1
  cd ${pro_path}/entries/admin
  npm_install admin
  #npm run build
  node --max_old_space_size=4096 node_modules/@vue/cli-service/bin/vue-cli-service.js  build --mode production
  [ $? -ne 0 ] && echo "compile frontEnd admin fail" && exit 1

  return 0
}

function f_mobile()
{
  #clean
  cd ${pro_path}
  npm_install frontEnd
  npm_package
  cd ${pro_path}/entries/mobile
  npm_install mobile
  # npm run package
  npm run build
  [ $? -ne 0 ]  && echo "compile frontEnd mobile fail" && exit 1
  echo "compile frontEnd mobile success"
  return 0
}

function f_portal()
{
  #clean
  cd  ${pro_path}
  npm_install frontEnd
  npm_package
  cd ${pro_path}/entries/portal
  npm_install portal
  # npm run package
  npm run build
  [ $? -ne 0 ] && echo "compile frontEnd portal fail" && exit 1
  echo "compile frontEnd portal success"
  return 0
}

function f_admin()
{
  #clean
  cd ${pro_path}
  npm_install frontEnd
  npm_package
  cd ${pro_path}/entries/admin
  npm_install admin
  # npm run package
  #npm run build
  node --max_old_space_size=4096 node_modules/@vue/cli-service/bin/vue-cli-service.js  build --mode production
  [ $? -ne 0 ] && echo "compile frontEnd admin fail" && exit 1
  echo "compile frontEnd admin success"
  return 0
}

function main()
{
  frontEnd_tool_check
  for i in "$@"
  do
    for j in "${modules[@]}"
    do
      if [ "$i" == "$j" ] ;then
        $i
        [ $? -ne 0 ] && echo "$i return value is $?" && exit 1
      fi
    done
  done
  return 0
}

main $@
exit $?

