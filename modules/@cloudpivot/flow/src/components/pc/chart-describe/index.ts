/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-08 12:01:51
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-09-08 12:12:48
 */
import Vue from 'vue';
import ChartDescribe from './chart-describe.vue';
// import { ChartCardOptions } from './chart-card';



export default (options: any) => {
  // console.log(options)
  const type = options.type
  // debugger
  // console.log(type)
  const line: any = options.line.ID
  const tarString = `.line-${line}`
  const target: any = document.querySelector(tarString)
  if(type === 'leave') {
    document.getElementsByClassName('main')[0].removeChild(target)
  } else {
    if(target) {
      return
    }

    const Instance: Vue = new Vue({
      destroyed: () => { main ? document.getElementsByClassName('main')[0].removeChild(Instance.$el): document.body.removeChild(Instance.$el); },
      render: (h: any) => h(ChartDescribe, {
        props: options,
        on: {
          destroy: () => Instance.$destroy()
        }
      }),
    } as any);
    const component = Instance.$mount();
    const main = document.getElementsByClassName('main')[0];
    if (main) {
      document.getElementsByClassName('main')[0].appendChild(component.$el);
    } else {
      document.body.appendChild(component.$el);
    }
  }
};
