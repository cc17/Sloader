(function(){
	var root = this;
	var previousSloader = root.Sloader;

	var debug = function(msg){
		if(window.console){
			return {
				log: window.console.log.bind(console,msg),
				error: window.console.error.bind(console,msg)
			};
		}
	}();

	var Sloader;
	if(typeof exports != 'undefined' ){
		Sloader = exports;
	}else{
		Sloader = root.Sloader = {};
	}
	Sloader.VERSION = '1.0.0';
	Sloader.noConflict = function(){
		root.Sloader = previousSloader;
		return this;
	};
	//extend
	function extend(parent,child,isOveride){
		isOveride = isOveride == void 0 ? true : isOveride;
		for(var key in child){
			if(!parent[key] || isOveride){
				parent[key] = child[key];
			}
		}
		return parent;
	};
	var moduleMap = {},
		//hash table for DOMLoaded
		readyFun = {},
		fileLoadedMap = {},
		isReady = false;
	//add method for Sloader
	extend(Sloader,{
		defined : function(name,dependence,fn){
			if(!moduleMap[name]){
				moduleMap[name] = {
					name:name,
					dependence:dependence,
					fn:fn
				};
			}
			return moduleMap[name];
		},
		use:function(name){
			if(!moduleMap[name]){
				return;
			}
			var module = moduleMap[name],
				dependence = module.dependence;
			if(!module.exports){
				var args = [];
				for(var i=0 ,len = dependence.length;i<len;i++){
					var dep = moduleMap[dependence[i]];
					if(!dep.exports){
						console.log(arguments.callee(dep.name),'result');
						args.push(arguments.callee(dep.name));
					}else{
						args.push(dep.exports);
					}			
				}
				module.exports = module.fn.apply(this,args);
			}
			return module.exports;
		},
		ready:function(fn,name){ 
			name = name ? name : 1;
			if(!readyFun[name]){
				readyFun[name] = [];
			}
			readyFun[name].push(fn);
		},
		require:function(fileArrs,fn){
			var head = document.getElementsByTagName('head')[0];
			var len = fileArrs.length;
			for(var i = 0;i<len;i++){
				var file = fileArrs[i];
				loadFile(file);
			}
			function loadFile(file){
				if(!fileLoadedMap[file]){
					fileLoadedMap[file] = true;
					var script = document.createElement('script');
					script.setAttribute('type',"text/javascript");
					script.onload = script.onreadystatechange = function(){
						if(!this.readySate || /loaded|compelete/.test(this.readySate)){
							head.removeChild(script);
						}
						checkAllFileLoaded();
					};
					script.src = file;
					head.appendChild(script);
				}
			};
			function checkAllFileLoaded(){
				var allLoaded = true;
				for(var i = 0;i<len;i++){
					if( !fileLoadedMap[fileArrs[i]]){
						allLoaded = false;
						break;
					}
				}
				allLoaded && (fn());
			};
		}
	});
	//fire binded event for domready
	function fireBindEvtForDomready(){ 
		for(var key in readyFun){
			var fn = readyFun[key];
			for(var i = 0 ,len = fn.length;i<len;i++){
				fn[i]();
			}
		}
	};
	//domready 
	var domReady = function(){
		var timer = null;
		//old version webkit
		if(document.readySate){
			timer = setInterval(function(){
				if(/loaded|compelete/.test(document.readySate)){
					clearInterval(timer);
					timer = null;
					fireBindEvtForDomready();	
				}
			},16);
		}else if(document.addEventListener){
			//opera ,chrome,firforx
			document.addEventListener('DOMContentLoaded',fireBindEvtForDomready,false);
		}else{
			var top = document.frameElement && document.documentElement;
			if(top && !isReady){
				//domLoadedCheck 函数表达式，外面没法访问，但是内部可以访问（ie其实有bug，函数外部也能访问，但不影响这里功能实现）
				(function domLoadedCheck(){
					try{
						top.doScroll('left');
					}catch(e){
						return setTimeout(domLoadedCheck,30);
					}
					isReady = true;
					return fireBindEvtForDomready();
				})();
			}
		}
	}();
}).call(this);