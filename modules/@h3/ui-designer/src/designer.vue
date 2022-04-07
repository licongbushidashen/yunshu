
<template>
  <h3-layout
    class="designer"
  >

    <h3-layout-sider :left="false" v-model="leftWidth">

      <component-panel>

        <template v-slot="{ item }">
          <a-icon :type="item.icon" />
          <label>{{ item.title }}</label>
        </template>

      </component-panel>

    </h3-layout-sider>

    <h3-layout-content>

      <a-button @click="back">后退</a-button>
      <a-button @click="forward">前进</a-button>

      <designer-page
        :id="root.id"
        :childIds="root.childIds"
        v-bind="pageOptions"
      ></designer-page>

    </h3-layout-content>

    <h3-layout-sider :left="true" v-model="rigthWidth">

      <property-panel v-if="active"
        :uid="active.id"
        :schema="activeSchema"
        :settings="activeSettings"
        :data="active.data"
        @change="onPropsChange"
      >
        <template v-slot:title="{ key }">
          <label>{{ $t(`designer.${active.type}.properties.${key}`) }}</label>
        </template>
      </property-panel>

    </h3-layout-sider>

  </h3-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Provide } from "vue-property-decorator";

import { Button, Icon } from "@h3/antd-vue";

import { register, uniqueId ,PropertyPanel, ComponentPanel, DesignerStore, vuexStore, DesignerNode,DesignerBackEvent,DesignerForwardEvent } from '@h3/designer-core'

import page  from './assets/page'

import { factory } from "@h3/designer-core/property-panel";

import { H3Layout, H3LayoutHeader, H3LayoutContent, H3LayoutFooter, H3LayoutSider } from "./h3-components/h3-layout";

@Component({
  components: {
    AButton: Button,
    AIcon: Icon,
    PropertyPanel,
    ComponentPanel,
    DesignerPage : page.component,
    H3Layout,
    H3LayoutContent,
    H3LayoutHeader,
    H3LayoutFooter,
    H3LayoutSider
  }
})
export default class Designer extends Vue {

  path = '/designer'

  pageOptions = {} as any

  leftWidth = 200;

  rigthWidth = 200;

  root : DesignerNode = {} as any

  store !: DesignerStore

  id = ''

  created(){
    this.$store.registerModule([this.path], vuexStore);
    this.store = register.store = new DesignerStore(this.path, this.$store);

    const id = this.id = uniqueId();
    const type = 'page';
    const data = factory.build(page.schema, id, type);
    register.store.setRoot({
      id,
      type,
      data
    });
    this.root = register.store.get(this.id);
    register.store.active = this.root;
  }

  destroyed(){
    this.$store.unregisterModule(this.path);
  }

  get active(){
    if(register.store && register.store.active){
      return register.store.active;
    }
    return null;
  }

  get activeSchema(){
    if(this.active){
      return register.assets[this.active.type].schema
    }
    return null;
  }

  get activeSettings(){
    if(this.active){
      return register.assets[this.active.type].settings
    }
    return null;
  }

  backSteps = 0;

  back(){
    this.backSteps--;
    this.store.getApp().apply(new DesignerBackEvent(1));

    this.root = this.store.get(this.id);
    this.store.active = this.root;
  }

  forward(){
    if(this.backSteps === 0){
      return;
    }
    this.backSteps++;
    this.store.getApp().apply(new DesignerForwardEvent(1));

    this.root = this.store.get(this.id);
    this.store.active = this.root;
  }

  onPropsChange(){
    if(this.active && this.active.type === 'page'){
      // this.pageOptions = this.active.getRuntimeData();
      // this.pageOptions = this.active.runtimeData;
      console.log('aaa',this.pageOptions);
    }
  }

}
</script>

<style lang="less" scoped>
/deep/.h3-layout-content{
  border:1px solid #000;
}
</style>
