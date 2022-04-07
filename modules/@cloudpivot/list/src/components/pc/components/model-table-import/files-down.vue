<template>
  <div class="down-wrapper">
    <div class="down-header">
      <span class="down-logo">
        <!-- <img src="./authine.png" alt="" /> -->
        <slot name="logo"></slot>
      </span>
      <span class="down-title">导出任务列表</span>
    </div>
    <div class="down-body">
      <div class="down-progress">
        <div class="down-progress-inner">
          <span class="progress-text"></span>
          <span
            class="progress-count"
          >已生成数 {{ successNum }}/{{ totalNum }}</span>
        </div>
      </div>
      <div class="down-box">
        <div class="down-box-inner">
          <div class="down-box-item">
            <div class="down-box-item-box">
              <div class="list-box-wrapper">
                <a-spin :spinning="spinning">
                  <ul v-if="dataList && dataList.length > 0" class="list-box">
                    <li
                      v-for="item in dataList"
                      :key="item.id"
                      class="list-item"
                    >
                      <div class="list-item-left">
                        <p class="list-item-name" :title="item.name">
                          {{ item.fileName || '-' }}
                        </p>
                        <p class="list-item-time">
                          任务开始时间：{{ item.taskStartTime || '-' }}
                        </p>
                      </div>
                      <div class="list-item-right">
                        <div class="list-item-right-box">
                          <span
                            v-if="item.status === 4"
                            class="build-status"
                          >已生成</span>
                          <span v-else-if="item.status === 1" class="build-status">等待中</span>
                          <span v-else-if="item.status === 2" class="build-status">生成中</span>
                          <span v-else class="build-status">生成失败</span>

                          <span v-if="item.status === 4" class="build-action">
                            <span
                              class="list-item-stop"
                              @click="downFile(item)"
                            >
                              <a-icon type="download" />
                            </span>
                            <span class="list-item-delete">
                              <a-popconfirm
                                overlayClassName="down-file-pop-confirm"
                                title="确定要删除改文件么？"
                                okText="确定"
                                cancelText="取消"
                                okType="default file-pop-confirm"
                                @confirm="confirm(item)"
                              >
                                <i class="icon aufontAll h-icon-all-delete-o"></i>
                              </a-popconfirm>
                            </span>
                          </span>
                          <span v-else-if="item.status === 3" class="build-action">
                            <span class="reload-text">请重新选择数据生成</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <a-empty v-else />
                </a-spin>
              </div>
            </div>
            <div class="page-nation">
              <a-pagination
                v-model="current"
                size="small"
                :pageSizeOptions="pageSizeOptions"
                :total="total"
                showSizeChanger
                :pageSize="pageSize"
                :showTotal="total => `总共 ${total} 项`"
                @showSizeChange="onShowSizeChange"
                @change="onShowSizeChange"
              >
                <template slot="buildOptionText" slot-scope="props">
                  <span
                    v-if="props.value !== '99999'"
                  >{{ props.value }}条/页</span>
                  <span v-if="props.value === '99999'">全部</span>
                </template>
              </a-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  Icon,
  Popconfirm,
  Button,
  Pagination,
  Spin,
  Empty,
} from '@h3/antd-vue';

import { MvpModelClient } from './model-client';
const exportServices = new MvpModelClient(true);

// import { downFileByRefId } from '../../../file-service/download-service';

@Component({
  components: {
    AIcon: Icon,
    APopconfirm: Popconfirm,
    AButton: Button,
    APagination: Pagination,
    ASpin: Spin,
    AEmpty: Empty,
  },
})
export default class FileDown extends Vue {
  strokeWidth: number = 4;

  current: number = 1;

  pageSize: number = 10;

  total: number = 0;

  totalNum: number = 0;

  successNum: number = 0;

  spinning: boolean = false;

  pageSizeOptions: any = ['10', '20', '30', '40', '99999'];

  dataList: any = [];

  get appCode ():string {
    return this.$route.query.appCode as string;
  }

  created (): void {
    const params: any = {
      page: 0,
      size: this.pageSize,
    };
    this.getDataList(params);
    // const { appCode } = this.$route.query;
    this.getfileCounts();
  }

  getDataList (params) {
    this.spinning = true;
    // const { appCode } = this.$route.query;
    if (!this.appCode) {
      this.$message.warn('应用编码为空，请检查链接地址');
      return;
    }
    exportServices.exportDataList(params, this.appCode).then((res: any) => {
      this.spinning = false;
      if (res.success) {
        this.dataList = res.data;
        this.total = res.total;
      } else {
        this.dataList = [];
      }
    });
  }

  getfileCounts () {
    if (!this.appCode) {
      this.$message.warn('应用编码为空，请检查链接地址');
      return;
    }
    exportServices.getfileCount(this.appCode).then((res: any) => {
      if (res.success) {
        this.totalNum = res.data.total;
        this.successNum = res.data.successNum;
      }
    });
  }

