
<template>
  <a-modal
    title="Tab设置"
    @cancel="onCancel"
    @ok="onOk"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
  >
    <draggable
      element="div"
      v-model="heads"
      :options="dragOptions"
      @end="onSortEnd"
      class="draggable"
    >
      <a-row 
        v-for="(item,index) in heads" 
        :key="item.key" 
        class="row" 
        type="flex"
      >

        <a-col class="col" :span="4" @pointerdown.stop>{{ 'Tab' + (index + 1) }}</a-col>

        <a-col class="col" :span="16" @pointerdown.stop>
          <a-input v-model="item.title" @pointerdown.stop />
        </a-col>

        <a-col class="col operation" :span="4">

          <span class="icons">
            <i class="aufontAll h-icon-all-drag"></i>
          </span>

          <span class="icons" @pointerdown.stop>
            <a-icon v-show="heads.length > 1" type="delete" @click="remove(index)"></a-icon>
          </span>
          
        </a-col>
      </a-row>
    </draggable>

    <div class="actions">
      <a-button icon="plus" @click="add">新增Tab</a-button>
    </div>
  </a-modal>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Model,
  Inject
} from "vue-property-decorator";

import { schema } from "@cloudpivot/form";

import Draggable from "vuedraggable";

@Component({
  name: "TabsHeadsSetting",
  components: {
    Draggable
  }
})
export default class TabsHeadsSetting extends Vue {
  @Prop({
    default: () => {}
  })
  modalData!: any;

  @Prop()
  getControl!: () => schema.FormTabs;

  heads: any[] = [];

  addKeys: string[] = [];

  number = 0;

  dragOptions = {
    animation: 150,
    ghostClass: "ghostClass"
  };

  @Watch("modalData", {
    immediate: true
  })
  onModalDataChange() {
    this.addKeys = [];
    if (this.modalData.data.value) {
      this.heads = this.modalData.data.value.map(x => Object.assign({}, x));
      
      const reg = /\d+/;
      this.number = this.modalData.data.value.map(h => {
          const result = reg.exec(h.key);
          if(!result){
            return 0;
          }
          return Number(result[0]);
        })
        .sort((a,b) => a - b)
        .pop();
    } else {
      this.heads = [];
    }
  }

  remove(index: number) {
    const key = this.heads[index].key;
    this.heads.splice(index, 1);
    const i = this.addKeys.findIndex(k => k === key);
    if (i > -1) {
      this.addKeys.splice(i, 1);
    }
  }

  add() {

    const key = 'tab' + (++this.number).toString();

    this.heads.push({
      key,
      title: key
    });
    this.addKeys.push(key);
  }

  onSortEnd(){

  }

  onCancel() {
    this.$emit("closeModal");
  }

  onOk() {
    const data: any = {
      value: this.heads
    };
    for(let h of this.heads) {
      let {title} = h
      if (/\"|\'|\‘|\“'/.test(title)) {
        console.error(title)
        this.$message.error("Tab名称不能包含:双引号和单引号")
        return
      }
    }

    const tabs = this.getControl();

    tabs.panels
      .map((panel, index) => {
        if (this.heads.some(h => h.key === panel.key)) {
          return -1;
        }
        return index;
      })
      .filter(index => index !== -1)
      .reverse()
      .forEach(index => tabs.panels.splice(index, 1));

    this.addKeys.forEach(key => {
      tabs.panels.push({
        key,
        type: schema.FormControlType.TabsPanel,
        options: {},
        controls: {} as any,
        layout: []
      });
    });

    this.$emit("backData", data);
  }
}
</script>

<style lang="less" scoped>
.row {
  margin-bottom: @base4-padding-md;
}

.col {
  display: flex;
  align-items: center;

  &.operation {
    & > .icons{
      margin-left: @base10-padding-sm;
    }

    & i {
      cursor: pointer;

      &.h-icon-all-drag{
        cursor: move;
      }

    }
  }
}

.actions {
  text-align: center;
  & > button {
    border: 0;
    box-shadow: none;
  }
}
</style>