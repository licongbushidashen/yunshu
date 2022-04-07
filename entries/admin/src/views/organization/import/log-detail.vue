<template>
  <div class="log-detail">
    <a-drawer
      title="详情"
      placement="right"
      :closable="true"
      width="850"
      @close="onClose"
      wrapClassName="log-detail-drawer"
      :visible="showLogDetailVisible"
    >
      <div class="log-detail-container">
        <div class="block">
          <div class="title">详细信息</div>
          <ul class="list">
            <li class="item">
              <div class="key">执行状态</div>
              <div class="value">
                {{ executeStatus[detailData.executeStatus] }}
              </div>
            </li>
            <li class="item"></li>
            <li class="item">
              <div class="key">开始时间</div>
              <div class="value">{{ detailData.startTime }}</div>
            </li>
            <li class="item">
              <div class="key">结束时间</div>
              <div class="value">{{ detailData.endTime }}</div>
            </li>
            <li class="item">
              <div class="key">用户姓名</div>
              <div class="value">{{ detailData.createrName }}</div>
            </li>
            <li class="item">
              <div class="key">用户账号</div>
              <div class="value">{{ detailData.createrUserName }}</div>
            </li>
            <li class="item">
              <div class="key">修复状态</div>
              <div
                class="value"
                :style="detailData && detailData.fixedStatus === 0 ? 'color:red' : ''"
              >
                {{ fixedStatus[detailData.fixedStatus] }}
              </div>
            </li>
            <li class="item">
              <div class="key">修复次数</div>
              <div class="value">{{ detailData.fixedCount }}</div>
            </li>
          </ul>
        </div>

        <div class="block">
          <div class="title">异常信息</div>
          <div class="content clearfix">
            <div class="key">异常信息详情</div>
            <div class="value">
              <template v-if="detailData.detail">
                {{ detailData.detail }}
              </template>
              <template v-else
                ><span class="no-detail" v-if="detailData.executeStatus === 1"
                  >暂无异常信息</span
                ><span class="no-detail" v-else>暂无内容</span></template
              >
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <div class="button">
          <a-button @click="onClose">取消</a-button>
          <a-button
            v-if="
              detailData.fixedStatus === 0 && detailData.executeStatus === 2
            "
            type="primary"
            @click="repair"
            >修复</a-button
          >
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Model } from "vue-property-decorator";

import { State, namespace } from "vuex-class";

import OrgApi from "@/apis/organization";

@Component({
  name: "LogDetail",
})
export default class LogDetail extends Vue {
  detailData: any = {};
  showLogDetailVisible: boolean = false;
  executeStatus = {
    1: "成功",
    2: "失败",
  };

  fixedStatus = {
    0: "未修复",
    1: "已修复",
  };

  @Prop() id!: string;
  @Model("change") value!: boolean;

  @Watch("value")
  onChangeValue(v: boolean) {
    this.showLogDetailVisible = v;

    if (v) {
      this.detailData = {};
    }

    if (!v) return;

    this.getLogDetail();
  }

  async getLogDetail() {
    const res: any = await OrgApi.getLogDetail({
      id: this.id,
    });

    if (res.errcode === 0) {
      // res.data['executeStatus'] = res.data.executeStatus === 1 ? 'SUCCESS' : 'FAIL';
      this.detailData = res.data;
    } else {
      this.$message.error(res.errmsg);
    }
  }

  async repair() {
    const res: any = await OrgApi.repairLog({
      id: this.id,
    });

    if (res.errcode === 0) {
      this.$message.success(res.errmsg);
      this.$emit("change", false);
    } else {
      this.$message.error(res.errmsg);
    }
  }

  onClose() {
    this.$emit("change", false);
  }
}
</script>

<style lang="less">
.log-detail-drawer {
  .ant-drawer-body {
    padding: 0;
  }

  .ant-drawer-wrapper-body {
    height: calc(100% - 52px) !important;
  }
}
</style>
<style lang="less" scoped>
.log-detail-container {
  padding: 24px 24px 53px 24px;

  .block {
    margin-bottom: 24px;

    .title {
      font-size: 14px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }

    .list {
      padding-bottom: 24px;
      border-bottom: 1px solid #e8e8e8;

      .item {
        display: inline-block;

        margin-top: 16px;
        width: 50%;

        line-height: 22px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 1);

        .key,
        .value {
          display: inline-block;
        }

        .value {
          margin-left: 40px;
        }
      }
    }

    .content {
      margin-top: 16px;
      line-height: 22px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 1);

      .key {
        float: left;

        width: 100px;
      }

      .value {
        margin-left: 120px;
      }

      .no-detail {
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
}

.button-group {
  position: absolute;
  left: 0;
  bottom: 0;

  width: 100%;
  height: 52px;

  border-top: 1px solid #e8e8e8;

  background: #fff;

  .button {
    display: flex;

    width: 100%;
    height: 100%;

    align-items: center;
    justify-content: center;

    .ant-btn {
      margin: 0 5px;
    }
  }
}
</style>
