import {REACT_ELEMENT_TYPE} from "./ReactSymbols"
import { Component } from "./ReactBaseClasses";

// 不需要放进props里的config
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
}
export function createElement(type, config, children){
  const props = {};
  let key = null; // 默认为null，使用索引来对比

  /** key */
  if(config !== null){
    key = config.key;
  }
  /** not reserved props */ 
  for(let propName in config){
    if(!RESERVED_PROPS.hasOwnProperty(propName)){
      props[propName] = config[propName];
    }
  }

  /** insert children */
  const childrenLength = arguments.length-2;
  if(childrenLength === 1){
    props.children = children;
  } else if(childrenLength>1){
    const childrenArray = Array(childrenLength);
    for(let i=0; i<childrenLength; ++i){
      childrenArray[i] = arguments[i+2];
    }
    props.children = childrenArray
  }

  /** React.createElement 方法返回的普通对象，即虚拟DOM 
   * 虚拟DOM是跨平台的，跟平台无关。
  */
  const element = {
    $$typeof: REACT_ELEMENT_TYPE, // 标识符，表示是一个VDOM
    type,
    key,
    props
  }
  /**
 * children
 * 可能是一个元素，字符串，数字，null
 * 可能有零个儿子，一个儿子，多个儿子
 * props.children是一个ReactNode， = null|string|number|React Element
 * ReactNode表示一个可以渲染的值，包括React Element
 */
  return element;
}

const React = {
  createElement,
  Component
};

export default React;