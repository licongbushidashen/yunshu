<template>
  <a-modal
    title="表单留痕"
    v-model="visible" 
    :maskClosable="false"
    :keyboard="false"
    :width="isDetail? 640: 800"
    class="form-marking-modal-wrap"
    @ok="changeVisible(false)"
  > 
    <div class="form-marking-modal-content">
      <a-timeline class="form-marking-line" v-if="!isDetail">
        <a-timeline-item color="#32B683" v-for="table in content" :key="table.id">
          <h5 class="form-marking-infos">
            <span class="" style="margin-right: 10px;">{{ table.modifiedTime }}</span> 
            <!-- <a-divider type="vertical"></a-divider> -->
            <span class="">{{ table.creatorName }}</span> 
            <span v-if="table.departmentName"> | </span>
            <span>{{ table.departmentName }}</span>
          </h5>
          <div class="form-wrap">
            <a-table
              :pagination="false"
              :rowKey="(record, index) => index"
              :columns="activeColumns"
              :dataSource="table.list"
            >
              <span slot="Title">数据标题</span>
              <span slot="Content">数据项</span>
              <span slot="Before">变更前</span>
              <span slot="After">变更后</span>

              <template v-slot:titles="titles">
                <a @click="goForm(titles.bizObjectId)">
                  {{ titles.title }}
                </a>
              </template>

              <template v-slot:before="before">
                <div>
                  <div v-if="before.type === 6">
                    <template v-if="before.beforeValue && before.beforeValue !== 'null'">
                      <div class="attachment-wrap" v-for="(item,index) in attachmentFormate(before.beforeValue)" :key="index">
                        <!-- 名称 -->
                        <span class="name">{{ item.name }}</span>
                        <!-- 下载 -->
                        <span class="no-wrap"><a @click="onDownload(item.refId)">下载</a></span>
                        <!-- 预览 -->
                        <div class="no-wrap"><a @click="filePreview(item.refId, item)">预览</a></div>
                      </div>
                    </template>
                  </div>
                  <div v-else-if="before.type === 10">
                    {{ locationFormat(before.beforeValue) }}
                  </div>
                  <!-- 其他 -->
                  <span v-else>
                    {{ before.beforeValue }}
                  </span>
                </div>
              </template>

              <template v-slot:after="after">
                <!-- 数值 -->
                <span v-if="after.type === 2"> 
                  <span>
                    {{ after.afterValue }}
                    <a-icon v-if="isBigger(after.beforeValue, after.afterValue) === 'bigger'" type="arrow-up" class="arrow-up" />
                    <a-icon v-if="isBigger(after.beforeValue, after.afterValue) === 'smaller'" type="arrow-down" class="arrow-down" />
                  </span>
                </span>
                <div v-else-if="after.type === 10">
                  {{ locationFormat(after.afterValue) }}
                </div>
                <!-- 附件类型 -->
                <div v-else-if="after.type === 6">
                  <template v-if="after.afterValue && after.afterValue !== 'null'">
                    <div class="attachment-wrap" v-for="(item,index) in attachmentFormate(after.afterValue)" :key="index">
                      <!-- 名称 -->
                      <span class="name">{{ item.name }}</span>
                      <!-- 下载 -->
                      <span class="no-wrap"><a @click="onDownload(item.refId)">下载</a></span>
                      <!-- 预览 -->
                      <div class="no-wrap"><a @click="filePreview(item.refId, item)">预览</a></div>
                    </div>
                  </template>
                </div>
                <!-- 其他 -->
                <span v-else>
                  {{ after.afterValue }}
                </span>
              </template>
            </a-table>
          </div>
        </a-timeline-item>
      </a-timeline>

      <a-timeline class="form-marking-line" v-else>
        <a-timeline-item color="#32B683" v-for="table in content" :key="table.id">
          <h5 class="form-marking-infos">
            <span class="" style="margin-right: 10px">{{ table.modifiedTime }}</span>
            <span class="">{{ table.creatorName }}</span>
            <span v-if="table.departmentName"> | </span>
            <span>{{ table.departmentName}}</span>
          </h5>
          <div class="form-wrap">
            <a-table
              :pagination="false"
              :rowKey="(record, index) => index"
              :columns="activeColumns"
              :dataSource="table.list"
            >
              <span slot="Title">数据标题</span>
              <span slot="Content">数据项</span>
              <span slot="Before">变更前</span>
              <span slot="After">变更后</span>

              <template v-slot:before="before">
                <div>
                  <div v-if="before.type === 6">
                    <template v-if="before.beforeValue && before.beforeValue !== 'null'">
                      <div class="attachment-wrap" v-for="(item,index) in attachmentFormate(before.beforeValue)" :key="index">
                        <!-- 名称 -->
                        <span class="name">{{ item.name }}</span>
                        <!-- 下载 -->
                        <span class="no-wrap"><a @click="onDownload(item.refId)">下载</a></span>
                        <!-- 预览 -->
                        <div class="no-wrap"><a @click="filePreview(item.refId, item)">预览</a></div>
                      </div>
                    </template>
                  </div>
                  <div v-else-if="before.type === 10">
                    {{ locationFormat(before.beforeValue) }}
                  </div>
                  <!-- 其他 -->
                  <span v-else>
                    {{ before.beforeValue }}
                  </span>
                </div>
              </template>

              <template v-slot:after="after">
                <span v-if="after.type === 2">
                  <span>
                    {{ after.afterValue }}
                    <a-icon v-if="isBigger(after.beforeValue, after.afterValue) === 'bigger'" type="arrow-up" class="arrow-up" />
                    <a-icon v-if="isBigger(after.beforeValue, after.afterValue) === 'smaller'" type="arrow-down" class="arrow-down" />
                  </span>
                </span>
                <!-- 附件类型 -->
                <div v-else-if="after.type === 6">
                  <template v-if="after.afterValue && after.afterValue !== 'null'">
                    <div class="attachment-wrap" v-for="(item,index) in attachmentFormate(after.afterValue)" :key="index">
                      <!-- 名称 -->
                      <span class="name">{{ item.name }}</span>
                      <!-- 下载 -->
                      <span class="no-wrap"><a @click="onDownload(item.refId)">下载</a></span>
                      <!-- 预览 -->
                      <div class="no-wrap"><a @click="filePreview(item.refId, item)">预览</a></div>
                    </div>
                  </template>
                </div>
                <div v-else-if="after.type === 10">
                  {{ locationFormat(after.afterValue) }}
                </div>
                <!-- 其他 -->
                <span v-else>
                  {{ after.afterValue }}
                </span>
              </template>
            </a-table>
          </div>
        </a-timeline-item>
      </a-timeline>  
      
      <div class="pagin-wrap">
        <a-pagination  
          :showTotal="(total) => '共' + total + '条'"
          :current="page"
          :total="totalElements"
          @change="onPageChange"
          size="small"  />
      </div>
    </div>

    <a-modal
        v-model="previewVisible"
        :footer="null"
        width="65%"
        :maskClosable="false"
        :keyboard="false"
      >
      <img style="width: 100%" :src="viewPicList">
    </a-modal>

  </a-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import {
  Modal,
  Timeline,
  Table,
  Divider,
  Icon,
  Pagination
} from '@h3/antd-vue';
import { listApi, listParams } from '@cloudpivot/api';
import { renderer } from '@cloudpivot/form';

