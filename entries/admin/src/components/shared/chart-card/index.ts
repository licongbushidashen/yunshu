import Vue from 'vue';
import ChartCard from './chart-card.vue';
import { ChartCardOptions } from './chart-card';

export default (options: ChartCardOptions,fn?: any) => {
  const Instance: Vue = new Vue({
    destroyed: () => document.body.removeChild(Instance.$el),
    render: (h: any) => h(ChartCard, {
      props: Object.assign({},options,{fn}),
      on: {
        destroy: () => Instance.$destroy()
      }
    }),
  } as any)
  const component = Instance.$mount();
  document.body.appendChild(component.$el);
};
