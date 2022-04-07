<template>
  <div class="data-title">
    
    <div class="text-area">
      <div
        ref="ruleHTMLRef"
        :id="contentId"
        class="ant-input"
        contenteditable="true"
        @blur="textblur"
      ></div>
    </div>
    <div class="data-title-select" @click="selectdataItem">
      <a-dropdown>
        <a class="ant-dropdown-link" href="javascript:void(0)"> 选择表单字段 </a>
        <a-menu slot="overlay">
          <a-menu-item
            v-for="item in dataItem"
            :key="item.code"
            @click="pushDataItem(item)"
          >
            <a href="javascript:;">{{ item.name }}</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator';
import { PropertyComponent } from '@h3/designer-core/property-panel';
import AppsApi from '@/apis/apps';
function textBeComeImg (text: string, fontColor:string='#1890ff', fontSize:number=16) {
    let canvas = document.createElement('canvas');
    //小于32字加1  小于60字加2  小于80字加4    小于100字加6
    let $buHeight = 0;
    if(fontSize <= 32){ $buHeight = 1.2; }
    else if(fontSize > 32 && fontSize <= 60 ){ $buHeight = 2;}
    else if(fontSize > 60 && fontSize <= 80 ){ $buHeight = 4;}
    else if(fontSize > 80 && fontSize <= 100 ){ $buHeight = 6;}
    else if(fontSize > 100 ){ $buHeight = 10;}
    //对于g j 等有时会有遮挡，这里增加一些高度
    canvas.height=fontSize + $buHeight ;
    let context:any = canvas.getContext('2d');
    // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
    context.fillStyle = fontColor;
    context.font=fontSize+"px PingFangSC-RegularPingFangSC-Regular";
    context.textBaseline = 'middle';
    context.fillText(text,0,fontSize/2)

    canvas.width = context.measureText(text).width;
    context.fillStyle = fontColor;
    context.font=fontSize+"px PingFangSC-Regular";
    context.textBaseline = 'middle';
    context.fillText(text,0,fontSize/2)
    // context.clearRect(0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');//注意这里背景透明的话，需要使用png
}
let ruleHTMLNode: any = ''

@Component({
  name: 'data-title',
})

export default class DataTitle extends Mixins(PropertyComponent) {
    @Prop() targetSchemaCode!:string
    contentId = `content${this.getGuid()}`;
    ruleHTMLNode:any = ''
    // getFocus() {
    //     this.$refs.select.focus()
    // }

    getGuid() {
        // 生成随机ID
        return `r${new Date().getTime()}d${Math.ceil(Math.random() * 1000)}`;
    }
    mounted() {
        this.$nextTick(() => {
            document.addEventListener("click", this.outFocus);
            document.addEventListener('selectionchange', this.selectHandler);
        })
         
        
        // const data = this.modalData.data;
        
    }
    destoryed() {
        document.removeEventListener("click", this.outFocus);
    }
    outFocus() {
        this.inputting = false;
    }

    reset() {
        this.contentId = `content${this.getGuid()}`;
       
        this.$nextTick(() => {
            this.ruleHTMLNode = document.getElementById(this.contentId);
            this.clean();
            this.loadData();
        })
        
    }
    
    inputting = false;

    selectdataItem() {
        this.inputting = true;
    }
    

    parseStringToNode(val) {
        let tempStr = '';
        val.forEach(res => {
            if (res.isDataItem ===1) {
                let d = this.dataItem.find( (item) => item.code === res.code);
                if (d) {
                    let dataItem = d
                    let imgID = Math.ceil(Math.random() * 1000)+dataItem.code
                    let imgSrc = textBeComeImg(dataItem.name)
                    let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${dataItem.code}'>`;
                    this.ruleHTMLNode.insertAdjacentHTML('beforeend',imgNode)
                }
            } else {
                this.ruleHTMLNode.insertAdjacentText('beforeend', res.code);
            }
        })
    }