@Component({
  name: 'form-marking-modal',
  components: {
    AModal: Modal,
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item,
    ATable: Table,
    ADivider: Divider,
    AIcon: Icon,
    APagination: Pagination
  }
})

export default class FormMarkingModal extends Vue{
  
  visible: boolean = false

  dataSource: Array<any> = []
  
  page: number = 1

  size: number = 10

  totalElements: number = 0

  previewVisible: boolean = false;

  viewPicList: String = ''
  

  // 列表内容
  content: Array<any> = []

  @Prop({ default: false }) isDetail?: boolean; // 详情页标识，详情页不展示title列

  @Prop({ default: () => [] }) dataItemList!: any[]

  columns: Array<any> = [
    {
      // dataIndex: "title",
      slots: { title: "Title" },
      key: "Title",
      align: "left",
      // customRender: (value, row, index) => {
      //   return {
      //     children: value,
      //     attrs: { rowSpan: row.rowSpan },
      //   }
      // },
      width: 'auto',
      scopedSlots: { customRender: "titles" }
    },
    {
      dataIndex: "name",
      slots: { title: "Content" },
      scopedSlots: { customRender: "currentDataItem" },
      align: "left",
      width: 100
    },
    {
      // dataIndex: "beforeValue",
      slots: { title: "Before" },
      scopedSlots: { customRender: "before" },
      align: "left",
      width: 190
    },
    {
      // dataIndex: "afterValue",
      slots: { title: "After" },
      scopedSlots: { customRender: "after" },
      align: "left",
      width: 190
    }    
  ];

  get getBizObjectIds() {
    return this.dataItemList.reduce((stat: any, item: any) => {
      stat.push(item.id)
    return stat
  }, [])
 }

  get activeColumns() {
    if(this.isDetail) {
      return this.columns.filter(item => item.key !== 'Title')
    }
    return this.columns
  }

  // // isImage
  // isImage(fileName: string) {
  //   return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tif"].includes(fileName) :
  // }

  // 解析附件内容
  attachmentFormate(str: string) {
    const dataArray = JSON.parse(str)
    if(!Array.isArray(dataArray)) return str
    
    console.log(dataArray)

    return dataArray
    // return dataArray.map(item => {
    //   const perArr = item.split('|')
    //   return {
    //     value: perArr[0],
    //     name: perArr[1]
    //   }
    // })
  }

