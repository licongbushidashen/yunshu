<!--
 * @Author: Fan
 * @Date: 2020-04-19 19:33:49
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator';
import DateTime from '@cloudpivot/form/src/common/components/date-time.vue';
@Component({
  name: 'Time',
  components: {
    DateTime,
  },
})
export default class Time extends Vue {
  render(h: Function) {
    return h('date-time', {
      props: { opts: { disabled: true, placeholder: '请选择' } },
    });
  }
}
</script>