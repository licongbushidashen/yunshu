<template>
  <div class="data-title">
    <!-- data-title-textarea -->
    <div class="text-area ant-input">
      <div
        ref="ruleHTMLRef"
        :id="contentId"
        class="custom-input"
        contenteditable="true"
        @focus="textfocus"
        @blur="textblur"
        @keydown="keydown"
        @paste="paste"
      ></div>
    </div>
    <div class="data-title-select" v-if="dataItem.length">
      <a-dropdown>
        <a class="ant-dropdown-link" href="javascript:void(0)">选择表单字段</a>
        <a-menu slot="overlay">
          <template v-for="item in dataItem">
            <a-menu-item
              :key="item.code"
              @click="pushDataItem(item)"
              v-if="item.propertyType !== 11"
              :title="item.name+'['+item.code+']'"
            >
              <a href="javascript:void(0)">{{ `${item.name}[${item.code}]` }}</a>
            </a-menu-item>
          </template>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator';

// import AppsApi from '@/apis/apps';
import textBeComeImg from '@/utils/text-image';

let ruleHTMLNode: any = '';

@Component({
  name: 'data-title',
})
export default class DataTitle extends Vue {
  @Prop() targetSchemaCode!: string;

  @Prop() value!: any;
  @Prop() list!: any;
  contentId = `content${this.getGuid()}`;
  ruleHTMLNode: any = '';
  // getFocus() {
  //     this.$refs.select.focus()
  // }

