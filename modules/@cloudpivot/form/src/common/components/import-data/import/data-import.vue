<!--
 * @Author: your name
 * @Date: 2020-06-12 14:08:45
 * @LastEditTime: 2020-06-17 11:12:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\common\components\import-data\import\data-import.vue
--> 
<template>
  <div class="data-importing">
    <div class="data-importing__progress">
      <a-progress
        type="circle"
        :percent="percent"
        :width="128"
      ></a-progress>
      <div class="note">
        {{ $t('cloudpivot.form.runtime.biz.importing') }}
      </div>
      <img class="mask recyle" src="./img/mask.svg"/>
    </div>
    <div class="data-importing__tip">
      {{ $t('cloudpivot.form.runtime.biz.importTips4') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Progress } from '@h3/antd-vue';

import { listApi, listParams } from '@cloudpivot/api';
import AppList from '@/views/applications/application-list.vue';

@Component({
  name: 'data-importing',
  components: {
    AProgress: Progress
  }
})
export default class DataImporting extends Vue {
  @Prop({
    type: Number
  }) percent!: number;

  interval: any = null;

  mounted() {
    this.interval = setInterval(() => {
      this.getImportProgress();
    }, 5000);
    //设置定时任务5分钟;
    if(this.interval){
      setTimeout(() =>{
        clearInterval(this.interval);
        this.$message.error('连接超时');
      },300000)
    }
  }

  async getImportProgress() {
    const res = await listApi.getImportingProgress();
    if (res.errcode === 0) {
      clearInterval(this.interval);
      this.$emit('importEnd', res.data);
    }
  }

  destroyed() {
    clearInterval(this.interval);
  }
}

</script>
<style lang='less' scoped>
.data-importing{
  height: 222px;
  padding-top: 12px;
  text-align: center;
  .data-importing__progress {
    position: relative;
    margin-bottom: 8px;
    .note {
      margin-top: 16px;
      line-height: @line-height-7;
      font-size: @font-size-16;
      color: rgba(0,0,0,0.85);
    }
    img.mask {
      position: absolute;
      top: 0;
      transform: translateX(-50%);
    }
    .recyle {
      margin-left: -64px;
      transform-origin:50% 50%;
      animation:circleRoate 5s infinite linear;
    }
  }
  .data-importing__tip {
    line-height: @line-height-11;
    font-size: @font-size-14;
    color: rgba(0,0,0,0.65);
  }

}
@keyframes circleRoate{
  from{transform: rotate(0deg);}
  to{transform: rotate(360deg);}
}
</style>