    textblur() {
        setTimeout(() => {
            if (this.inputting) {
                return;
            }
            const backData = this.formatterRuleHTML();
            this.emitChange(backData);
        }, 200)
        
    }
    formatterRuleHTML() {
        let backData:any = [];
        for (let n of this.ruleHTMLNode.childNodes) {
            const item = {
                isDataItem: 1,
                code: ''
            }
            if (n.nodeName === 'IMG') {
                item.code = n.dataset.val;
                backData.push(item);
            } else if (n.nodeName === '#text' && !!n.textContent) {
                item.isDataItem = 0;
                item.code = n.textContent;
                backData.push(item);
            }
            
        }
        return backData
   }

    dataItem:any = []

    loadData() {
        const params = {
            schemaCode: this.schemaCode
        }
        AppsApi.getDataItemList(params).then(res => {
            if (res.errcode === 0) {
                const filterType = [10,6,8,9];
                const showSystemCode = ['creater', 'createdDeptId', 'createdTime', 'owner', 'ownerDeptId','modifier', 'modifiedTime', 'sequenceNo', 'sequenceStatus'];
                this.dataItem = res.data.filter((item:any)=> {
                    return item.published && !filterType.includes(item.propertyType);
                });
                this.dataItem = this.dataItem.filter(item => {
                    return !item.defaultProperty || showSystemCode.includes(item.code);
                })
                if (this.value && this.value.length > 0) {
                    
                    this.parseStringToNode(this.value);
                }
            }
        })
    }
    
    savedRange:any = {}

    selectHandler() {
    // 监听选定文本的变动
        let sel = window.getSelection();

        let range:any = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        if (
        !!range &&
        range.commonAncestorContainer &&
        range.commonAncestorContainer.ownerDocument.activeElement.id === this.contentId
        ) {
        this.savedRange = range;
        !this.ruleHTMLNode && (this.ruleHTMLNode=range.commonAncestorContainer)
        }
    }

    pushDataItem(selectDataItem) {
        this.inputting = true;
        if (selectDataItem) {
            let imgID = Math.ceil(Math.random() * 1000)+selectDataItem.code
            let imgSrc = textBeComeImg(selectDataItem.name)
            if (!!this.savedRange.commonAncestorContainer) {
                // let start = this.savedRange.startOffset
                // let end = this.savedRange.endOffset
                let imgNode = document.createElement('img')
                imgNode.src = imgSrc
                imgNode.id = imgID
                imgNode.dataset.val = `${selectDataItem.code}`
                this.savedRange.insertNode(imgNode)
                let endOffset = this.savedRange.endOffset
                this.savedRange.setStart(this.ruleHTMLNode,endOffset)
                this.ruleHTMLNode.focus()
            } else {
                this.ruleHTMLNode.focus()
                setTimeout(()=> {
                let imgNode = `<img src="${imgSrc}" id="${imgID}" data-val='${selectDataItem.code}'>`;
                this.ruleHTMLNode.insertAdjacentHTML('beforeend',imgNode)
                this.savedRange.setStart(this.ruleHTMLNode,this.savedRange.endOffset+1)
                this.ruleHTMLNode.focus()
                })
            }
        }
    }

    get schemaCode() {
        return this.$route.params.bizSchemaCode
    }

    clean() {
        while(this.ruleHTMLNode.hasChildNodes())
        {
            this.ruleHTMLNode.removeChild(this.ruleHTMLNode.firstChild);
        }
    }

    @Watch('value',{
        immediate: true
    })
    onValueChange(v) {
        
        this.reset();
        // this.loadData();
       
        // if (v) {
            
        // }
    }
    

}
</script>

<style lang="less" scoped>
    .data-title{
        position: relative;
        .text-area{
            .ant-input{
                height: 100px;
                overflow-y: scroll;
            }
        }
        .data-title-select{
            position: absolute;
            left: 8px;
            bottom: 6px;
            z-index: 10;
        }
    }
</style>
<style lang="less" scoped>
.ant-dropdown-menu{
    max-height: 300px;
    overflow: scroll;
}
</style>