  getGuid() {
    // 生成随机ID
    return `r${new Date().getTime()}d${Math.ceil(Math.random() * 1000)}`;
  }
  mounted() {
    this.$nextTick(() => {
      document.addEventListener('selectionchange', this.selectHandler);

      this.ruleHTMLNode = document.getElementById(this.contentId);
      this.loadData();
    });

    // const data = this.modalData.data;
  }
  paste(event) {
    const e = event || window.event;
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  parseStringToNode(val) {
    let tempStr = '';
    val.forEach((res) => {
      if (res.isDataItem === 1) {
        let d = this.dataItem.find((item) => item.code === res.code);
        if (d) {
          let dataItem = d;
          let imgID = Math.ceil(Math.random() * 1000) + dataItem.code;
          let imgSrc = textBeComeImg(dataItem.name);
          let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${dataItem.code}'>`;
          this.ruleHTMLNode.insertAdjacentHTML('beforeend', imgNode);
        } else {
          let dataItem = res;
          let imgID = Math.ceil(Math.random() * 1000) + dataItem.code;
          let imgSrc = textBeComeImg(dataItem.name);
          let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${dataItem.code}'>`;
          this.ruleHTMLNode.insertAdjacentHTML('beforeend', imgNode);
        }
      } else {
        this.ruleHTMLNode.insertAdjacentText('beforeend', res.code);
      }
    });
    setTimeout(() => {
      this.ruleHTMLNode.focus();
      let range = window.getSelection();//创建range
      range.selectAllChildren(this.ruleHTMLNode);//range
      range.collapseToEnd();//光标移至最后
    })
  }

  isfocue = false;
  textfocus() {
    this.isfocue = true;
  }
  keydown(event: any) {
    if (event.keyCode === 13) {
      event.cancelBubble = true;

      event.preventDefault();

      event.stopPropagation();
    }
  }
  textblur() {
    this.isfocue = false;
    const backData = this.formatterRuleHTML(this.ruleHTMLNode.childNodes);

    this.$emit('change', backData);
  }
  formatterRuleHTML(nodes: any) {
    let backData: any = [];
    for (let n of nodes) {
      const item = {
        isDataItem: 1,
        code: '',
      };
      if (n.nodeName === 'IMG') {
        item.code = n.dataset.val;
        backData.push(item);
      } else if (n.nodeName === '#text' && !!n.textContent) {
        item.isDataItem = 0;
        item.code = n.textContent;
        backData.push(item);
      } else if (n.nodeName === 'DIV') {
        let d = [];
        if (n.innerText) {
          item.isDataItem = 0;
          item.code = n.textContent;
          backData.push(item);
        }
        if (n.children.length > 0) {
          d = this.formatterRuleHTML(n.children);
        }
        backData = [...backData, ...d];
      }
    }
    return backData;
  }

  dataItem: any = [];

  loadData() {
    this.dataItem = this.list/* .filter((res) => res.published); */
    setTimeout(() => {
      if (this.value) {
        this.value.forEach(element => {
          if(element.code === "creater") element.name = "创建人";
          if(element.code === "createdTime") element.name = "创建时间";
        });
        this.parseStringToNode(this.value);
      }
    }, 500);

    // const params = {
    //     schemaCode: this.schemaCode
    // }
    // AppsApi.getDataItemList(params).then(res => {
    //     if (res.errcode === 0) {
    //         this.dataItem = res.data;
    //         if (this.value && this.value.length > 0) {
    //             console.log('created => ', this.value)
    //             this.parseStringToNode(this.value);
    //         }
    //     }
    // })
  }

  savedRange: any = {};

  selectHandler() {
    // 监听选定文本的变动
    let sel = window.getSelection();
    // console.log('3333333333', sel)
    let range: any = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (
      !!range &&
      range.commonAncestorContainer &&
      range.commonAncestorContainer.ownerDocument.activeElement.id ===
        this.contentId
    ) {
      this.savedRange = range;

      !this.ruleHTMLNode && (this.ruleHTMLNode = range.commonAncestorContainer);
    }
  }

  getPosition(element) { //获得光标
    let caretOffset = 0;
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection !== "undefined") { //谷歌、火狐
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange(); //克隆一个选区
        preCaretRange.selectNodeContents(element); //设置选区的节点内容为当前节点
        preCaretRange.setEnd(range.endContainer, range.endOffset); //重置选中区域的结束位置
        caretOffset = preCaretRange.toString().length;
      }
    } else if ((sel = doc.selection) && sel.type !== "Control") { //IE
      const textRange = sel.createRange();
      const preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  pushDataItem(selectDataItem) {
    if (selectDataItem) {
      let imgID = Math.ceil(Math.random() * 1000) + selectDataItem.code;
      let imgSrc = textBeComeImg(selectDataItem.name);
      if (!!this.savedRange.commonAncestorContainer) {
        // let start = this.savedRange.startOffset
        // let end = this.savedRange.endOffset
        let imgNode = document.createElement('img');
        imgNode.src = imgSrc;
        imgNode.id = imgID;
        imgNode.dataset.val = `${selectDataItem.code}`;
        this.savedRange.insertNode(imgNode);
        let endOffset = this.savedRange.endOffset;
        this.savedRange.setStart(this.ruleHTMLNode, endOffset);
        // this.ruleHTMLNode.focus();
        
        setTimeout(() => {
          this.ruleHTMLNode.focus();
          let range = window.getSelection();//创建range
          range.selectAllChildren(this.ruleHTMLNode);//range
          range.collapseToEnd();//光标移至最后
        })
      } else {
        // this.ruleHTMLNode.focus();
        console.log(this.ruleHTMLNode,'this.ruleHTMLNodethis.ruleHTMLNode')
        setTimeout(() => {
          let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${selectDataItem.code}'>`;
          this.ruleHTMLNode.insertAdjacentHTML('beforeend', imgNode);
          this.savedRange.setStart(
            this.ruleHTMLNode,
            this.savedRange.endOffset + 1
          );
          this.ruleHTMLNode.focus();
        });
      }
    }
  }

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  // @Watch('value', {
  //     immediate: true
  // })
  // onValueChange(v:any) {
  //     if (v) {
  //         this.parseStringToNode(this.value);
  //     }
  // }
}
</script>



<style lang="less" scoped>
.ant-dropdown-menu {
  max-height: 300px;
  overflow: scroll;
}
</style>

<style lang="less" scoped>
.data-title {
  position: relative;
  .text-area {
    height: 100%;
    min-height: 100px;
    overflow: hidden;
    .custom-input {
      &.foucus {
        overflow: hidden;
      }
      height: calc(100% - 28px);
      overflow: auto;
    }
    .ant-input {
      height: 100%;
      min-height: 98px;
      overflow-y: scroll;

      /deep/img {
        vertical-align: -2.8px;
        margin-right: 4px;
      }
    }
  }
  .data-title-select {
    position: absolute;
    left: 0;
    bottom: 0;
    // left: 8px;
    // bottom: 6px;
    z-index: 10;
    padding: 6px 11px;
    .ant-dropdown-link {
      color: @primary-color;
    }
  }
}
</style>
