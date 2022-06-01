// 函数柯里化
// 函数降维
function curry(fn){
   const len = fn.length;
   return middleFunc(...args){
    if(args<len){
        return (...restArgs)=>{
            middleFunc(...args,...restArgs)
        }
    }else{
        return fn(...args)
    }
   }
}

// 柯里化函数，实现一个add方法，不定次数的调用
function add(...args){
    let fn = function(...restArgs){      
        return add(...args, ...restArgs);
    }

    fn.toString = function(){
        return args.reduce((a, b)=> a+b)
    }
    return fn;
}
