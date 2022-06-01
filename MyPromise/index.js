// Promise对象有三个状态，如下所示
const PENDING = "pending";
const FUFILLED = "fullfilled";
const REJECTED = "rejected";

export default class MyPromise {
  constructor(executor) {
    // excutor是负责修改promise的状态的，resolve是成功之后的，reject是处理失败
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  // promise的状态&成功处理&失败原因
  status = PENDING;
  value = undefined;
  reason = undefined;
  // 成功回调&失败回调
  successCallback = [];
  failCallback = [];

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FUFILLED;
    this.value = value;
    while (this.successCallback.length) {
      this.successCallback.shift()();
    }
  };

  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.failCallback.length) {
      this.failCallback.shift()();
    }
  };

  then(successCallback, failCallback) {
    successCallback = successCallback||value=>value;
    failCallback = failCallback||reason=>{throw reason};
    let promise2 = new MyPromise((resolve, reject) => {
      const fufillCallback = () => {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            // 判断x的类型，普通值的话直接返回；promise的话等不是pending之后在处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      };

      const rejectCallback = () => {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            // 判断x的类型，普通值的话直接返回；promise的话等不是pending之后在处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      };
      // then方法内部就是判断状态，根据不同状态去掉用不同的方法
      // then是原型对象中的
      if (this.status === FUFILLED) {
        fufillCallback();
      } else if (this.status === REJECTED) {
        // failCallback(this.reason);
        rejectCallback();
        // this.reject(y);
      } else {
        // 正在pending的处理，将成功和失败回调存储起来
        this.successCallback.push(fufillCallback);
        this.failCallback.push(rejectCallback);
      }
    });
    return promise2;
  }

  catch(failCallback){
    return this.then(undefined, failCallback);
  }

  finally(callback){
    return this.then(value=>{
       return MyPromise.resolve(callback()).then(()=>value);
    }, reason=>{
        return MyPromise.resolve(callback()).then(()=>{throw reason});
    });
  }

  static all(array){
    const result = [];
    let remainder = array.length;
    // 1. 首先是需要返回一个promise对象
    // 2. result和每个返回的promise要一一对应
    // 3. 全部完成之后才会resolve，一旦遇到reject直接reject

    return new MyPromise((resolve, reject) =>{
        function finishPromise(ind, value){
            result[ind] = value;
            remainder--;
            if(remainder===0){
                resolve(result);
             }
        }

       for (let i = 0; i < array.length; i++) {
        const current = array[i];
        if(current instanceof MyPromise){
          current.then(value =>{
             finishPromise(i, value);
          }, reason=>{
              reject(reason);
          })
        }else{
            finishPromise(i, value);
        }
       }
    })
  }

  static resolve(value){
    if(value instanceof MyPromise){
        return value;
    }else{
        return new MyPromise(resolve => resolve(value));
    }
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError("在我的promise里存在循环调用~"));
  }
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  } else {
    resolve(x);
  }
}
