
<template>
  <div>
    <template v-if="!readonly">
      <h3-textarea
        v-if="isLangText"
        v-model="val"
        :placeholder="placeholder"
        :autosize="rows"
        :maxLength="maxLength"
        :disabled="readonlyFormula"
        @change="onChange"
      ></h3-textarea>
      <div v-else :id="`${id}editors`" :class="{'disabled': readonlyFormula}">
        <h3-editor
          v-if="renderComponent"
          @change="onChange"
          v-model="val"
          :locale="locale"
          :disabled="readonlyFormula"
          :id="`${id}editor`"
        />
      </div>
    </template>

    <template v-else>
      <div v-if="isLangText" class="text">{{ val }}</div>
      <div v-else v-html="val" class="editor-html"></div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Watch,
  Prop,
} from 'vue-property-decorator';
import {
  RendererFormControl,
  RelevanceFormOptions,
  RelevanceFormSelectMode,
  TextAreaType,
} from '@cloudpivot/form/schema';

import { TextInputControl } from '@cloudpivot/form/src/common/controls/input-controls/text-input-control';
import * as typings from '@cloudpivot/form/schema';
import H3Textarea from 'h3-mobile-vue';

@Component({
  name: 'input-textarea',
  components: {
    H3Textarea: () => import('../h3-textarea.vue'),
    H3Editor: () =>
      import(/* webpackChunkName: "h3-editor" */ './h3-editor.vue'),
  },
})
export default class InputTextarea extends TextInputControl {
  // @Prop({
  // 	default: TextAreaType.LongText
  // })
  // type! :TextAreaType
  renderComponent: boolean = true;
  forceRerender() {
    // 从 DOM 中删除 组件
    this.renderComponent = false;
    let chArr: any = document.body.getElementsByClassName('ke-container');
    for (let i: number = 0; i < chArr.length; i++) {
      if (chArr[i] != null) chArr[i].parentNode.removeChild(chArr[i]);
    }

    this.$nextTick(() => {
      // 在 DOM 中添加 组件
      this.renderComponent = true;
    });
  }

  mounted() {
    typings.EventBus.$on('activeKey', ({ data: any }) => {
      this.forceRerender();
    });
  }

  onChange() {
    const val = this.val.length === 0 ? null : this.val;
    this.setValue(val);
  }
}
</script>

<style lang="less" scoped>
.text {
  white-space: pre-wrap;
  word-break: break-all;
}
.editor-html {
  line-height: normal !important;
  word-break: break-all;
  overflow: auto;
  //   line-height: unset;
}

.textarea-warp {
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 4px;

  & > textarea {
    border: none;
    box-shadow: none;
  }

  & > div {
    text-align: right;
    color: rgba(0, 0, 0, 0.25);
    bottom: 0;
    padding-right: 12px;
    user-select: none;
    font-size: 13px;

    & > .error {
      color: #f5222d;
    }
  }
}
</style>
<style lang="less">
.disabled .tox-statusbar,
.disabled .tox-edit-area__iframe,
.disabled .tox-menubar,
.disabled .tox-toolbar__primary {
  background: #f5f5f5 !important;
  cursor: not-allowed !important;
}
.disabled .tox .tox-tbtn--disabled svg {
  fill: rgba(34, 47, 62, 0.5) !important;
}
.disabled .tox-toolbar-overlord {
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
</style>