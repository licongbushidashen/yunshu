
<template>
  <!-- <div ref="editor">2333</div> -->
  <textarea ref="kindeditor" name="content" style="width: 100%; height: 200px;"></textarea>
</template>
<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Inject,
  Model,
} from 'vue-property-decorator';

@Component({
  name: 'h3-editor',
  components: {},
})
export default class H3Editor extends Vue {
  @Prop({
    default: 'zh',
  })
  locale!: string;
  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Model('change')
  value!: string;

  beforeCreate() {
    const vm: any = this;
    if (!(window as any).KindEditor) {
      const s: any = document.createElement('script');
      s.type = 'text/javascript';
      s.src = '/kindeditor/kindeditor-all.js';
      if (s.addEventListener) {
        s.addEventListener(
          'load',
          function () {
            vm.loadComplete();
          },
          false
        );
      } else if (s.attachEvent) {
        s.attachEvent('onreadystatechange', function () {
          var target: any = (window as any).event.srcElement;
          if (target.readyState == 'loaded') {
            vm.loadComplete();
          }
        });
      }
      document.body.appendChild(s);
    }
  }

  editor: any = null;
  loadComplete() {
    this.loadKindEditor();
  }

  loadKindEditor() {
    const vm = this;
    const options: any = {
      readonlyMode: this.disabled,
      afterChange() {
        vm.change();
      },
      afterFocus() {
        vm.onFocus();
      },
      afterBlur() {
        vm.onBlur();
      },
      allowFileManager: true,
      uploadJson: '/api/aliyun/upload',
      items: [
        'source',
        '|',
        'undo',
        'redo',
        '|',
        'code',
        'plainpaste',
        'wordpaste',
        '|',
        'justifyleft',
        'justifycenter',
        'justifyright',
        'justifyfull',
        'insertorderedlist',
        'insertunorderedlist',
        'indent',
        'outdent',
        'subscript',
        'superscript',
        'clearhtml',
        'selectall',
        '|',
        'fullscreen',
        '/',
        'formatblock',
        'fontname',
        'fontsize',
        '|',
        'forecolor',
        'hilitecolor',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'lineheight',
        'removeformat',
        '|',
        'image',
        'table',
        'hr',
        'emoticons',
        'anchor',
        'link',
        'unlink',
        '|',
        'about',
      ],
    };
    if (!(window as any).KindEditor) {
      return;
    }
    if (!this.editor) {
      this.editor = (window as any).KindEditor.create(
        this.$refs.kindeditor,
        options
      );
    }

    if (this.value) {
      this.valOnchange(this.value);
    }
  }
  mounted() {
    this.loadKindEditor();
  }
  inputting = false;
  onFocus() {
    this.inputting = true;
  }
  onBlur() {
    this.inputting = false;
  }

  change() {
    if (this.editor) {
      const val = this.editor.html();
      this.$emit('change', val);
    }
  }

  dataWrite() {
    if (this.editor) {
      this.editor.html();
    }
  }

  @Watch('value', {
    immediate: true,
  })
  valOnchange(val, oval = '') {
    if (val === oval) return
    if (this.editor) {
      if (this.inputting) return;
      this.editor.html(val);
    }
  }
}
</script>

<style lang="less">
@import '/kindeditor/themes/default/default.css';
@import '/kindeditor/plugins/code/prettify.css';
.textarea .tox .tox-menubar {
  background-color: #f5f5f5;
}
.textarea .tox .tox-toolbar__primary {
  background-color: #f5f5f5;
}
</style>

