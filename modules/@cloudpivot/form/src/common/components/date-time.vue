<!--
 * @Author: Fan
 * @Date: 2020-04-18 21:03:04
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  name: 'DateTime',
})
export default class DateTime extends Vue {
  @Prop({ default: () => {} })
  opts!: any; // 当前控件的控制器
  render(h: Function) {
    return h('a-input', { props: { ...this.opts } }, [
      h('i', {
        props: {
          type: 'user',
        },
        slot: 'suffix',
        class: ['aufontAll', 'h-icon-all-clock-circle-o'],
      }),
    ]);
  }
}
</script>