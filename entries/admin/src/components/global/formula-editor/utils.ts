export interface VariableMap {
  [key: string]: string
}

/**
 * 变量嵌套的节点元素名——SPAN
 */
const formulaNodeName:string = 'SPAN';

export default {
  /**
   * 将编辑器公式内容转换为html编辑器内容
   * {code} --> <span title="code" contenteditable="false">变量名</span>
   * @param formulaContent 公式内容
   * @param variableMap 变量映射对象
   */
  formulaToContent(formulaContent: string, variableMap: VariableMap): string {
    if (!formulaContent) {
      return '';
    }

    if (!Object.keys(variableMap).length) {
      return formulaContent;
    }

    let content: string = formulaContent.replace(/(\{.+?\})/g, (code: string) => {
      const matchItem: any = variableMap[`${code}`];
      if (matchItem) {
        return `<span title="${code}" contenteditable="false">${matchItem}</span>`
      }
      return code;
    });

    if (/\[\{.*?\}\]/.test(content)) {
      // @ts-ignore
      content = content.replace(/\[\{.*?\}\]/g, (code: string) => {
        try{
          let matchArr = JSON.parse(code);
          const codes = code.replace(/"/g, "'");
          return `<span title="${codes}" contenteditable="false">${matchArr[0].name}</span>`
        } catch (e) {
          return code;
        }
      });
    }

    return content;
  },

  /**
   * 将编辑器的编辑内容转换为纯公式文本
   * <span title="code" contenteditable="false">变量名</span> --> {code}
   * @param editorContent 编辑器内容
   */
  contentToFormula(editorContent: string): string {
    if (!editorContent) {
      return '';
    }

    let formulaCtx: string = editorContent.replace(/<span\stitle="(.+?)"\scontenteditable="false">.+?<\/span>/g, '$1');

    const tmpDom = document.createElement('div');
    tmpDom.innerHTML = formulaCtx;
    formulaCtx = tmpDom.innerText;

    return formulaCtx;
  },

  /**
   * 将编辑区域光标移动到内容结束的位置
   * @param editor 编辑器节点
   */
  cursorToEnd(editor: any) {
    editor.focus();
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(editor);
      selection.collapseToEnd();
    }
    return selection;
  },

  /**
   * 检查编辑器输入是否有未转义的表达式
   * @param originContent 原始内容
   * @param returnIndex 是否返回匹配的编码的位置
   */
  pickExpression(variableMap: VariableMap, originContent: string, returnIndex?: boolean) {
    let flag: string = '';
    let index: number = -1;
    const codeMatchs = originContent.match(/\{([^{}]+?)\}/g);
    console.log(originContent, codeMatchs);
    if (Array.isArray(codeMatchs) && codeMatchs.length) {
      codeMatchs.forEach((code: string) => {
        if (code && Object.keys(variableMap).includes(code)) {
          flag = code;
          index = originContent.indexOf(code);
        }
      });
    }
    if (returnIndex) {
      return {
        code: flag,
        index
      }
    }
    return flag;
  },

  /**
   * 在编辑器内容区输入内容时自动识别包含的表达式并转换
   * @param selection 选择区
   * @param variableMap 变量字典
   */
  recognizeExpression(selection: Selection, variableMap: VariableMap) {
    let range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    const {
      nodeType,
      data,
      wholeText,
      previousSibling,
      nextSibling
    } = anchorNode as any;

    if (nodeType === Node.TEXT_NODE) {
      const nodeContent: string = wholeText || '';
      const { code, index } = this.pickExpression(variableMap, nodeContent, true) as any;

      if (code) {
        if (data.indexOf(code) > -1) {
          // 锚点节点已完整包含变量编码，直接设置range选中区域，在本节点内替换变量编码位置
          const endOffset = index + code.length;
          range.setStart(range.startContainer, index);
          range.setEnd(range.endContainer, endOffset);
        } else {
          // 锚点节点未完整包含变量编码，向相邻节点拓展直至完整包含编码
          const missingLeft: boolean = data.indexOf('{') < 0;
          const missingRight: boolean = data.indexOf('}') < 0;
          if (missingLeft && previousSibling.nodeType === Node.TEXT_NODE) {
            range.setStart(previousSibling, previousSibling.data.indexOf('{'));
          }
          if (missingRight && nextSibling.nodeType === Node.TEXT_NODE) {
            range.setEnd(nextSibling, nextSibling.data.indexOf('}'));
          }
        }

        range.deleteContents();

        // 开始转义变量并插入
        const html: string = this.formulaToContent(code, variableMap);
        this.doInsert(html, selection, range);
      }
    }
  },

  /**
   * 根据光标所在区域的前后文判断是否追加连接运算符
   * @param editorDom 编辑器dom
   * @param content 插入内容
   * @param selection 选择区
   */
  joinConnection(editorDom: Element, content: string, selection: Selection) {
    const currentNode = selection.anchorNode;
    const currentOffset = selection.anchorOffset;

    if (!currentNode || isNaN(currentOffset)) {
      return content;
    }

    let preChar: string = '';
    let nextChar: string = '';
    let preNode: any = null;
    let nextNode: any = null;

    const { childNodes } = editorDom;

    const {
      nodeType,
      textContent = '',
      previousSibling,
      nextSibling
    } = currentNode as any;

    // 当选中的是纯文本节点
    if (nodeType === Node.TEXT_NODE) {
      // console.log('is text');

      // a. 光标在文本的中间
      if (currentOffset > 0 && currentOffset < textContent.length - 1) {
        preChar = textContent.substr(currentOffset - 1, 1);
        nextChar = textContent.substr(currentOffset, 1);
      }
      // b. 光标在文本的起始位置
      else if (currentOffset === 0) {
        nextChar = textContent.substr(currentOffset, 1);
        if (previousSibling) {
          if (previousSibling.nodeType === Node.TEXT_NODE) {
            preChar = previousSibling.textContent.substr(-1, 1)
          }
          else {
            preNode = previousSibling
          }
        }
      }
      // c.光标在文本的结尾
      else if (currentOffset >= textContent.length) {
        preChar = textContent.substr(currentOffset - 1, 1);
        if (nextSibling) {
          if (nextSibling.nodeType === Node.TEXT_NODE) {
            nextChar = nextSibling.textContent.substr(0, 1);
          }
          else {
            nextNode = nextSibling
          }
        }
      }

    }
    // 当选中的是非文本节点，即元素节点
    else {
      // console.log('is node');

      preNode = currentOffset > 0 ? childNodes[currentOffset - 1] : null;
      nextNode = currentOffset < childNodes.length ? childNodes[currentOffset] : null;

      if (preNode && preNode.nodeType === Node.TEXT_NODE) {
        if (preNode.textContent) {
          preChar = preNode.textContent.substr(-1, 1);
        } else {
          preNode = preNode.previousSibling
        }
      }

      if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
        if (nextNode.textContent) {
          nextChar = nextNode.textContent.substr(0, 1);
        } else {
          nextNode = nextNode.nextSibling
        }
      }
    }

    // console.log('pre char:', preChar, 'next char:', nextChar);
    // console.log('pre node: ', preNode, 'next node:', nextNode);
    debugger
    // 4.根据前后的字符进行运算符号追加
    if (preChar && !['(', ',', '+', '='].includes(preChar) || !preChar && preNode && preNode.nodeName === formulaNodeName
    ) {
      content = '+' + content;
    }

    if (nextChar && ![')', ',', '+', '='].includes(nextChar) || !nextChar && nextNode && nextNode.nodeName === formulaNodeName
    ) {
      content += '+';
    }

    return content;
  },

  /**
   * 将已处理好的内容，插入到光标位置
   * @param content 已处理好的目标内容
   * @param selection 选择区
   * @param range 选择区域
   */
  doInsert(content: string, selection: Selection, range: Range) {
    const el = document.createElement('div');
    el.innerHTML = content;
    let frag = document.createDocumentFragment();
    let node;
    let lastNode;
    while (node = el.firstChild) {
      lastNode = frag.appendChild(node);
      this.bindVariableEvent(lastNode);
    }
    range.insertNode(frag);

    if (lastNode) {
      range = range.cloneRange();

      // 如果是函数，则定位到左括号后面
      let bracketsPosition = -1;
      if (lastNode.nodeType === Node.TEXT_NODE) {
        bracketsPosition = lastNode.textContent.indexOf('(');
      }
      if (bracketsPosition > -1) {
        range.setStart(lastNode, bracketsPosition + 1);
      } else {
        range.setStartAfter(lastNode);
      }

      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  },

  /**
   * 判断节点是否为指定id元素下的子元素
   * @param node 目标节点
   * @param parentId 父级元素ID
   */
  isChildOf(node: any, parentId: string) {
    let limitLeve:number = 5;
    while (node !== null && limitLeve) {
      if (node.id === parentId) {
        return true;
      }
      node = node.parentNode;
      limitLeve--;
    }
    return false;
  },

  /**
   * 针对变量高亮的节点做特殊的事件处理
   * @param dom 变量转换出来的DOM 节点
   */
  bindVariableEvent(dom:Element) {
    if (dom.tagName !== formulaNodeName) {
      return
    }

    dom.addEventListener('dblclick', (e:Event) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.selectNode(dom);
      }
    });

    dom.addEventListener('click', (e:Event) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        let range = selection.getRangeAt(0);
        range.selectNode(dom);
        range.setStartAfter(dom);
        range.collapse(true);
      }
    });
  }

}
