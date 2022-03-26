import { createElement } from "./react";
// 1. 定义JSX
const A = createElement(
  "div",
  {
    key: "A",
  },
  [
    createElement("div", { key: "B1" }, [
      createElement("div", {key: "C1"}, []),
      createElement("div", {key: "C2"}, []),
    ]),
    createElement("div", { key: "B2" }, [
      createElement("div", {key: "C3"}, []),
      createElement("div", {key: "C4"}, []),
    ]),
    createElement("div", { key: "B3" }, [
      createElement("div", {key: "C5"}, []),
      createElement("div", {key: "C6"}, []),
    ]),
  ]
);

//2.
const TAG_ROOT = "TAG_ROOT"; // Fiber根节点
const TAG_HOST = "TAG_HOST"; // 原生DOM节点

let workInProgress; // 当前正在处理的Fiber

function workloop() {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress); // 执行完成后会返回下一个任务
  }
}

/**
 * 执行一个Fiber节点（任务），返回下一个要处理的Fiber节点
 * @param {*} workInProgress 
 * @returns 
 */
function performUnitOfWork(workInProgress) {
  beginWork(workInProgress);
  // 1. 有大儿子，把大儿子作为下一个任务
  if(workInProgress.child){ // 创建完子fiber链表后，如果有大儿子，
    return workInProgress.child; // 返回大儿子，构建大儿子的儿子们
  }
  // 2. 没大儿子，找弟弟
  // 没弟弟，找父亲的弟弟
  // 没父亲的弟弟，找父亲的父亲的弟弟
  // ...
  while(workInProgress){ // 看看有没有弟弟
    if(workInProgress.sibling){
      return workInProgress.sibling;
    }
    // 回溯。如果也没有弟弟，找叔叔，即找爸爸的弟弟， wip.reutrn.silbing
    workInProgress = workInProgress.return;
    // 如果没有父亲，就全部结束了
  }
}

/**
 * 根据当前Fiber和虚拟DOM构建Fiber树
 * @param {*} workInProgress
 */
function beginWork(workInProgress) {
  console.log("beginWork", workInProgress.key);
  const nextChildren = workInProgress.props.children;
  // 根据父Fiber和所有的儿子虚拟DoOM儿子们构建出fiber树，只有一层
  // 先让父亲把儿子一个一个生出来，然后再说孙子的事
  return reconcileChildren(workInProgress, nextChildren);
}

 
 /**
  * 根据父Fiber和子虚拟DOM数组，构建当前returnFiber的子Fiber树
  * 同时构造自己的child指针，以及子节点们的return和sibling指针
  * @param {*} returnFiber 
  * @param {*} nextChildren 
  * @returns 大儿子
  */
function reconcileChildren(returnFiber, nextChildren) {
  // if(!Array.isArray(nextChildren)) return null;
  let previousNewFiber; // 上一个Fiber儿子
  let firstChildFiber; // 当前returnFiber的大儿子
  for (let newIndex = 0; newIndex < nextChildren.length; ++newIndex) {
    let newFiber = createFiber(nextChildren[newIndex]);
    // return
    newFiber.return = returnFiber;

    // sibling
    if (!firstChildFiber) {
      firstChildFiber = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;

    // // child
    // newFiber.child = Array.isArray(newFiber.props.children)
    //   ? reconcileChildren(newFiber, newFiber.props.children)
    //   : newFiber.props.children;
  }
  returnFiber.child = firstChildFiber;
  return firstChildFiber; // 返回大儿子
}

/**
 * 由虚拟DOM节点创建Fiber节点
 * Fiber节点多了tag属性和child/sibling/return三个指针
 * @param {*} element
 * @returns
 */
function createFiber(element) {
  return {
    tag: TAG_HOST,
    type: element.type,
    key: element.key,
    props: element.props,
  };
}

const root = document.getElementById("root");

let rootFiber = {
  tag: TAG_ROOT, // Fiber的类型
  key: "ROOT", // 唯一标签
  stateNode: root, // Fiber对应的真实DOM节点
  props: {
    children: [A],
  },
};

// 开始根据虚拟DOM构建Fiber树
workInProgress = rootFiber;
workloop();
console.log(rootFiber);