  // 跳转到对应表单
  async goForm(objId: string) {
    if (!objId) return;
    const { schemaCode } = this.$route.params;
    const params: listParams.FormUrlParams = {
      bizObjectId: objId,
      schemaCode,
    };
    const res = await listApi.getFormUrl(params);
    // 如果报错, 会返回一个对象
    if (typeof res === "object" && res.errcode !== 0) {
      return this.$message.error(res.errmsg as string, 3);
    }
    // 否则返回一个字符串
    else if (typeof res === "string") {
      let urlObj = new URL(location.href);
      urlObj.searchParams.set('iframeAction','detail');
      let search = urlObj.search;
      const url = `${res}&return=${location.pathname + encodeURIComponent(search)}`;
      // 非钉钉
      window.open(url);
    }
  }

  locationFormat(str) {
    if(!str) return ''
    try {
      const locationObj = JSON.parse(str)
      // 图片类型显示图片
      if(locationObj.pic && locationObj.refId)return ''
      // 地址类型显示地址
      if(locationObj.name)return locationObj.name
    } catch (error) {
      return ''
    }
  }

  // 比较数值大小
  isBigger(before, after) {
   const beforeValue = before ? parseFloat(before) : 0
   const afterValue = after ? parseFloat(after) : 0
   if (beforeValue - afterValue > 0) {
     return 'smaller'
   } else if (beforeValue - afterValue < 0) {
     return 'bigger'
   } else {
     return 'normal'
   }
  }

  //下载文件
  onDownload(file: any) {
    // if (!file || !file.refId) {
    //   return;
    // }
    // console.log(file)
    const fileObj: any = {
      refId: file
    }
    const url = renderer.UploadControl.service.getDownloadUrl(fileObj);
    console.log(url)
    window.open(url);
  }

  // isImage(name) {
  //     const idx:number = name.indexOf('.');
  //     if (idx === -1) {
  //       return
  //     }
  //     const type = name.substr(idx + 1);
  //     const imgArr = [
  //       'png','jpg','gif','jpeg'
  //     ];
  //     return imgArr.indexOf(type) !== -1 ? true : false;
  // }


  filePreview(file: any, item: any) {
    let fileObj: any = {
      refId: file,
    }
    if(item.pic) {
      // 预览图片
      const url = renderer.UploadControl.service.getDownloadUrl(fileObj)
      this.previewVisible = true
      this.viewPicList = url
    } else {
      // 预览附件
      fileObj.name = item.name  // 不传name无法预览
      const url = renderer.UploadControl.service.getPreviewUrl(fileObj)
      window.open(url)
    }
  }

  async changeVisible(view: boolean) {
    if(view) {
      await this.loadData()
      if(this.content.length === 0) {
        this.$message.info("没有表单操作记录，无法查看", 2); 
        return 
      }
    }
    this.page = 1
    this.visible = view
  }

  async loadData() {
    const params: listParams.FormMarkingListParam = {
      page: this.page,
      size: this.size
    }
    if(this.isDetail) {
      
      params.bizObjectId = 
      (this.$route.query.objectId && this.$route.query.objectId.toString())|| 
      (this.$route.query.bizObjectId && this.$route.query.bizObjectId.toString()) ||
      '' 
      const res = await listApi.getFormMarkingDetail(params)
      if(res.errcode === 0) {
        console.log('details', res.data)
        const { totalElements, content } = res.data
        this.content = content
        this.totalElements = totalElements
      }
    } else {
      params.schemaCode = this.$route.query.code.toString()
      params.bizObjectIds = this.getBizObjectIds
      const res = await listApi.getFormMarkingList(params)
      if(res.errcode === 0) {
        console.log(res.data)
        const { totalElements, content } = res.data
        this.content = content.map(item => {
          item.list.map((subItem, index) => {
            // 合并标题项目
            index === 0 ? subItem.rowSpan = item.list.length : subItem.rowSpan = 0
            subItem.title = item.title
            return subItem
          })
          return item
        })
        console.log(this.content)
        this.totalElements = totalElements
      }
    }
  }

  onPageChange(e: number) {
    this.page = e
    this.loadData() 
  }

}
</script>

<style lang="less" scoped>
.form-marking-modal-wrap {
  // .form-marking-line {
  // }
  .form-marking-modal-content {
    padding: 10px;
    min-height: 480px;
    max-height: 50vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .pagin-wrap {
    text-align: right;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .form-marking-infos {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 16px;
    .ant-divider {
      background: rgba(0, 0, 0, 0.85);
    }
  }

  .arrow-up {
    color: #DB6D6D
  }

  .arrow-down {
    color: #83B350
  }
  .attachment-wrap {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
    .name {
      display: inline-block;
      line-height: 38px;
      width: 90px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    span {
      margin-right: 10px;
    }
    .no-wrap {
      white-space: nowrap;
    }  
    .overflow {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>

<style lang="less">
.form-marking-line {
  .ant-timeline-item-last > .ant-timeline-item-tail {
    display: block;
  }
  .ant-table-thead > tr > th {
    font-weight: 600;
  }
  .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
    padding: 8px;
  }

}
</style>