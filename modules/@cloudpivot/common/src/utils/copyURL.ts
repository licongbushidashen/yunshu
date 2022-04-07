function funcUrlDel(names) {
  if (typeof (names) == 'string') {
    names = [names];
  }

  let href:string = window.location.href as string
  for (let i = 0; i < names.length; i++) {
    let reg = new RegExp(`${names[i]}=.+(?=[&|\B])`, 'g')
    if(href.match(reg)){
      href = href.replace((href.match(reg) as any[])[0] || '', '')
    }
  }
  return href
}

//  query之前传送过来就有参数为undefined,此处只过滤下不等于query的数据。,
//  此方法只删除url上token，重新进行渲染页面
export default function copyURL(query: any, status: string) {
  const oldToken = localStorage.getItem("token");
  let urls = window.location.pathname;
  if (query.T) {
    localStorage.setItem("token", query.T);
    let url = funcUrlDel(['T', 'admin_token']);
    history.pushState({}, "", url);//修改url查询参数不重新加载页面
  } else if (!query.T && !oldToken && status === 'portal') {
    if (!(urls.indexOf("login") > -1) && !(window.location.hash.endsWith("/oauth"))) {
      let url = funcUrlDel('');
      localStorage.setItem("copy_link_url_path", url);
    }
  }
}
