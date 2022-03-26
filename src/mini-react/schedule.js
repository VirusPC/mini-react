import { sleep } from "./helper";

const works = [
  () => {
    console.log("task1 start");
    sleep(20); 
    console.log("task1 end");
  },
  () => {
    console.log("task2 start");
    sleep(20); 
    console.log("task2 end");
  },
  () => {
    console.log("task3 start");
    sleep(20); 
    console.log("task3 end");
  },
]

requestIdleCallback(workloop);

/**
 * 
 * @param {IdleDeadline} deadline 
 */
function workloop(deadline){
  console.log(`本帧的剩余时间是(${parseInt(deadline.timeRemaining())})`);
  while(deadline.timeRemaining()>1 && works.length>0){
    performUnitOfWork();
  }
  if(works.length>0){ 
    requestIdleCallback(workloop);
  }
}

function performUnitOfWork(){
  let work = works.shift();
  work();
}