  confirm (item: any) {
    // const { appCode } = this.$route.query;
    if (!this.appCode) {
      this.$message.warn('应用编码为空，请检查链接地址');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    exportServices.deleteFile(item.id, this.appCode).then((res: any) => {
      if (res.success) {
        that.dataList = that.dataList.filter(listItem => {
          return listItem.id !== item.id;
        });
        this.$message.success('数据删除成功', 1.5, () => {
          const params: any = {
            page: that.current - 1,
            size: that.pageSize,
          };
          that.getDataList(params);
          this.getfileCounts();
        });
      } else {
        this.$message.error('数据删除失败');
      }
    });
  }

  onShowSizeChange (current, pageSize) {
    this.pageSize = pageSize;
    const params: any = {
      page: current - 1,
      size: pageSize,
    };
    this.getDataList(params);
  }

  downFile (item: any) {
    const a = document.createElement('a');
    // let url: string = item.url;
    const url = '/api/file/download?refId=' + item.refId;
    // url = url.replace(/^http(s?):/, location.protocol);
    a.download = item.fileName;
    a.href = url;
    a.click();
    // console.log(item);
    // const {
    //   refId,
    //   fileName,
    //   // url,
    // } = item;

    // downFileByRefId(refId, fileName);
  }
}
</script>

<style scoped lang="less">
.down-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.down-body {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: #ececec;
}
.down-header {
  box-shadow: 0 1px 0 0 rgba(176, 176, 176, 0.5);
  width: 100%;
  background: #052535;
  padding: 0 20px;
  .down-title,
  .down-logo {
    display: inline-block;
    line-height: 64px;
    color: #fff;
  }
  .down-title {
    margin-left: 20px;
    font-size: 16px;
  }
}
.down-progress {
  background: #fff;
  box-shadow: 0 1px 0 0 rgba(183, 183, 183, 0.5);
  border-bottom: 1px solid rgba(183, 183, 183, 0.5);
  .down-progress-inner {
    margin: 0 auto;
    max-width: 1000px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    .progress-body {
      flex: 1 0 auto;
    }
    .progress-text,
    .progress-count {
      width: 120px;
      line-height: 32px;
      color: #000;
      font-weight: 500;
      font-size: 12px;
    }
    .progress-text {
      text-align: left;
    }
    .progress-count {
      text-align: center;
    }
    /deep/.ant-progress-text {
      color: #000;
    }
  }
}
.down-box {
  flex: 1 0 auto;
  position: relative;
  overflow-y: auto;
  background: #fff;
  .down-box-inner {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .down-box-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .down-box-item-box {
    flex: 1 0 auto;
    position: relative;
    overflow-y: hidden;
    width: 100%;
  }
  .page-nation {
    height: 40px;
    line-height: 40px;
    text-align: center;
    /deep/.ant-pagination {
      line-height: 36px;
    }
  }
  .item-title {
    color: rgba(0, 0, 0, 0.85);
    line-height: 32px;
    font-size: 14px;
    margin: 20px 0;
    font-weight: 500;
  }
  .list-box-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    list-style: none;
    margin: 0;
    overflow-y: auto;
    padding: 0;
  }
  .list-box {
    overflow-y: hidden;
    max-width: 1000px;
    margin: 0 auto;
    padding: 16px 0;
    .list-item {
      border-radius: 1px;
      border: 1px solid #ddd;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      padding: 10px;
    }
  }
  .list-item-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin: 0;
    line-height: 32px;
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list-item-time {
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 0;
    line-height: 20px;
  }
  .list-item-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    .list-item-right-box {
      display: flex;
    }
    .build-status {
      background: rgba(239, 239, 239, 1);
      border-radius: 16px;
      width: 74px;
      line-height: 32px;
      display: inline-block;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }
    .build-action {
      display: flex;
      width: 136px;
      justify-content: center;
    }
    .reload-text {
      line-height: 32px;
      color: rgba(0, 0, 0, 0.85);
      padding-left: 10px;
    }
    .list-item-stop,
    .list-item-delete {
      width: 32px;
      height: 32px;
      display: flex;
      border-radius: 16px;
      cursor: pointer;
      text-align: center;
      flex-direction: column;
      justify-content: center;
    }
    .list-item-stop {
      margin: 0 16px;
      background: rgba(102, 102, 102, 1);
      color: #fff;
    }
    .list-item-delete {
      background: rgba(239, 239, 239, 1);
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
<style lang="less">
.down-file-pop-confirm {
  .file-pop-confirm {
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
  }
  .ant-btn-sm:hover {
    border-color: #ddd;
    color: rgba(0, 0, 0, 0.65);
  }
  .file-pop-confirm:hover {
    border-color: #ddd;
    color: #fff;
    background: rgba(0, 0, 0, 0.65);
  }
}
</style>
