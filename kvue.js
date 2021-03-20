
// import Compile from './compile';

class KVue{
    constructor(options){
        this.$options = options;

        //数据的响应化
        this.$data = options.data;

        this.observe(this.$data);

        //模拟一下watcher创建
        // new Watcher(); //new 时就已经读了一下target了

        // this.$data.test; //此时读一下 Object.defineProperty 中的get

        // new Watcher(); //new 时就已经读了一下target了
        // this.$data.foo.bar;  
        new Compile(options.el, this)
    }

    observe(value){
        if(!value || typeof value !== 'object'){
            return
        };

        //遍历对象
        Object.keys(value).forEach(key=>{
            this.defineReactive(value,key,value[key]);
            //代理data中的属性到vue实例上
            this.proxyData(key);
        })

    }

    //数据响应化
    //每一个一依赖都对应一个单独的属性
    defineReactive(obj,key,val){

        this.observe(val); //递归 解决数据的嵌套

        const dep = new Dep()

        Object.defineProperty(obj,key,{
            get(){
                Dep.target && dep.addDep(Dep.target)

                return val
            },
            set(newVal){
                if(newVal === val){
                    return
                }
                val = newVal;
                // console.log(`${key}值发生变化了${val}`)
                dep.notify();
            }
        })
    }

    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key]
            },
            set(newVal){
                this.$data[key] = newVal;
            }
        })
    }
}


//dep 用来管理watcher

class Dep{
    constructor(){
        //这里存放若干个依赖 watcher
        this.deps = []
    }

    addDep(dep){
        this.deps.push(dep)
    }

    notify(){
        this.deps.forEach(dep=>dep.update())
    }
}

class Watcher{
    constructor(vm,key,cb){
        this.vm = vm;
        this.key = key;
        this.cb = cb

        //将当前的Watcher实例指定到Dep静态属性target
        Dep.target = this;

        this.vm[this.key]; //触 发getter,添加依赖
        Dep.target = null
    }
    update(){
        console.log("属性更新了")
        this.cb.call(this.vm,this.vm[this.key])
    }
}