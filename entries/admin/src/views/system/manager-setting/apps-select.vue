<template>
  <div class="apps-select">
    <a-tree-select
      :treeData="treeData"
      :maxTagCount="5"
      :style="`width:${ customWidth }`"
      style="top:5px"
      dropdownClassName="orgsync-form-tree-select"
      v-model="selectedCode"
      @change="onChange"
      :getPopupContainer="getPopupContainer"
      :replaceFields="replaceFields"
      placeholder="请选择"
      :treeCheckable="true"
      treeNodeFilterProp="title"
      class="orgsync-form-item"
    ></a-tree-select>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from "vue-property-decorator";

import appsApi from "@/apis/apps";

@Component({
  name: "apps-select",
  components: {},
})
export default class AppsSelect extends Vue {
  @Model("change") selectData!: Array<string>;
  @Prop({ default: '292px'}) customWidth: any

  list: any[] = [];

  value: Array<string> = [];

  treeData: any[] = [];

  selectedCode: any = [];
  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }
  getTreeData() {
    this.treeData = [];
    const params: any = {
      fromRecycle: false,
    };
    appsApi
      .getAppgroupList(params)
      .then((res: any) => {
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.treeData = res.data.filter((d: any) => {
          if (d.children && d.children.length && d.code !== 'all') {
            return d;
          }
        });
      })
      .catch((e: any) => {
        console.log(e);
      });
  }
  created() {
    this.getTreeData();
  }
  replaceFields: any = {
    children: "children",
    title: "name",
    key: "id",
    value: "code",
  };
  filterOption(inputVal: string, option: any) {
    return option.componentOptions.children[0].text.indexOf(inputVal) >= 0;
  }

  /**
   * 选择后处理数据，返回后台
   */
  onChange(val: any) {
    const toEmit: any = [];
    this.treeData.forEach((v) => {
      if (v.children) {
        val.forEach((vv) => {
          v.children.forEach((child) => {
            if (child.code === vv) {
              toEmit.push({
                code: vv,
                name: child.name,
              });
            }
          });
        });
      }
    });

    this.$emit("change", toEmit);
  }
  @Watch("selectData", {
    immediate: true
  })
  onSelectDataChange() {
    // this.value = this.selectData.map((res: any) => res.code);
    this.selectedCode = this.selectData.map((res: any) => res.code);
  }
}
</script>
<style lang="less" scoped>
.apps-select {
  &__item {
    width: 100%;
  }
}
</style>

<style lang="less"></style>
