import { createElement } from "./react";
import { sleep } from "./helper";

/**
 * @typedef { import("./react").Props } Props
 * @typedef { import("./react").VirtualDOM} VirtualDOM
 *
 *
 * @typedef {object} FiberNode
 * @property {string} tag
 * @property {string} type
 * @property {string} key
 * @property {HTMLElement} stateNode
 * @property {Props} props
 * @property {FiberNode} [child]
 * @property {FiberNode} [sibling]
 * @property {FiberNode} [return]
 * @property {FiberNode} [firstEffect]
 * @property {FiberNode} [lastEffect]
 * @property {FiberNode} [nextEffect]
 * @property {string} [flags]
 */

// 1. 定义JSX
const A = createElement(
  "div",
  {
    key: "A",
  },
  [
    createElement("div", { key: "B1" }, []),
    createElement("div", { key: "B2" }, []),
  ]
  // [
  //   createElement("div", { key: "B1" }, [
  //     createElement("div", {key: "C1"}, []),
  //     createElement("div", {key: "C2"}, []),
  //   ]),
  //   createElement("div", { key: "B2" }, [
  //     createElement("div", {key: "C3"}, []),
  //     createElement("div", {key: "C4"}, []),
  //   ]),
  //   createElement("div", { key: "B3" }, [
  //     createElement("div", {key: "C5"}, []),
  //     createElement("div", {key: "C6"}, []),
  //   ]),
  // ]
);

const root = document.getElementById("root");

let rootFiber = {
  tag: TAG_ROOT, // Fiber的类型
  key: "ROOT", // 唯一标签
  stateNode: root, // Fiber对应的真实DOM节点
  props: {
    children: [A],
  },
};

//2.
const TAG_ROOT = "TAG_ROOT"; // Fiber根节点
const TAG_HOST = "TAG_HOST"; // 原生DOM节点
const PLACEMENT = "PLACEMENT"; // 原生DOM节点

/**@type {FiberNode|null} */
let workInProgress; // 当前正在处理的Fiber

/**
 *
 * @param {IdleDeadline} deadline
 */
function workloop(deadline) {
  console.log(`本帧的剩余时间是(${parseInt(deadline.timeRemaining())})`);
  while (deadline.timeRemaining() > 0 && workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
    sleep(10);
  }
  if (workInProgress) {
    requestIdleCallback(workloop);
  } else {
    console.log(rootFiber);
    // commitRoot(rootFiber);
  }
}

/**
 * commit
 * @param {FiberNode} rootFiber
 */
function commitRoot(rootFiber) {
  console.log("******commit****");
  let currentEffect = rootFiber.firstEffect;
  while (currentEffect) {
    let flags = currentEffect.flags;
    switch (flags) {
      case PLACEMENT:
        commitPlacement(currentEffect);
    }
  }
}

/**
 * 插入
 * @param {FiberNode} currentEffect
 */
function commitPlacement(currentEffect) {
  let parent = currentEffect.return.stateNode; // 父DOM节点什么时候创建的
  parent.appendChild(currentEffect.stateNode);
}

/**
 * 执行一个Fiber节点（任务），返回下一个要处理的Fiber节点
 * @param {FiberNode} workInProgress
 * @returns {FiberNode}
 */
function performUnitOfWork(workInProgress) {
  beginWork(workInProgress);
  // 1. 有大儿子，把大儿子作为下一个任务
  if (workInProgress.child) {
    // 创建完子fiber链表后，如果有大儿子，
    return workInProgress.child; // 返回大儿子，构建大儿子的儿子们
  }
  // 2. 没大儿子，找弟弟
  // 没弟弟，找父亲的弟弟
  // 没父亲的弟弟，找父亲的父亲的弟弟
  // ...
  while (workInProgress) {
    // 看看有没有弟弟
    // 没有儿子，结束
    completeUnitOfWork(workInProgress);
    // 还有弟弟，找弟弟
    if (workInProgress.sibling) {
      return workInProgress.sibling;
    }
    // 回溯。如果也没有弟弟，找叔叔，即找爸爸的弟弟， wip.reutrn.silbing
    workInProgress = workInProgress.return;
    // 如果没有父亲，就全部结束了
  }
}

/**
 * Fiber在结束的时候，要创建真实的DOM元素
 * @param {FiberNode} workInProgress
 */
function completeUnitOfWork(workInProgress) {
  console.log("completeWork", workInProgress.key);
  let stateNode; // 真实DOM
  switch (workInProgress.tag) {
    case TAG_HOST:
      stateNode = createStateNode(workInProgress);
      // let nextNode = workInProgress.child;
      // while(nextNode){
      //   stateNode.appendChild(nextNode.stateNode);
      //   nextNode = nextNode.sibling;
      // }
      // console.log(workInProgress.stateNode);
      break;
    case TAG_ROOT:
      // workInProgress.stateNode.appendChild(workInProgress.child.stateNode);
      break;
  }

  makeEffectList(workInProgress);
}

/**
 * 在完成工作的单元的时候，要判断当前的fiber节点有没有对应的DOM操作
 * EffectList是一个FiberNode单链表
 * EffectList副作用链，并不是包含所有的节点，而是包含有副作用的fiber节点
 * 对于初次渲染而言, 所有节点都要包含
 * 副作用链是一个单链表，涉及三个指针，firstEffect，nextEffect和lastEffect
 *  全局firstEffect指向链表头，全局lastEffect指向链表尾，
 *  每个effect结点还有个nextEffect指针指向下一个effect节点
 * @param {FiberNode} completeWork
 */
function makeEffectList(completeWork) {
  let returnFiber = completeWork.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = completeWork.firstEffect;
    }
    // 将completeWork的链表合并进来
    if (completeWork.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = completeWork.firstEffect;
      }
      returnFiber.lastEffect = completeWork.lastEffect;
    }
    // 将completeWork本身加进链表，放到最后
    if (completeWork.flags) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = completeWork;
      } else {
        returnFiber.firstEffect = completeWork;
      }
      returnFiber.lastEffect = completeWork;
    }
  }
}

/**
 * create dom
 * @param {FiberNode} fiber
 * @returns {HTMLElement}
 */
function createStateNode(fiber) {
  if (fiber.tag === TAG_HOST) {
    let stateNode = document.createElement(fiber.type);
    fiber.stateNode = stateNode;
  }
  return fiber.stateNode;
}

/**
 * 根据当前Fiber和虚拟DOM构建Fiber树
 * @param {FiberNode} workInProgress
 * @returns {FiberNode}
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
 * @param {FiberNode} returnFiber
 * @param {VirtualDOM} nextChildren
 * @returns {FiberNode}
 */
function reconcileChildren(returnFiber, nextChildren) {
  // if(!Array.isArray(nextChildren)) return null;
  let previousNewFiber; // 上一个Fiber儿子
  let firstChildFiber; // 当前returnFiber的大儿子
  for (let newIndex = 0; newIndex < nextChildren.length; ++newIndex) {
    let newFiber = createFiber(nextChildren[newIndex]);
    newFiber.flags = PLACEMENT; // 这是一个新节点，肯定要插入
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
 * @param {VirtualDOM} element
 * @returns {FiberNode}
 */
function createFiber(element) {
  return {
    tag: TAG_HOST,
    type: element.type,
    key: element.key,
    props: element.props,
  };
}

// 开始根据虚拟DOM构建Fiber树
workInProgress = rootFiber;
// workloop();
requestIdleCallback(workloop);
