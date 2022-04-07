<script>
import {
  closest, getOffset, getPrecedingRange,
  getRange, applyRange,
  scrollIntoView, getAtAndIndex,
} from './util';
import AtTemplate from './atTemplate.vue';
export default {
  name: 'At',
  mixins: [AtTemplate],
  props: {
    value: {
      type: String, // value not required
      default: null,
    },
    at: {
      type: String,
      default: null,
    },
    ats: {
      type: Array,
      default: () => ['@'],
    },
    suffix: {
      type: String,
      default: ' ',
    },
    loop: {
      type: Boolean,
      default: true,
    },
    allowSpaces: {
      type: Boolean,
      default: true,
    },
    tabSelect: {
      type: Boolean,
      default: false,
    },
    avoidEmail: {
      type: Boolean,
      default: true,
    },
    showUnique: {
      type: Boolean,
      default: true,
    },
    hoverSelect: {
      type: Boolean,
      default: true,
    },
    members: {
      type: Array,
      default: () => [],
    },
    nameKey: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: 100000000,
    },
    filterMatch: {
      type: Function,
      default: (name, chunk, at) => {
        // match at lower-case
        return name.toLowerCase()
          .indexOf(chunk.toLowerCase()) > -1;
      },
    },
    deleteMatch: {
      type: Function,
      default: (name, chunk, suffix) => {
        if (!suffix) return ''; 
        return chunk === name + suffix;
      },
    },
    scrollRef: {
      type: String,
      default: '',
    },
    showPanel: {
      type: Boolean,
      default: true,
    }
  },
  data () {
    return {
      // at[v-model] mode should be on only when
      // initial :value/v-model is present (not nil)
      bindsValue: this.value != null,
      customsEmbedded: false,
      hasComposition: false,
      atwho: null,
      isFirstEnter: true,
      isScrolling: false,
    };
  },
  computed: {
    atItems () {
      return this.at ? [this.at] : this.ats;
    },
    currentItem () {
      if (this.atwho) {
        return this.atwho.list[this.atwho.cur];
      }
      return '';
    },
    containerRect () {
      if (this.scrollRef) {
        return document.querySelector(this.scrollRef).getBoundingClientRect();
      }
      return document.body.getBoundingClientRect();
    },
    containerBoundingPosition () {
      return {
        right: this.containerRect.left + this.containerRect.width,
        bottom: this.containerRect.top + this.containerRect.height,
      };
    },
    style () {
      if (this.atwho) {
        const {
          list, cur, x, y,
        } = this.atwho;
        const { wrap, view } = this.$refs;
        if (wrap) {
          const offset = getOffset(wrap);
          const scrollLeft = this.scrollRef ? document.querySelector(this.scrollRef).scrollLeft : 0;
          const scrollTop = this.scrollRef ? document.querySelector(this.scrollRef).scrollTop : 0;

          let xPos = x;

          if (view) {
            const rect = view.getBoundingClientRect();
            if (x + rect.width > this.containerBoundingPosition.right) {
              xPos = this.containerBoundingPosition.right - rect.width;
            }
          }

          const left = xPos + scrollLeft + window.pageXOffset - offset.left;
          const leftMax = 170;
          const _left = Math.min(left, leftMax);
          const top = y + scrollTop + window.pageYOffset - offset.top;
          return {
            left: `${_left}px`,
            top: `${top}px`,
          };
        }
      }
      return null;
    },
  },
  watch: {
    'atwho.cur' (index) {
      if (index != null) { // cur index exists
        this.$nextTick(() => {
          this.scrollToCur();
        });
      }
    },
    members (value) {
      // console.log(value);
      // this.handleInput(true);
    },
    value (value, oldValue) {
      if (!value) {
        this.$el.querySelector('[contenteditable]').innerHTML = '';
      }
      if (this.bindsValue) {
        this.handleValueUpdate(value);
      }
    },
  },
  mounted () {
    if (this.$scopedSlots.embeddedItem) {
      this.customsEmbedded = true;
    }
    if (this.bindsValue) {
      this.handleValueUpdate(this.value);
    }
  },
  methods: {
    setScroll(){
      this.isScrolling = true;
    },
    setScrollFalse(){
      this.isScrolling = false;
    },
    itemName (v) {
      const { nameKey } = this;
      return nameKey ? v[nameKey] : v;
    },
    isCur (index) {
      return index === this.atwho.cur;
    },
    handleValueUpdate (value) {
      const el = this.$el.querySelector('[contenteditable]');
      if (value !== el.innerHTML) { // avoid range reset
        this.dispatchInput();
      }
    },
    dispatchInput () {
      const el = this.$el.querySelector('[contenteditable]');
      const ev = new Event('input', { bubbles: true });
      el.dispatchEvent(ev);
    },
    handleItemHover (e) {
      if (this.hoverSelect) {
        this.selectByMouse(e);
      }
    },
    handleItemClick (e) {
      this.selectByMouse(e);
      this.$nextTick(() => {
        this.insertItem();
        this.isScrolling = false;
        this.$nextTick(() => {
          this.$el.querySelector('[contenteditable]').innerHTML += ' '; // 确保可以全部框选
          this.setFocus();
        })
      });
      // this.$emit('selectUser')
    },
    // 此方法已跟线上最新版本保持了一致
    handleDelete (e) {
      this.closePanel();
      const range = getPrecedingRange()
      if (range) {
        // fixme: Very bad code from me
        if (this.customsEmbedded && range.endOffset >= 1) {
          let a = range.endContainer.childNodes[range.endOffset]
            || range.endContainer.childNodes[range.endOffset - 1]
          if (!a || a.nodeType === Node.TEXT_NODE && !/^\s?$/.test(a.data)) {
            return
          } else if (a.nodeType === Node.TEXT_NODE) {
            if (a.previousSibling) a = a.previousSibling
          } else {
            if (a.previousElementSibling) a = a.previousElementSibling
          }
          let ch = [].slice.call(a.childNodes)
          ch = [].reverse.call(ch)
          ch.unshift(a)
          let last
          ;[].some.call(ch, c => {
            if (c.getAttribute && c.getAttribute('data-at-embedded') != null) {
              last = c
              return true
            }
          })
          if (last) {
            e.preventDefault()
            e.stopPropagation()
            const r = getRange()
            if (r) {
              r.setStartBefore(last)
              r.deleteContents()
              applyRange(r)
              this.handleInput()
            }
          }
          return
        }
        const { atItems, members, suffix, deleteMatch, itemName } = this
        if (!suffix) return; 
        const text = range.toString()
        const { at, index } = getAtAndIndex(text, atItems)
        if (index > -1) {
          const chunk = text.slice(index + at.length)
          const has = members.some(v => {
            const name = itemName(v)
            return deleteMatch(name, chunk, suffix)
          })
          if (has) {
            e.preventDefault()
            e.stopPropagation()
            const r = getRange()
            if (r) {
              r.setStart(r.endContainer, index)
              r.deleteContents()
              applyRange(r)
              this.handleInput()
            }
          }
        }
      }
    },
    handleKeyDown (e) {
      const { atwho } = this;
      if (atwho) {
        if (e.keyCode === 38 || e.keyCode === 40) { // ↑/↓
          if (!(e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            this.selectByKeyboard(e);
          }
          this.onAtWhoViewScroll();
          return;
        }
        if (e.keyCode === 13 || (this.tabSelect && e.keyCode === 9)) { // enter or tab
          this.insertItem();
          this.$nextTick(() => { //  todo  为什么手动要手动关闭
            this.closePanel();
            this.$el.querySelector('[contenteditable]').innerHTML += ' '; // 确保可以全部框选
            this.setFocus();
          })
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.keyCode === 27) { // esc
          this.closePanel();
          return;
        }
      }
      // 为了兼容ie ie9~11 editable无input事件 只能靠keydown触发 textarea正常
      // 另 ie9 textarea的delete不触发input
      const isValid = e.keyCode >= 48 && e.keyCode <= 90 || e.keyCode === 8;
      if (isValid) {
        setTimeout(() => {
          this.handleInput();
        }, 50);
      }
      if (e.keyCode === 8) {
        this.handleDelete(e);
      }
    },
    handleKeyUp(e){ // 暂时注释
      if (e.keyCode === 13) {
        if (this.isFirstEnter) {
          const el = this.$el.querySelector('[contenteditable]');
          const html= el.innerHTML; 
          const tem = html.substr(0, html.lastIndexOf('\n')); // 去除最后一个换行
          el.innerHTML = tem ;
          this.$emit('input', el.innerHTML);
          this.setFocus(el);

          this.isFirstEnter = false;
        } 
      }
    },
    // compositionStart -> input -> compositionEnd
    handleCompositionStart () {
      this.hasComposition = true;
    },
    handleCompositionEnd () {
      this.hasComposition = false;
      this.handleInput();
    },

  filterHtml(str){
    const reg =  new RegExp('<[^>]+>','gi');  //过滤所有的html标签，不包括内容
    if(typeof str !='string'){  //不是字符串
        return str;
    }

    return str.replace(reg,'');
  },
    getHtmlLen(html){
      html = this.filterHtml(html)
      let oDiv = document.createElement('div');
      html = html.replace(/amp;/g, '');
      oDiv.innerHTML = html.replace(/[\%\^\&\*\(\$]/g, '文');
      return oDiv.innerHTML.length;
    },
    handleInput (keep) {
      if (this.hasComposition) return;
      this.$nextTick(() => {
        const el = this.$el.querySelector('[contenteditable]');
        if (el.innerHTML === '<br>') { // 有时候回删，会剩余一个<br>标签，故做处理
          el.innerHTML = '';
        }
        
        if (el.innerHTML === '\n') { // 第一个回车占2个字符，故做处理
          el.innerHTML = '';
        } 
        const len = this.getHtmlLen(el.innerText);
        if (len > this.maxlength) {
          const resultLength = el.innerHTML.length - len + this.maxlength;
          el.innerHTML = el.innerHTML.substr(0, resultLength);
          this.setFocus(el);
        }
        const tempHTML = el.innerHTML;
        this.$emit('input', tempHTML);
        const range = getPrecedingRange();
        if (range) {
          const {
            atItems, avoidEmail, allowSpaces, showUnique,
          } = this;
          let show = true;
          const text = range.toString();
          const { at, index } = getAtAndIndex(text, atItems);
          if (index < 0) show = false;
          const prev = text[index - 1];
          const chunk = text.slice(index + at.length, text.length);
          if (avoidEmail) {
            // 上一个字符不能为字母数字 避免与邮箱冲突
            // 微信则是避免 所有字母数字及半角符号
            // if (/^[a-z0-9]$/i.test(prev)) show = false;
          }
          if (!allowSpaces && /\s/.test(chunk)) {
            show = false;
          }
          // chunk以空白字符开头不匹配 避免`@ `也匹配
          if (/^\s/.test(chunk)) show = false;
          if (!show) {
            this.closePanel();
          } else {
            const { members, filterMatch, itemName } = this;
            if (!keep && chunk) { // fixme: should be consistent with AtTextarea.vue
              this.$emit('at', chunk);
            }
            // const matched = members.filter(v => {
            //   const name = itemName(v);
            //   // console.log(name, chunk, at);
            //   return filterMatch(name, chunk, at);
            // });


            const matched = this.members;

            show = false;
            if (matched.length) {
              show = true;
              if (!showUnique) {
                const item = matched[0];
                if (chunk === itemName(item)) {
                  show = false;
                }
              }
            }
            
            if (show) {
              const reg= /[<\/span> | <\/span> ]$/;
              if(el.children.length === 1 && reg.test(tempHTML.trim())) return;
              this.openPanel(matched, range, index, at);
            } else {
              this.closePanel();
            }
          }
          // if (el.innerHTML.length > this.maxlength) {
          //   // return; // todo 为什么超出2000 还能输入
          //   const r = getRange();
          //   if (r) {
          //     try {
          //       // 文字输入2000以后换行，还能输入。这里更换setStart的节点
          //       r.setStart(r.endContainer.parentNode.childNodes[0], this.maxlength);
          //       r.deleteContents();
          //       // return;
          //       applyRange(r);
          //     } catch(e){
                
          //     }
          //   }
          // }
        }
      });
    },
    onAtwhoViewBlur () {
      if (this.isScrolling) return;
      this.atwho = null;
    },
    closePanel () {
      this.atwho = null;
    },
    openPanel (list, range, offset, at) {
      // 因为有需求，有些地方不支持弹出选人框
      // 故加一个属性
      if (!this.showPanel) return;
      const fn = () => {
        try {
          const r = range.cloneRange();
          r.setStart(r.endContainer, offset + at.length); // 从@后第一位开始
          // todo: 根据窗口空间 判断向上或是向下展开
          const rect = r.getClientRects()[0];
          if (!rect) return; 
          this.atwho = {
            range,
            offset,
            list,
            x: rect.left,
            y: rect.top - 4,
            cur: 0, // todo: 尽可能记录
          };
        } catch (e) {
        }
      };
      if (this.atwho) {
        fn();
      } else { // 焦点超出了显示区域 需要提供延时以移动指针 再计算位置
        setTimeout(fn, 10);
      }
    },
    scrollToCur () {
      const curEl = this.$refs.cur[0];
      const scrollParent = curEl.parentElement.parentElement; // .atwho-view
      scrollIntoView(curEl, scrollParent);
    },

    scrollToCurByIndex(index){
      this.$nextTick(() => {
        const curEl = document.querySelector('li[data-index="'+ index +'"]');
        this.atwho.cur = index;
        const scrollParent = curEl.parentElement.parentElement; // .atwho-view
        scrollIntoView(curEl, scrollParent);
      })
    },

    selectByMouse (e) {
      const el = closest(e.target, d => {
        return d.getAttribute('data-index');
      });
      const cur = +el.getAttribute('data-index');
      this.atwho = {
        ...this.atwho,
        cur,
      };
    },
    selectByKeyboard (e) {
      const offset = e.keyCode === 38 ? -1 : 1;
      const { cur, list } = this.atwho;
      const nextCur = this.loop
        ? (cur + offset + list.length) % list.length
        : Math.max(0, Math.min(cur + offset, list.length - 1));
      this.atwho = {
        ...this.atwho,
        cur: nextCur,
      };
    },
    // todo: 抽离成库并测试
    insertText (text, r) {
      r.deleteContents();
      const node = r.endContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const cut = r.endOffset;
        node.data = node.data.slice(0, cut) +
          text + node.data.slice(cut);
        r.setEnd(node, cut + text.length);
      } else {
        const t = document.createTextNode(text);
        r.insertNode(t);
        r.setEndAfter(t);
      }
      r.collapse(false); // 参数在IE下必传
      applyRange(r);
      this.dispatchInput();
    },
    insertHtml (item, r) {
      const html = `@${item.name}`; 
      r.deleteContents();
      const node = r.endContainer;
      var newElement = document.createElement('span');
      // Seems `contentediable=false` should includes spaces,
      // otherwise, caret can't be placed well across them
      newElement.setAttribute('data-at-embedded', '');
      newElement.setAttribute('dataValue', item.id);
      newElement.setAttribute('contenteditable', false);
      newElement.appendChild(document.createTextNode(' '));
      newElement.appendChild(this.htmlToElement(html));
      // newElement.appendChild(document.createTextNode(' ')); // 改为在handleItemClick处添加一个空格 保证可以被鼠标框选

      if (node.nodeType === Node.TEXT_NODE) {
        const cut = r.endOffset;
        // const blank = document.createElement('i')
        // blank.innerHTML = '&nbsp;'
        var secondPart = node.splitText(cut);
        node.parentNode.insertBefore(newElement, secondPart);
        // node.parentNode.insertBefore(blank, secondPart);
        r.setEndBefore(secondPart);
      } else {
        const t = document.createTextNode(suffix);
        r.insertNode(newElement);
        r.setEndAfter(newElement);
        r.insertNode(t);
        r.setEndAfter(t);
      }
      r.collapse(false); // 参数在IE下必传
      applyRange(r);
    },
    insertItem () {
      const {
        range, offset, list, cur,
      } = this.atwho;
      const {
        suffix, atItems, itemName, customsEmbedded,
      } = this;
      if (!suffix) return; 
      const r = range.cloneRange();
      const text = range.toString();
      const { at, index } = getAtAndIndex(text, atItems);
      // Leading `@` is automatically dropped as `customsEmbedded=true`
      // You can fully custom the output inside the embedded slot
      const start = customsEmbedded ? index : index + at.length;
      r.setStart(r.endContainer, start);
      // hack: 连续两次 可以确保click后 focus回来 range真正生效
      applyRange(r);
      applyRange(r);
      const curItem = list[cur];
      if (customsEmbedded) {
        // `suffix` is ignored as `customsEmbedded=true` has to be
        // wrapped around by spaces
        const el = this.$el.querySelector('[contenteditable]');
        const len = this.getHtmlLen(el.innerText) + curItem.name.length + 1;
        if (len <= this.maxlength) {
          const html = this.$refs.embeddedItem.firstChild.innerHTML;
          this.insertHtml(curItem, r);
        }
        // this.insertHtml(`${html}${curItem.name}`, r)
        // this.insertHtml(`${html.substr(0, html.length -1)}<span contenteditable="false" class="at-user">@${curItem.name}</span>`, r);
      } else {
        const t = itemName(curItem) + suffix;
        this.insertText(t, r);
      }
      this.handleInput();
    },
    htmlToElement (html) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      template.innerHTML = html;
      return template.content.firstChild;
    },

    // 选人框触底
    onAtWhoViewScroll(e){
      this.$el.querySelector('[contenteditable]').focus();
      const docHeight = document.querySelector('ul.atwho-ul').clientHeight;
      const wrapHeight = document.querySelector('div.atwho-view').clientHeight;
      const scrollTop =  document.querySelector('div.atwho-view').scrollTop;
      if (docHeight - (wrapHeight + scrollTop) <= 0) {
        this.$emit('touchBottom')
      } 
    },

    scroll2Bottom(){
      this.$nextTick(() => {
        const docHeight = document.querySelector('ul.atwho-ul').clientHeight; 
        this.$nextTick(() => {
          // 通过设置当前高亮得item来控制scrollTop
          this.scrollToCurByIndex( Math.ceil(this.members.length * 0.8))
          // document.querySelector('div.atwho-view').scrollTop = docHeight * 0.55;
        })
      })
    },

  setFocus(){
       const el = this.$el.querySelector('[contenteditable]')
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        //判断光标位置，如不需要可删除
        // if(sel.anchorOffset!=0){
        //     return;
        // };
        sel.removeAllRanges();
        sel.addRange(range);

    }
 
  },
};
</script>
