<template>
  <div>
    删除后，分组下的应用将被移动至
    <a-select v-model="value1" style="width: 120px">
      <template v-for="(item,key) of list">
        <a-select-option :key="key" :value="item.code" v-if="item.code !== code">
          <span :title="item.name">{{ item.name }}</span>
        </a-select-option>
      </template>
    </a-select>下!
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
const AppCenterModule = namespace("Apps/AppCenter");

@Component({})
export default class AAA extends Vue {
  @Prop() list!: any;
  @Prop() code!: any;
  @AppCenterModule.State("appList") appList: any;
  value1: string = "";
  created() {
    this.value1 = this.list[0].code;
  }

  @Watch("value1", { immediate: true })
  onValueChange(v: boolean) {
    this.$emit("nativeClickHandler", v);
  }
}
</script>