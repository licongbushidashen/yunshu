<script lang="ts">
import {Component, Vue, Prop, Watch} from "vue-property-decorator";
import HAttachment from "@cloudpivot/form/src/common/components/attachment.vue"

@Component({name: 'Attachment', components: {HAttachment}})
export default class Attachment extends Vue {
  @Prop()
  control!: any // 当前控件的控制器

  @Watch('control', {
    immediate: true,
    deep: true
  })
  controlChange(val:any) {
     this.displayTemplate = this.control.options.displayTemplate || false;
  }

  displayTemplate: boolean = false;

  render(h: Function) {
    console.log(this.control, 'control');
    return h('h-attachment', {
      props: {
        disabled: true,
        text: "点击或拖拽上传",
        displayTemplate: this.displayTemplate,
      }
    })
  }
}
</script>
