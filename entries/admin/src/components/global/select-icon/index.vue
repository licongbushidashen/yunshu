<template>
  <a-select
    :value="icon"
    @change="onIconChange"
    :selectedIcon="true"
    :notFoundContent="notFoundContent"
    :placeholder="placeholder"
    :width="width"
    @select="onSelect"
    :dropdownClassName="'select-icon-wrap'"
  >
    <a-select-option
      :value="icon"
      v-for="(icon,index) in iconsClassName"
      :key="index"
    >
      <span class="aufontAll select-icon" :class="icon"></span>
    </a-select-option>
  </a-select>
</template>

<script lang="ts">

import { Component, Vue, Prop, Emit, Watch, Model } from 'vue-property-decorator';
import '../../../assets/icons/businessIconFont';

@Component({
  name: 'SelectIcon',
  })

export default class HeaderBar extends Vue {
  iconsClassName: string[] = [];
  icon: string = '';

  @Model('input') value!:string;

  @Prop()
  notFoundContent!: string;
  @Prop()
  placeholder!: string;
  @Prop()
  width!: string;

  beforeMount() {
    const svgdom:any = document.body.querySelector('svg#icons');
      const content = svgdom.innerHTML;
      const ids = content.replace(/<symbol.+?id="(.+?)".+?>.+?<\/symbol>/g, '$1 ');
      this.iconsClassName = ids.replace(/(^\s*)|(\s*$)/g, '').split(' ');

      // 默认使用第一个
      if (!this.icon) {
        this.icon = this.iconsClassName[0];
        
      }
  }
  created() {
    this.icon = this.value;
  }

  @Emit('select')
  onSelect(value:any, option:any) {
    return {
      value,
      option
    };
  }

  onIconChange(val:string) {
    this.icon = val;
    this.$emit('input', val);
  }

  @Watch('value')
  onChange(val: any, oldVal: any) {
    // 
    this.icon = val;
  }
}
</script>

<style lang="less" scoped >
.select-icon{
  font-size: 22px;
}
</style>

<style lang="less" >
.select-icon-wrap{
  .ant-select-dropdown-menu-item{
    float: left;
  }
}
</style>
