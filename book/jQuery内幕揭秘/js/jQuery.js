/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {	
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) { 		// 参数selector可以是做任意类型的值，但只有undefined、DOM元素、字符串、函数、jQuery对象、普通JavaScript对象有效。参数context可以不传入，或者传入DOM元素、jQuery对象、普通JavaScript对象之一。
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) { 				// 参数selector可以转换为false, 例如是undefined、空字符串、null等，则直接返回this，此时this是空jQuery对象。
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) { 		// 如果参数selector有属性nodeType，则认为selector是DOM元素，手动设置第一个元素和属性context指向该DOM元素、属性length为1，然后返回包含了该DOM元素引用的jQuery对象。
			this.context = this[0] = selector; 		// 
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) { 		// 参数selector是完全字符串'body'，手动设置属性context指向document对象。
			this.context = document; 			// 第一个元素指向body元素
			this[0] = document.body;			// 最后返回包含了body元素引用的jQuery对象。				
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) { 			// 如果参数selector是其他字符串
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) { 		// 以'<'开始，以'>'结尾，且长度大于等于3。假设为HTML代码
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else { 			// 
				match = quickExpr.exec( selector ); 						// 用正则来检测HTML代码和#id的情况，match[1]存在则为HTML，match[2]存在则为#id
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) { 						// 如果match存在，则至少包含match[1]或者match[2]其中一种情况。并且没有指定context

				// HANDLE: $(html) -> $(array) 		
				if ( match[1] ) { 		// 处理html的情况
					context = context instanceof jQuery ? context[0] : context; 			// 修正context
					doc = ( context ? context.ownerDocument || context : document ); 		// 修正doc

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector ); 										// 匹配单独标签的情况。可能是'<div>', '<div/>', '<div />' '<div></div>'

					if ( ret ) { 															// 如果ret不为null，则认为参数selector是单独标签
						if ( jQuery.isPlainObject( context ) ) { 							// 如果context是普通对象
							selector = [ document.createElement( ret[1] ) ];	 			// 用document.createElement(tag)创建标签对应的DOM元素
							jQuery.fn.attr.call( selector, context, true );	 				// 调用jQuery.fn.attr()并传入context，同时把参数context中的属性、事件设置到新的DOM元素上。

						} else {
							selector = [ doc.createElement( ret[1] ) ]; 					// 否则用document.createElement(tag)创建标签对应的DOM元素
						}

					} else { 																// 如果是复杂的HTML代码。例如 'aaa<div></div>', '<div> aa a</div>'
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] ); 				// 返回值的格式为{ fragment: 含有转换后的DOM元素的文档片段, cacheable: HTML代码是否满足缓存条件 }
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes; 		// 如果HTML代码满足缓存条件，则在使用转换后的DOM元素时，必须先复制一份再使用，否则可以直接使用。
					}

					return jQuery.merge( this, selector ); 					 				// 将新创建的selector合并到当前jQuery对象this中，并返回。

				// HANDLE: $("#id") 	
				} else {		 															// 如果是#id的情况
					elem = document.getElementById( match[2] ); 							// 用document.getElementById(id)来查找含有指定id的DOM元素

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) { 										// 如果id为match[2]的元素存在，并且父元素也存在。因为黑莓4.6会返回不在文档中的DOM元素。
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) { 										// 如果查找的元素的id值与传入值不相等。document.getElementById(id)在ie6,ie7下也存在bug。
							return rootjQuery.find( selector ); 							// 用Sizzle的find()方法来查找选择器
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1; 													
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this; 															// 返回当前值
				}

			// HANDLE: $(expr, $(...))														// 参数selector是选择器
			} else if ( !context || context.jquery ) { 										// 参数context未传入，或者context有传入并且context是个jQuery对象
				return ( context || rootjQuery ).find( selector ); 							// 调用context.find(selector);

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector ); 						// 如果context不是jQuery对象，则调用$(context).find(selector)
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) { 										// 如果参数selector是函数
			return rootjQuery.ready( selector ); 											// $(document).ready(selector);
		}

		if ( selector.selector !== undefined ) { 											// selector是jQuery对象
			this.selector = selector.selector; 												// 设置selector属性
			this.context = selector.context; 												// 设置context属性
		}

		return jQuery.makeArray( selector, this ); 											// 参数selector是任意其他值。
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) { 											// 如果是null
		return num == null ?

			// Return a 'clean' array
			this.toArray() : 										// 返回包含了所有元素的数组

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] ); 	// 负数返回length + num下标位置，正数返回num下标
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) { 					// 创建一个空的jQuery对象，然后把DOM元素集合放入这个jQuery对象中，并保留对当前jQuery对象的引用。
		// Build a new jQuery matched element set
		var ret = this.constructor(); 								// 构造空jQuery对象

		if ( jQuery.isArray( elems ) ) { 							// 
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) { 									// 在新的jQuery对象设置selector属性
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() { 							// 用于出栈
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() { 					// [deep], target, object, [, objectN]
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},								// 默认target是参数的第一个
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) { 							// 如果第一个参数是布尔值。
		deep = target;												// 修正第一个参数为deep。
		target = arguments[1] || {};								// 第二个参数修正为target。
		// skip the boolean and the target
		i = 2;														// 期望源对象从第三个下标开始。
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) { 			// 如果目标对象不是对象，不是函数
		target = {};															// 用空对象代替
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) { 												// 
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) { 							// 获取源对象和对源对象的判断合并为一条语句
			// Extend the base object
			for ( name in options ) { 											// 开始遍历单个源对象的属性
				src = target[ name ];											// src是原始值
				copy = options[ name ];											// copy是复制值，copy是源对象的属性

				// Prevent never-ending loop
				if ( target === copy ) {										// 如果目标对象等于复制值，说明源对象的name属性指向目标对象。避免进入死循环。
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) { 			// 深度复制
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : []; 			// 原始值不是数组，修正为空数组。

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {}; 	// 原始值不是对象，修正为空对象。
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );		// 递归

				// Don't bring in undefined values
				} else if ( copy !== undefined ) { 								// 如果不是深度合并，并且复制值copy不是undefined，则直接覆盖目标对象的同名属性。
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) { 								// 释放变量$
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) { 					// 当deep为true时，释放前一个以jQuery为命名空间的Javascript库的变量jQuery。
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" ); 	// 初始化ready事件监听函数列表readyList。标记once，确保监听函数列表readyList只能被触发一次。标记memory，记录上一次触发监听函数列表readyList时的参数，之后添加的任何监听函数都将用记录的参数值立即调用。

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) { 	// 如果文档已经准备就绪，则调用jQuery.ready(wait)
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false ); 		

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null; 	// 如果当前页面是顶层窗口，即没有包含在其他iframe或frame元素中，还可以通过调用函数doScrollCheck()来检测是否可以触发ready事件。
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) { 											// 判断是否有效数字
		return !isNaN( parseFloat(obj) ) && isFinite( obj ); 				// 执行parseFloat(obj)尝试把obj解析为数字，再用!NaN()判断是否合法，再用isFinite(obj)判断是否有限的。
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) { 										// 判断是否是"纯粹"的对象
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) { 												// 用于全局作用域中执行JavaScript代码
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {  											// 将连字符转成驼峰式
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) { 											// 用于检查DOM元素的节点名称与指定值是否相等，忽略大小写。
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object ); 		// 变量isObj表示参数是object对象还是数组。

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) { 			// 把类数组转化成真正的数组。如果有第二个参数results，就合并到results中，返回值类型按results值而定。
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) { 		// 如果不是数组或类数组对象
				push.call( ret, array );																									// 就把参数array插入到ret中
			} else {
				jQuery.merge( ret, array ); 																								// 否则合并到ret中
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) { 						// 在数组中查找指定的元素并返回其下标，未找到返回-1。
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) { 						// 合并两个数组到第一个参数上，并返回。这两个参数可以是数组或类数组。 				
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {		// 用于查找数组中满足过滤函数的元素，原数组不受影响。当inv为false或者可以转为false时，元素在过滤函数返回true或者可以转成true才能被保存到。当inv为true或者可以转为true时，元素在过滤函数返回false或者可以转成false才能被保存到。
		var ret = [], retVal;
		inv = !!inv; 														// 如果inv是false或未传入，

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) { 		// 遍历
			retVal = !!callback( elems[ i ], i );							// 获取执行结果
			if ( inv !== retVal ) {											// 如果inv为false，则把执行结果为true的元素放入ret; 如果inv为true, 则把执行结果为false的元素放入ret中。
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) { 								// 
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {							
		if ( typeof context === "string" ) { 							// 如果context是字符串，说明格式是jQuery.proxy(context, name)。则修正fn，context。
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) { 								
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ), 							// 截取第三位及之后的参数，并转成数组args。
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) ); 			// 修正fn的上下文为context, 并传入args数组的元素作为参数
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;  		// 为代理函数设置与原始函数相同的唯一标识guid。

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) { 			// 可以为集合的元素设置一个或多个属性值。
		var length = elems.length; 				// 获取元素长度

		// Setting many attributes 				// 设置多个属性
		if ( typeof key === "object" ) { 		// 如果是普通对象
			for ( var k in key ) {				// 遍历对象
				jQuery.access( elems, k, key[k], exec, fn, value ); 	// 
			}
			return elems;
		}

		// Setting one attribute 				// 设置单个属性
		if ( value !== undefined ) { 			// 如果参数value存在
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value); 			// 参数pass不存在，exec存在并且能转化为true，并且参数value是函数才返回true。

			for ( var i = 0; i < length; i++ ) { 						// 遍历elems, 设置多个元素
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass ); 	// 为每个元素调用回调函数fn。如果value是函数，则执行并取其返回值作为参数值。如果参数exex为true，则调用fn(elem, key)读取元素的当前HTML属性值, 作为value函数的第二个参数传入，调用value函数，其返回值作为fn函数的第三个参数
			}

			return elems; 												// 返回elems
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;				// 如果length不为0, 说明只有一个元素，直接调用fn
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};												// 用于储存转换后的标记对象，其属性为标记字符串，属性值为true

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {										// 工具函数用于将字符格式的标记转换为对象格式的标记, 并把转换结果缓存起来。
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );									// 分割空格为数组
	for ( i = 0, length = flags.length; i < length; i++ ) {			// 遍历数组，为返回值object添加单个标记，属性值一律为true, 最后返回对象格式的标记。
		object[ flags[i] ] = true;
	}
	return object; 													// obejct作为flagsCache[flags]的属性返回
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {			

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};						// 先尝试从flagsCache对象中获取标记字符串flags对应的标记对象, 如果没有找到，再调用工具函数createFlags(flags)

	var // Actual callback list 																// 真正回调队列
		list = [],
		// Stack of fire calls for repeatable lists 											// 为可重复列表调用堆栈
		stack = [],                                                                         	// 可重复触发的, 正在执行的列表上
		// Last fire value (for non-forgettable lists) 											// 
		memory,																					// undefined未被触发或者被禁用，
		// Flag to know if list is currently firing 											// 标记正在调用的队列
		firing,
		// First callback to fire (used internally by add and fireWith) 						// 第一个调用回调函数，用内容的add和fireWith
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {																// 添加一个或多个回调函数到数组list中，如果是unique模式, 并且待添加的回调函数已添加过，则不会添加
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) { 								// 遍历
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {														// 如果是数组
					// Inspect recursively
					add( elem ); 																// 调用add(args), 把数组的元素逐个添加
				} else if ( type === "function" ) {												// 如果是函数
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) { 								// 如果是非unique模式或者没有添加过待添加的回调函数, 则添加到list中。在unique模式下，一个函数只能添加一次
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks 																		// 执行回调
		fire = function( context, args ) {														// 
			args = args || [];
			memory = !flags.memory || [ context, args ]; 										// 初始化没有传入memory(非memory模式),flags.memory为undefined。标记值memory值为true。如果有传入memory(memory模式), flags.memory为true。 标记值memory为[context, args]。如果当前回调函数列表是memory模式, 则变量memory被赋值为[context, args], 间接地表示当前回调函数列表已经被触发过。
			firing = true; 																		// 设置firing为true，表示正在执行
			firingIndex = firingStart || 0;														// 
			firingStart = 0;
			firingLength = list.length;															// 
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {						
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) { 		// 执行list[firingIndex], 并且返回值为false，并且当前回调函数列表是stopOnFalse模式
					memory = true; // Mark as halted 											// memory为true
					break; 																		// 停止执行后续的函数
				}
			}
			firing = false;																		// 标记函数执行结束
			if ( list ) {																		// list开始被初始化为[], 调用disable()会被设置为undefined。也就是调用了disable()方法后，无法进入下面的操作。
				if ( !flags.once ) {															// 如果不是once模式，执行回调函数列表。说明了在once模式下，禁止回调函数队列对象触发回调函数。
					if ( stack && stack.length ) {
						memory = stack.shift(); 				
						self.fireWith( memory[ 0 ], memory[ 1 ] ); 								// 在self.fireWith()中, 非once或者非memory的情况下调用fire()。在这种情况下会发生死循环。
					}
				} else if ( memory === true ) {													// 要满足memory为true。其一是非memory模式, 或者在stopOnFalse模式下函数返回false。 如果是once模式，不是memory模式; 如果是once + stopOnFalse模式，并且某个回调函数返回了false; 则禁用回调函数列表。
					self.disable(); 															// 禁用回调函数。禁用回调函数的条件为, 在once模式下, 非memory模式。在once + stopOnFalse模式下, 某个函数返回值为false。
				} else {																		// once + memory模式，会清空数组list。后续添加的回调函数会立即执行
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments ); 											// 把回调加到队列
					// Do we need to add the callbacks to the 					// 我们需要把回调函数加到当前的执行堆中吗？
					// current firing batch?
					if ( firing ) { 											// 如果回调列表正在执行中
						firingLength = list.length; 							// 修改结束下标firingLength
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) { 					// 在memory模式下，如果回调函数列表未在执行中，并且被触发过
						firingStart = length;									// 修正起始下标为回调函数的插入位置
						fire( memory[ 0 ], memory[ 1 ] ); 						// 调用工具函数立即执行
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {				// 
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) { 								// 如果回调函数列表正在执行
									if ( i <= firingLength ) {					
										firingLength--;							// 则在移除前firingLength下标减1
										if ( i <= firingIndex ) {				// 如果待移除函数的下标小于正在回调函数的下标firingIndex，即待移除的回调函数已经执行, 则修正firingIndex减1
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {							// 在unique模式下，不会有重复的回调函数，直接退出内层
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				} 	
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;				// 禁用回调函数列表时，变量memory为undefined。
				return this;
			},
			// Is it disabled?
			disabled: function() {
				console.log(list);
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;								// 设置stack为undefined, 导致无法两次触发回调函数
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {	 			// 在firing状态下, stack会添加[context, args]。在非firing状态下，并且不是once或者memory模式，就会执行fire(context, args);
				if ( stack ) {									// 如果调用callbacks.disable()，会设置stack为undefined。
					if ( firing ) { 							// 表示正在执行回调函数列表。在firing状态下, 并且不是once模式, 会将[context, args]加入到stack中
						if ( !flags.once ) {					// 如果不是once模式。
							stack.push( [ context, args ] );	// 将[context, args]加入到stack中。在once模式下，禁止将[context, args]加入到stack队列中。
						}
					} else if ( !( flags.once && memory ) ) {	// 在非firing状态下, 如果不是once模式或者memory模式
						fire( context, args );					// 则执行回调函数
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() { 									// 调用jQuery.Callbacks().self.fireWith();
				self.fireWith( this, arguments ); 				// 参数为arguments，说明可以写多个参数
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() { 								// 判断回调函数列表是否被触发过
				return !!memory;
			}
		};

	return self; 					// 链式工具对象, 称为"回调函数列表"
};



var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),				// once + memory模式会清空数组list, 立即执行后续添加的回调函数，并再次清空数组list
			failList = jQuery.Callbacks( "once memory" ),				// 为了创建两个不同的列表, 不同的函数作用域保存不同的闭包
			progressList = jQuery.Callbacks( "memory" ),				// memory模式不会清空list, 会重复执行回调函数列表
			state = "pending",											// 初始状态为pending
			lists = {													// 把doneList, failList, progressList对象放入到lists对象中，减少了对象的调用阶级。
				resolve: doneList,								
				reject: failList,
				notify: progressList
			},
			promise = { 												// 异步队列只读副本
				done: doneList.add,										// 添加成功回调
				fail: failList.add, 									// 添加失败回调
				progress: progressList.add,								// 消息回调

				state: function() {										// 返回异步队列的状态
					return state;					
				},

				// Deprecated
				isResolved: doneList.fired,								
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) { 			
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks ); 		// 依次调用方法done(), fail(), progress()添加回调函数
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments ); 				// 依次调用方法done(), fail()添加回调函数
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {									// 创建新的异步队列对象, 返回该对象的只读副本。该副本不能触发执行成功，失败，消息回调函数的方法。
					return jQuery.Deferred(function( newDefer ) { 								// 创建异步队列2时传入一个函数作为参数，这个函数参数在异步队列2返回前调用。
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ], 												// fnDone, fnFail, fnProgress
								action = data[ 1 ],												// "resolve", "reject", "notify"
								returned;
							if ( jQuery.isFunction( fn ) ) { 									// 如果是函数
								deferred[ handler ](function() {								// 调用对应的add方法
									returned = fn.apply( this, arguments ); 					// 返回异步队列，this指向异步队列1。可能返回异步队列3。pipe本身为异步队列2
									if ( returned && jQuery.isFunction( returned.promise ) ) { 				// 如果返回值可以转成true并且returned.promise是函数, 即返回的是异步队列对象
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify ); 				// 把异步队列2的方法resolve(), reject(), notify()加入到异步队列3中
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] ); 			// 返回值不是异步队列3，就向异步队列2加入相应的方法，异步队列2作为上下文。
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] ); 						// 如果不是函数，则向异步队列1中加入异步队列2的调用方法
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {														// 返回当前异步队列的只读副本。只暴露done(), fail(), progress(), then, alway(), state(), pipe().
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
					}
			},
			deferred = promise.promise({}), 									// 异步队列
			key;

		for ( key in lists ) { 													// 添加触发成功、失败、消息回调函数列表的方法
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) { 															// 如果添加了方法func，马上执行
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ), 							// 初始值为传入的子异步队列,借助slice方法把参数对象arguments转成数组
			i = 0,
			length = args.length, 												
			pValues = new Array( length ), 										// 存放每个子异步队列的消息参数
			count = length, 													// 监听子异步队列的成功状态，初始值为传入的参数个数
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ? 		// 如果只传入1个异步队列，则把传入的异步队列赋值给变量deferred。否则创建一个异步队列作为主异步队列。
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();										// 创建新的只读副本
		function resolveFunc( i ) { 											// 成功的回调
			return function( value ) {											// 返回一个函数, 参数为value
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value; 			// 如果参数个数大于1，调用[].slice方法将参数整理成数组再赋值给args[i], 否则将value赋值给args[i]。
				if ( !( --count ) ) { 											// 如果args的长度为1，参数中有一个异步对象
					deferred.resolveWith( deferred, args ); 					// 执行异步队列的触发执行成功回调函数
				}
			};
		}
		function progressFunc( i ) { 											// 消息回调函数
			return function( value ) {												
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value; 			// 参数的长度大于1，则将参数变成数组再赋值给pValue[i], 否则赋值value给pValue[i]
				deferred.notifyWith( promise, pValues );						// 执行消息回调函数
			};
		}
		if ( length > 1 ) { 													// 如果args的长度大于1
			for ( ; i < length; i++ ) { 										// 遍历args
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) { 		 	// 如果回调函数是异步队列或者是只读副本
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) ); 			// 只读副本调用add方法
				} else {
					--count;																				// 如果不是异步队列，count减1
				}
			}
			if ( !count ) { 																				// 如果所有的参数不是异步队列
				deferred.resolveWith( deferred, args ); 													// 执行成功回调函数
			}
		} else if ( deferred !== firstParam ) { 								// 参数长度为0，如果不是异步队列或只读副本
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] ); 	// 执行成功回调函数
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ), 										// 创建一个div元素
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";		// 设置div的innerHTML为一段HTML代码

	all = div.getElementsByTagName( "*" );											// 
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {												// 
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ), 						// 检测第一个子元素是不是文本节点。如果是文本节点，说明保留了前导空白符。ie6/7/8为false

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length, 							// 检测tbody的个数。ie6/7为false

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,					// 如果浏览器使用innerHTML属性可以正确序列化link标签，则测试项htmlSerialize为true。ie6/7/8为false

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),	 							// 如果DOM元素的内联样式可以通过DOM属性style直接访问，则测试项style为true。ie6/7/8为false。						

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),						// 如果通过原生方法getAttribute()获取属性href值没有被格式化为一个全路径URL。则测试项hrefNormalized为true。ie6/7为false。

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ), 									// 如果浏览器支持opacity，测试项为true。否则为false。d

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,												// 如果浏览器支持通过style.cssFloat访问float，测试项为true。 ie6/7/8为false。

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ), 											// 如果复选框的属性value的默认值为'on',　则测试项checkOn为true。safari为false。

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,													// 如果浏览器在复制DOM节点时会复制选中状态，则测试项为true。IE6/7/8/9/10为false。

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t", 									// 能用原生方法getAttribute, setAttribute, removeAttribute可以正确设置，读取和移除HTML属性，则测试项为true。 ie6/7为false。

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,		 					// 如果表单元素支持属性enctype，测试项为true。					

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>", 		// 如果浏览器能正确复制html5元素，测试项为true。ie6/7/8为false。

		// Will be defined later
		submitBubbles: true,							// 如果submit事件沿着DOM树向上冒泡，则测试项submitBubbles为true。ie6/7/8为false。									
		changeBubbles: true, 							// 如果change事件沿着DOM树向上冒泡，则测试项changeBubbles为true。ie6/7/8为false。
		focusinBubbles: false, 							// IE支持focusin事件，则测试项focusinBubbles为true。在其他浏览器为true。
		deleteExpando: true,							// 如果浏览器允许删除DOM元素上的属性，则测试项为true。ie6/7/8为false。
		noCloneEvent: true, 							// 如果浏览器在复制DOM元素时不复制事件监听函数，则测试项noCloneEvent为true。
		inlineBlockNeedsLayout: false,					// 设置zoom为1, 触发hasLayout属性。如果该元素按照inline-block显示，则测试项inlineBlockNeedsLayout为true。ie6/7为true，其它浏览器为false。
		shrinkWrapBlocks: false,						// 在IE下，一个元素拥有hasLayout属性和固定的width和height时，如果该元素会被子元素撑大，则测试项shrinkWrapBlocks为true。ie为true，其它浏览器为false。
		reliableMarginRight: true 						// 如果浏览器返回正确的计算样式marginRight(即右外边距), 则测试项reliableMarginRight为true。
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;			// 如果已禁用的select元素中的option子元素未被自动禁用，则测试项optDisabled为true。否则为false。

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;							// 如果浏览器允许删除DOM元素上的属性，则测试项为true。ie6/7/8为false。
	} catch( e ) {		
		support.deleteExpando = false;			 	
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false; 			// 如果浏览器在复制DOM元素时不复制事件监听函数，则测试项noCloneEvent为true。
		});
		div.cloneNode( true ).fireEvent( "onclick" ); 				
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";																	// 先设置value为't'
	input.setAttribute("type", "radio");												// 再设置type为'radio'
	support.radioValue = input.value === "t";									 		// 检查属性value与设置值是否相等。如果相等，测试项为true。ie6/7/8/9/10为false。

	input.setAttribute("checked", "checked");											// 
	div.appendChild( input );
	fragment = document.createDocumentFragment(); 										
	fragment.appendChild( div.lastChild );												// 将input放入文档碎片中

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;  	// 复制两次后检测checked是否为true。如果是则测试项为true。 ie6/7为false。

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;												// 被选中的单选框和复选框添加到DOMs树中后，如果仍然为选中状态，则测试项appendChecked为true。 ie6/7为false。

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0; 		// 如果浏览器返回正确的计算样式marginRight(即右外边距), 则测试项reliableMarginRight为true。
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) { 								// IE的兼容性处理。
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" ); 				
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2; 					// 检查div元素的可见宽度offsetWidth是否等于2。在IE怪异模式下会返回1，测试项boxModel为false。在标准模式下会返回2，测试项boxModel为true。ie6/7为false。

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";	
			div.style.zoom = 1;															// 设置zoom为1, 触发hasLayout属性。如果该元素按照inline-block显示，则测试项inlineBlockNeedsLayout为true。
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );						// 在IE下，一个元素拥有hasLayout属性和固定的width和height时，如果该元素会被子元素撑大，则测试项shrinkWrapBlocks为true。ie为true，其它浏览器为false。
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ), 								// 如果子元素距其父元素上边界的距离offsetTop不包含父元素的上边框厚度，测试项为true。 ie8为false。
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )						// 如果td元素距其父元素tr上边界的距离offsetTop包含table元素的上边框厚度，则测试项doesAddBorderForTableAndCells为true。
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 ); 		// 子元素距父元素边界的距离会减去父元素的边框厚度，则测试项为true。
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop ); 	// 如果body元素距html元素边框的距离不包括body元素的外边距margin，则测试项doesNotIncludeMarginInBodyOffset为true。

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you 	如果尝试在embed、object、applet上附加属性值，将会抛出未捕获的异常
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000", 	
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},
	// 元素对象的缓存挂在元素的jQuery.expando上, 非元素挂在jQuery.cache对象上。返回缓存体
	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {		// 是否可以附加数据，不可以则直接返回
			return;
		}

		var privateCache, thisCache, ret;
		var	internalKey = jQuery.expando;			//时间戳，时间戳是唯一的
		var	getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7		必须区分处理DOM元素和JS对象因为IE6-7不能垃圾    dom.onclick = function () { this.innerHTML; }
			// can't GC object references properly across the DOM-JS boundary			回收对象跨DOM对象和JS对象进行的引用属性
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is 			只有DOM元素需要全局的jQuery缓存; 而js对象直接附加到对象上。
			// attached directly to the object so GC can occur automatically 			
			cache = isNode ? jQuery.cache : elem,										/// 创建缓存源。节点当缓存体，防止ie的内存泄露; 非节点直接用对象存储。

			// Only defining an ID for JS objects if its cache already exists allows 	如果js对象的cache已经存在, 则需要为它定义一个ID;
			// the code to shortcut on the same path as a DOM node with no cache 		
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,		/// 如果缓存源有缓存，就直接从缓存中取id。
			isEvents = name === "events"; 												// name如果为events, 缓存就是关联元素的处理器的

		// Avoid doing any more work than we need to when trying to get data on an      如果对象没有数据,提前判断,避免不必要的工作;
		// object that has no data at all 												/// 缓存源上没有缓存, 并且不是事件，供外部使用，没有缓存对象
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data 	只有DOM元素需要一个唯一ID，因为DOM元素的数据是存储在全局cache中的。
			// ends up in the global cache 												JS对象则直接使用jQuery.expando，既然是直接附加到对象上，又何必要id呢？
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid; 								/// 如果DOM元素没有internalKey属性, 就添加一个唯一ID存储到internalKey上
			} else {
				id = internalKey;														/// 如果JS对象, 直接附加到对象上
			}
		}	
		// 数据存储在一个映射对象中({});							
		if ( !cache[ id ] ) {															
			cache[ id ] = {};															/// 初始化elem缓存空间

			// Avoids exposing jQuery metadata on plain JS objects when the object 		当对象用JSON.stringify序列化成字符串时, 避免暴露jQuery元数据在纯对象上。	   			
			// is serialized using JSON.stringify										
			if ( !isNode ) { 															///
				cache[ id ].toJSON = jQuery.noop; 						 					
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets 	data接口接收对象和函数，浅拷贝	
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) { 					/// 如果供内部, 就挂在cache[ id ]下; 否则放在cache[ id ].data下
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ]; 											/// 存储对象，存放了所有数据的映射对象

		// jQuery data() is stored in a separate object inside the object's internal data 	jQuery内部数据存在一个独立的对象（thisCache[ internalKey ]）上，
		// cache in order to avoid key collisions between internal data and user-defined	为了避免内部数据和用户定义数据冲突
		// data.
		if ( !pvt ) {																		// pvt 私有的，是否是内部使用的独立对象，pvt为true时用于事件处理
			if ( !thisCache.data ) {														
				thisCache.data = {};														// 如果要供外部访问, 在thisCache下新建data对象
			}

			thisCache = thisCache.data;														///  降低对象调用层级
		}

		if ( data !== undefined ) {															// 如果data不是undefined，表示传入了data参数，则存储data到name属性上，统一为驼峰写法
			thisCache[ jQuery.camelCase( name ) ] = data;									
		}

		// Users should not attempt to inspect the internal events object using jQuery.data, 	用户不应该试图检查使用jQuery.data内部事件的对象
		// it is undocumented and subject to change. But does anyone listen? No.				
		if ( isEvents && !thisCache[ name ] ) { 												
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names 			检查转成驼峰式和没有转的数据的属性名, 如果数据有特殊属性				
		// If a data property was specified
		if ( getByName ) {		//如果name为字符串

			// First Try to find as-is property data   		首先找的是数据属性								
			ret = thisCache[ name ];

			// Test for null|undefined property data 			
			if ( ret == null ) {

				// Try to find the camelCased property 		尝试寻找驼峰式属性
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache; 								// 如果为对象,直接返回
		}

		return ret; 	// 返回缓存。$("div").data("abc", "abc"), 返回abc; 
	},
	//  
	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key  // internalKey每次对于jQuery都不同，但对于元素都一样。
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information		// 区分缓存源。
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information		// 区分缓存体的键值
			id = isNode ? elem[ internalKey ] : internalKey;	

		// If there is already no cache entry for this object, there is no 		// 提前判断有没有缓存
		// purpose in continuing
		if ( !cache[ id ] ) {			
			return;
		}

		if ( name ) {						// 判断有没有缓存的key

			thisCache = pvt ? cache[ id ] : cache[ id ].data;	// 私有的直接取id，非私有的就取id的data

			if ( thisCache ) { 				// 判断缓存体 

				// Support array or space separated string names for data keys 	
				if ( !jQuery.isArray( name ) ) {			// 剔除数组

					// try the string as a key before any manipulation
					if ( name in thisCache ) {				// 对象
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );	// 字符串转成驼峰
						if ( name in thisCache ) {			
							name = [ name ];
						} else {
							name = name.split( " " );		// 字符串直接分割
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {	// ie6下delete有bug，不能删除非全局变量。无法删除arguments，函数的参数。可以删除非声明性全局变量。用eval创建的变量都不带有DontDelete标记。
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) { 		// 如果缓存源还有缓存体就返回
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;	// 供外缓存删除缓存id的data对象

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {	// 还有缓存体不应当销毁
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080			// 保证cache非全局变量
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {		
			delete cache[ id ];
		} else {
			cache[ id ] = null;											// 如果不支持delete，设置为空
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid  // 我们销毁了缓存，需要消除扩展节点上以避免错误查找。
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {					
			// IE does not allow us to delete expando properties from nodes,				// 处理ie的bug 
			// nor does it have a removeAttribute function on Document nodes;			
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {	
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.		// 给内部访问
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );	
	},

	// A method for determining if a DOM node can handle the data expando  判定一个文档节点能否处理数据扩展
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {									// 需要观察的元素。负责检测匹配元素关联的队列(type + 'queue')和计数器(type + 'mark')
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );									// 如果有关联的回调函数列表，队列，计数器，才会检测关联的队列的和计数器的状态
	if ( defer &&																	// 如果参数为'queue',不需要再次调用jQuery._data(elem, queueDataKey)来判断队列为空
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) && 				// 如果参数为'mark'表示此时计数器已经不存在，或者不需要调用jQuery._data(elem, markDataKey)来判断计数器的值
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() { 													// 使用setTimeout为了关联的队列或计数器的回调函数优先执行
			if ( !jQuery._data( elem, queueDataKey ) && 							// 如果关联的队列为空队列，并且关联的计数器为0，则移除并触发回调函数列表，这会导致方法promise()中
				!jQuery._data( elem, markDataKey ) ) {								// 如果
				jQuery.removeData( elem, deferDataKey, true ); 						// 移除并触发回调函数列表
				defer.fire();														// 对于普通队列，需要用回调函数列表触发。导致.promise()中count减1
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) { 												// 计数器加1，计数器存储在关联的数据缓存对象中，数据名称为type + 'mark'
		if ( elem ) { 																
			type = ( type || "fx" ) + "mark";										// 修正type为 type + "mark", 默认为 "fxmark"
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );		// 先调用jQuery._data(elem, type)取出已有的计数器并加1。然后再次调用jQuery._data(elem, type, data)，把更新后的计数器作为内问好数据存储到关联的数据缓存对象中。默认初始值为0。
		}
	},

	_unmark: function( force, elem, type ) {										// 计数器减1，计数器存储在关联的数据缓存对象中，数据名称为type + 'mark'
		if ( force !== true ) { 													// 如果force不为true, 表示不强制清0
			type = elem;															// 修正参数type, elem, force
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";													// 修正参数type，默认为'fx'
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 ); 		// force为true, 设置计数器值为0, 否则调用jQuery._data(elem, key)取出计数器。如果没设置，默认为1。并减1.
			if ( count ) {															// 如果count不为0，说明了已经设置过
				jQuery._data( elem, key, count );									// 存储到数据缓存对象中
			} else {
				jQuery.removeData( elem, key, true );								// 调用jQuery.removeData移除参数type对象的计数器
				handleQueueMarkDefer( elem, type, "mark" );							// 调用handleQueueMarkDefer(elem, type, "mark")
			}
		}
	},

	queue: function( elem, type, data ) { 									// jQuery.queue(elem, type, data)用于返回或修改匹配元素关联的函数队列。
		var q;
		if ( elem ) {														// 如果参数elem存在
			type = ( type || "fx" ) + "queue";								// 修正参数type，默认为动画队列"fx"。在参数type后加上后缀"queue"，表示这是一个队列。
			q = jQuery._data( elem, type ); 								// 调用数据缓存方法jQuery._data()来读取和设置队列(取出参数type对应的队列)

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {													// 如果有参数data
				if ( !q || jQuery.isArray(data) ) {							// 如果队列不存在或者data是一个数组
					q = jQuery._data( elem, type, jQuery.makeArray(data) ); 	// 调用jQuery.makeArray()把参数data转换为数组, 并替换队列。否则
				} else {
					q.push( data );											// 否则就把参数data入队
				}
			}
			return q || []; 												// 返回参数type对象的队列，不存在返回[]
		}
	},

	dequeue: function( elem, type ) {										// jQuery.dequeue(elem, type)用于出队并执行匹配元素关联的函数队列中的下一个函数。
		type = type || "fx"; 												// 修正type

		var queue = jQuery.queue( elem, type ),								// 取出参数type对应的队列
			fn = queue.shift(),												// 调用数组方法shift()出队第一个函数。
			hooks = {};														// 

		// If the fx queue is dequeued, always remove the progress sentinel 	
		if ( fn === "inprogress" ) {										// 如果fn为'inprogress'
			fn = queue.shift();												// 则丢弃一个再出队一个。
		}

		if ( fn ) {															// 如果fn能转成true
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {											// 队列名为'fx'
				queue.unshift( "inprogress" );								// 队列头前加上'inprogress'字符串，设置动画占位符，表示函数正在执行
			}

			jQuery._data( elem, type + ".run", hooks );						// 设置内部数据type+'.run'，表示type对象的队列正在执行。type+'.run'
			fn.call( elem, function() {										// 调用函数方法call()执行出队的函数
				jQuery.dequeue( elem, type );								// 第二个参数是封装了jQuery.dequeue(elem, type)的函数，不会自动执行。需要在出队的函数返回前手动调用next()，以使下一个顺序得以执行。
 			}, hooks );														// 第三个参数hooks是一个空对象，出队的函数在执行过程中可以把数据存储在对象hooks上。
		}

		if ( !queue.length ) { 														// 如果函数全部出队
			jQuery.removeData( elem, type + "queue " + type + ".run", true );		// 清除参数type对应的队列(type + "queue")和数据对象(type + ".run");
			handleQueueMarkDefer( elem, type, "queue" );							// 
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {									// 查找或者修改type对应的队列，如果type是'fx'，调用jQuery.dequeue(elem, type)方法出队。
		if ( typeof type !== "string" ) { 							// 如果参数type不是字符串
			data = type;											// 把参数type赋值给参数data
			type = "fx";											// 把'fx'赋值给参数type
		}

		if ( data === undefined ) {									// 如果参数data为undefined, 也就是没有参数的情况，相当于$({}).queue('fx');
			return jQuery.queue( this[0], type );					// 把第一个元素作为参数type, type作为data, 返回调用jQuery.queue(type, data)的对象
		}	
		return this.each(function() {								// 调用jQuery.each遍历this(元素),
			var queue = jQuery.queue( this, type, data );			// 在this上查找或者修改参数type对应的队列

			if ( type === "fx" && queue[0] !== "inprogress" ) { 	// 如果type为'fx', 如果队列的第一元素不为'inprogress'。说明了队列不在执行中
				jQuery.dequeue( this, type ); 						// 执行队列
			}
		});
	},
	dequeue: function( type ) {										// 
		return this.each(function() {
			jQuery.dequeue( this, type ); 						
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {											// jQuery.fn.delay(time ,type)用于设置一个计时器，以使得匹配元素关联的函数队列中后续的函数延迟出列和执行。
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time; 		// 修正参数time,尝试从jQuery.fx.speeds中读取参数对应的时间, 如果未取到则采用原始值。
		type = type || "fx";												// 修正参数type

		return this.queue( type, function( next, hooks ) {					// 调用this.queue方法向关联的函数队列中插入一个函数，该函数内通过setTimeout延迟下一个函数的出队时间。
			var timeout = setTimeout( next, time );							// 
			hooks.stop = function() {										// 方法hooks.stop()用于取消定时器。在等待期间可以调用hooks.stop方法
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) { 											// 用于移除匹配元素关联的函数队列中所有未被执行的函数。
		return this.queue( type || "fx", [] ); 								// 用一个空数组来替换队列
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {										// jQuery.fn.promise(type, object)返回一个异步队列的只读副本。观察每个匹配元素关联的某个类型的队列和计数器是否完成。
		if ( typeof type !== "string" ) {									// 如果是$().promise(obj)的形式
			object = type;													// 修正参数object, type
			type = undefined;
		}
		type = type || "fx";												// 修正参数type
		var defer = jQuery.Deferred(),										// defer用于存储成功的回调函数
			elements = this, 						
			i = elements.length,											// 获取元素的个数
			count = 1,														// 初始化计数器为1
			deferDataKey = type + "defer", 									// DOM元素关联的回调函数列表的名称
			queueDataKey = type + "queue",									// DOM元素关联的队列的名称
			markDataKey = type + "mark",									// DOM元素关联的计数器的名称
			tmp;
		function resolve() {
			if ( !( --count ) ) {											// 当计数器变为0时, 表示所有需要观察的元素所关联的函数队列(type + 'queue')和计数器(type + 'mark')都已经完成。这时会触发异步队列的成功回调函数。
				defer.resolveWith( elements, [ elements ] );				// 
			}
		}
		while( i-- ) {														// 如果计数器还没为0
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) || 			// 如果元素已经有关联的回调函数列表(type + 'defer'), 说明需要观察该元素。
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||			// 如果元素有关联的列表(type + 'queue')。
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&			// 如果有关联的计数器(type + 'mark'), 也说明需要观察该元素。
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {		// 这时会新创建一个回调函数列表，赋值给变量tmp
				count++;													// 表示要观察元素的个数
				tmp.add( resolve );										
			}
		}
		resolve();															// 调用特殊回调函数resolve，如果没有需要观察的元素，则立即触发异步队列的成功回调函数。
		return defer.promise(object);										// 返回异步队列的只读副本。
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {					// 如果className还没设置, 并且只添加一个类名
						elem.className = value;											// 直接设置类名

					} else {	
						setClass = " " + elem.className + " ";							// 规范化格式，前后加上空格

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {			
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {	// 在待添加类样式前后添加空格，判断类样式是否存在于当前样式中，存在则忽略。
								setClass += classNames[ c ] + " ";						// 不存在则追加。
							}
						}
						elem.className = jQuery.trim( setClass );						// 去掉首尾空格
					}
				}
			}
		}

		return this;																	// 返回该元素
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) { 											// 传入的是函数
			return this.each(function( j ) {											// 遍历每个元素
				jQuery( this ).removeClass( value.call(this, j, this.className) );		// 在每个匹配元素上执行函数，并将返回值作为待移除的类样式，然后迭代调用方法.removeClass(value)移除类样式。
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) { 			// 如果参数是字符串或者未传入参数
			classNames = ( value || "" ).split( rspace );								// 用空白符分割参数value, 转换为数组classNames, 以支持移除一个或者多个样式

			for ( i = 0, l = this.length; i < l; i++ ) {								// 遍历每个元素
				elem = this[ i ];											

				if ( elem.nodeType === 1 && elem.className ) {							// 如果elem.className不存在或者为空，则不作处理
					if ( value ) {														// 如果value不为空
						className = (" " + elem.className + " ").replace( rclass, " " );		// 在elem.className前后添加空格, 并将换行符，回车符，制表符替换为空格
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {					// 遍历待移除类样式数组classNames
							className = className.replace(" " + classNames[ c ] + " ", " ");	// 待移除类样式前后添加空格，再替换为空格。
						}
						elem.className = jQuery.trim( className );								// 最后支掉头尾空格

					} else {
						elem.className = "";											// 如果未传入value，直接设置为空字符串
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {										
		var type = typeof value,						// 指示参数value是否字符串
			isBool = typeof stateVal === "boolean"; 	// 指示参数stateVal是否布尔值

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() { 				// 
			if ( type === "string" ) {				// 如果value是字符串
				// toggle individual class names
				var className,	
					i = 0,
					self = jQuery( this ),			// this转成jQuery对象
					state = stateVal,				// 用变量state保存变量stateVal
					classNames = value.split( rspace );		// 用空格分割value，转成数组

				while ( (className = classNames[ i++ ]) ) { 		// 遍历数组classNames
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );		// 参数stateVal不是布尔值，元素没有className, state为true; 元素有className, state为false。
					self[ state ? "addClass" : "removeClass" ]( className );	// 如果stateVal是布尔值，则依据该参数来判断是添加还是移除，如果是true则添加，false为移除。否则检查匹配元素是否含有指定的类样式，如果含有则移除，如果没有添加。
				}

			} else if ( type === "undefined" || type === "boolean" ) {			// 如果未传入参数，或者只传入了参数switch
				if ( this.className ) {											// 如果当前元素指定了类样式
					// store className if set
					jQuery._data( this, "__className__", this.className ); 		// 则缓存下来，以便再次调用方法.toggle([switch])恢复。
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";   	// 直接设置每个匹配元素的DOM属性className来切换全部类样式。
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ", 		// 类名前后加上空格
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {			// 遍历元素，元素类名前后加上空格，再替换其中的换行符，回车符，制表符为空格。然后用字符串indexOf()检查其中是否含有指定的类样式。
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {						// 
		var hooks, ret, isFunction,					// 
			elem = this[0];

		if ( !arguments.length ) {					// 如果未传入参数
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];			// 尝试依次获取value对应的修正对象

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) { 			// 优先调用get()获取value属性，返回值不为undefind
					return ret;																					// 直接返回
				}

				ret = elem.value;					// 保存DOM属性value

				return typeof ret === "string" ? 		 		// 如果value为字符串
					// handle most common string cases
					ret.replace(rreturn, "") : 					// 替换空格，最后输出
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;						// null转为""，其它类型则直接输出
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val; 						// 转为jQuery对象

			if ( this.nodeType !== 1 ) {						// 提前判断是不是元素，不是直接返回。
				return;
			}

			if ( isFunction ) {									// 如果参数是函数
				val = value.call( this, i, self.val() );		// 马上执行，把返回值赋给变量val。元素为上下文, 第一个参数为元素在数组中的位置，第二个参数是元素value属性。
			} else {
				val = value; 									// 否则赋值给val变量
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {								// 如果value为null, undefined
				val = "";										// 返回空字符串
			} else if ( typeof val === "number" ) {				// 如果为数字
				val += "";										// 转为字符串
			} else if ( jQuery.isArray( val ) ) {				// 如果为数组
				val = jQuery.map(val, function ( value ) {		// 遍历数组的所有元素，将null的元素转为空字符串，否则转为字符串
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];		// 查找节点名称或者type类型对应的修正对象

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) { 		// 优先调用set方法设置value值，如果返回值不是undefined，则认为设置成功。
				this.value = val;														// 否则直接设置value
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value; 								// 如果指定了属性value，则返回elem.value，否则返回文本内容elem.text。
				return !val || val.specified ? elem.value : elem.text; 			// 如果没有设置DOM属性value, 读取HTML属性value; 如果没有设置HTML属性value，则读取文本内容。
			}
		},
		select: {														
			get: function( elem ) {						// 
				var value, i, max, option,
					index = elem.selectedIndex,			// 被选中项的索引值
					values = [],						// 存放option多选的值
					options = elem.options,				// 
					one = elem.type === "select-one";	// one变量表示是否单选, true表示是，false表示否

				// Nothing was selected
				if ( index < 0 ) { 						// 没有选择,没有option元素时，返回-1
					return null; 						// 返回null
				}

				// Loop through all the selected options
				i = one ? index : 0; 					// 如果是单选，把index赋值i, 多选的情况i设置为0
				max = one ? index + 1 : options.length; 		// 如果是单项选择，max表示option的位置，否则表示多选项数
				for ( ; i < max; i++ ) { 				// 遍历option
					option = options[ i ];				// 当前项

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) { 		// 被禁用的option和optgroup元素，不返回它的值。

						// Get the specific value for the option
						value = jQuery( option ).val(); 						// 获取value

						// We don't need an array for one selects
						if ( one ) {											// 如果是单选
							return value;										// 返回value
						}

						// Multi-Selects return an array
						values.push( value );									// 多选把值放入数组values
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) { 				
					return jQuery( options[ index ] ).val();
				}

				return values; 													// 返回values
			},

			set: function( elem, value ) { 										// 
				var values = jQuery.makeArray( value );							// 将value转成数组

				jQuery(elem).find("option").each(function() {					// 遍历所有option，设置每个option元素的selected属性
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {							// 如果未传入参数
					elem.selectedIndex = -1;					// 则修正select元素的DOM属性selectedIndex为-1
				}
				return values; 									// 返回values
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) { 								// 参数pass是否调用同名方法
		var ret, hooks, notxml,											
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) { 			// 文本节点，，注释，属性节点
			return;
		}

		if ( pass && name in jQuery.attrFn ) {									// 指示如果HTML属性与jQuery方法同名，是否调用同名的方法。如果该参数为true则调用, false则不调用。
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {						// 如果浏览器不支持getAttribute方法
			return jQuery.prop( elem, name, value );							// 则设置DOM元素的属性name值为value, 读取对应的DOM属性
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );						// elem不是DOM元素或者不是xml元素

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {	
			name = name.toLowerCase();											// 转成小写
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );		// 依次尝试获取对应的HTML属性修正对象jQuery.attrHooks[name], 布尔属性修正对象boolHook，节点属性修正对象nodeHook
		}

		if ( value !== undefined ) {											// 如果传入value				

			if ( value === null ) {												// 如果value为null
				jQuery.removeAttr( elem, name );								// 删除该属性
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {		//	
				return ret;

			} else {															// 否则
				elem.setAttribute( name, "" + value );							// 先将value转成字符串，再设置属性name值为value
				return value;													// 返回value
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) { 	// 如果是HTML属性修正对象或者布尔修正对象，调用get方法
			return ret;											// 返回ret。

		} else {		// 否则

			ret = elem.getAttribute( name );	// 读取name属性

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?				// 如果为null，说明没定义HTML属性。统一返回undefined。
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {					
			attrNames = value.toLowerCase().split( rspace );			
			l = attrNames.length;

			for ( ; i < l; i++ ) {										// 遍历attNames, 逐个移除HTML属性
				name = attrNames[ i ];									// 

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;			// 取出HTML属性对应的DOM属性

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );						// 将HTML属性设置为空字符串
					elem.removeAttribute( getSetAttribute ? name : propName );		// 如果测试项为false, 则传入对应的DOM属性

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {				// 对于布尔型HTML属性
						elem[ propName ] = false;						// 同步设置对应的DOM属性为false
					}
				}
			}
		}
	},

	attrHooks: {
		type: { 								
			set: function( elem, value ) {											// 在IE设置input标签的type属性为radio会让value变成'on'
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) { 			// 如果是button/input标签, 设置type属性会抛出错误
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) { 		// 如果jQuery.support.radioValue为false, 说明设置type 并且为input标签，type为radio
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value; 											// 先保存value值
					elem.setAttribute( "type", value );								// 设置type为'radio'
					if ( val ) {
						elem.value = val;											// 再设置value为val
					}
					return value;													// 返回value
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: { 																	// 在IE6/7中获取button标签的value属性会返回button的innerHTML值
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) { 				// 如果setAttribute, getAttribute, setAttributeNode, getAttributeNode无法正确返回值, 则nodeHook为一个对象，有get和set方法
					return nodeHook.get( elem, name );								// 对于button标签，优先调用通用HTML属性修正对象nodeHook的修正方法get()和set(),来读取和设置HTML属性value。
				}
				return name in elem ? 												// 其它标签就返回value值
					elem.value :
					null;
			},
			set: function( elem, value, name ) {				 					
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) { 				// 对于button标签，优先调用通用HTML属性修正对象nodeHook的修正方法get()和set()，来读取和设置HTML属性value。			
					return nodeHook.set( elem, value, name );						
				}
				// Does not return so that setAttribute is also used
				elem.value = value;													// 其它标签就设置value值
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {											// 
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {					// 忽略文本，注释，属性节点
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );							// 

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;									// DOM属性必须是驼峰式
			hooks = jQuery.propHooks[ name ];										// 尝试获取对应的修正对象
		}

		if ( value !== undefined ) {												// 如果value存在
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {		// 如果存在对应的修正对象，优先调用修正方法set()。
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );						// 读取对应的DOM属性
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ? 		// 如果属性值为true或者属性值不为false。
			name.toLowerCase() : 										// 返回小写的属性名
			undefined;													// 否则返回undefined
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {										// 如果value为false
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );							// 则移除指定的HTML属性
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;					// 依次获取HTML属性名对应的DOm属性名
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;								// 如果该属性名在DOM元素上已经存在，设置为true。
			}

			elem.setAttribute( name, name.toLowerCase() );				// 调用原生方法设置HTML属性为小写的属性名
		}
		return name;													// 返回HTML属性名
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = { 									// 如果属性值为空字符串，则返回undefined，其他属性则正常返回
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {				
		get: function( elem, name ) {					
			var ret;
			ret = elem.getAttributeNode( name );		// 获取对应的HTML属性对象
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ? 		
				ret.nodeValue : 						// 返回nodeValue值, ret.specified为false时，设置为undefined。
				undefined;
		},
		set: function( elem, value, name ) {							 
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );	// 尝试获取name对应的HTML属性对象
			if ( !ret ) {										// 如果没有获取到，说明还没曾设置过
				ret = document.createAttribute( name );			// 则创建一个并添加到当前元素上
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );				// 设置nodeValue为value。
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set; 				

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {	// 创建HTML属性'width', 'height'对应的修正对象
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], { 		// 只有set方法
			set: function( elem, value ) {
				if ( value === "" ) {												// 当value为空时
					elem.setAttribute( name, "auto" );								// 设置为'auto'
					return value;													// 最后返回value
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {											// 创建HTML属性contenteditable对应的修正对象，它含有两个修正方法。
		get: nodeHook.get,															// 通过读取elem.getAttributeNode(name).nodeValue来读取HTML属性contentditable
		set: function( elem, value, name ) {										
			if ( value === "" ) {													// 如果value为空
				value = "false";													// 设置为false
			}											
			nodeHook.set( elem, value, name );										// 调用nodeHook.set(elem, value, name)，通过读取elem.getAttributeNode(name).nodeValue来设置HTML属性
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {											 
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {			
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 ); 							// 获取相对路径
				return ret === null ? undefined : ret;								// 获取不到统一返回undefined
			}
		});
	});
}

if ( !jQuery.support.style ) { 														// 
	jQuery.attrHooks.style = {
		get: function( elem ) {														
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;					// 读取elem.style.cssText返回内联样式
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );								// 通过设置elem.style.cssText改变内联样式
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {												// 如果浏览器在复制DOM节点时会复制选中状态，则测试项为true。IE6/7/8/9/10为false。
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {			 
		get: function( elem ) {														 
			var parent = elem.parentNode;											

			if ( parent ) {															// 如果有父元素
				parent.selectedIndex;												// 触发select的selectedIndex属性

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {											// 
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) { 									// 如果测试项为false, 即radio、checkbox默认值不是on
	jQuery.each([ "radio", "checkbox" ], function() {				
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;	 			// 读取时统一返回默认值on
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() { 					// 
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) { 						// 如果value为数组
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );		// 检测当前元素的值是否与数组中某一个值相等，如果相等则设置当前元素checked为true，否则为false.
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector ); 	// exec方法匹配不到就返回null, 否则返回[正则表达式相匹配的文本, 第 1 个子表达式相匹配的文本(即是有()的文本), 第 2 个子表达式相匹配的文本。。。,匹配文本的第一个字符的位置, 匹配的字符串];
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) && 	   // ( div#syc.syc ) 其中m[1]为div ; 没有标签选择器, 或者为大写
			(!m[2] || (attrs.id || {}).value === m[2]) && 		   // ( div#syc ) 其中m[2]为id  ; 没有id选择器, 或者ele.attributes.id.value === m[2]; 由于正则的关系，如果没有id，则为undefined; 所以jQuery的写法是非常严谨的。
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value )) // ( div.syc ) 其中m[3]为class ; ele.attributes.class.value不兼容ie9以下的浏览器, 只能用ele.attributes["class"].value;
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.  管理事件的辅助函数, 不对外公开
 * Props to Dean Edwards' addEvent library for many of the ideas.	多亏了Dean Edwards 的 addEvent库 提供了许多灵感	
 */
jQuery.event = {
	// 绑定一个或多个类型的事件监听函数
	add: function( elem, types, handler, data, selector ) { 		// 参数elem: 待绑定事件的DOM元素。参数types: 事件类型字符串，多个事件类型之间用空格隔开。事件类型可以含有一个或多个命名空间。参数handler：待绑定的事件监听函数。参数data：自定义数据，可以是任意类型。

		var elemData, eventHandle, events,				
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)  			// 过滤文本节点和注释的节点,没有事件类型或函数回调，不再向下操作。
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {  	// 事件的缓存从这里开始
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler 						
		if ( handler.handler ) {																	
			handleObjIn = handler;																	// 方便"事件拷贝"
			handler = handleObjIn.handler;															// 记录事件描述
		}

		// Make sure that the handler has a unique ID, used to find/remove it later					// 确保回调有uuid, 用于查找和删除
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first 				// 在数据缓存系统中开辟一个叫"event"的空间来保存其所有回调与事件处理
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};																	
		}
		eventHandle = elemData.handle;																
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {											
				// Discard the second event of a jQuery.event.trigger() and 						
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ? 		// 主监听函数，负责分发事件和监听函数
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events 	// 
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space 			// 用空格隔开事件
		// jQuery(...).bind("mouseover mouseout", fn);			//
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {   				// 遍历空格隔开的事件。记录每个事件的描述信息，放在事件缓存的handlers数组中，代理事件在前，普通事件在后。

			tns = rtypenamespace.exec( types[t] ) || []; 		// 取得命名空间 比如： click.myFunction , 取得 ["click.myFunction", "click", "myFunction"]
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();	 	// 修正命名空间。	此处不明，既然取得命名空间，又何以排序？

			// If event changes its type, use the special event handlers for the changed type 		// 处理非主流事件,包括ie的bug和ff的DomMouseScroll
			special = jQuery.event.special[ type ] || {};											// 第一次获取special, 如果有代理(selector), 再获取一次special就会有setup, teardown方法。

			// If selector defined, determine special event api type, otherwise given type 			// 有时候我们只需要在事件代理时进行冒充, 比如FF下的focus, blur;
			type = ( selector ? special.delegateType : special.bindType ) || type;					// special.delegateType： 所有ie, opear11都支持focusout, focusin; safari, chrome只能用addEventListener添加事件, ff不支持focusout, focusin. focusout/focusi支持事件冒泡; focus/blur不支持事件冒泡。 chrome30, ie5.5, ff, safari6.1, opera11.5. onmouseenter, onmouseleave不支持冒泡。
																									// special.bindType：chrome30, ie5.5, ff, safari6.1, opera11.5. onmouseenter, onmouseleave不支持冒泡。
			// Update special based on newly reset type 											// 更新special对象
			special = jQuery.event.special[ type ] || {};
		
			// handleObj is passed to all event handlers 											// 构建一个事件描述对象
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first 										// 在events对象上分类储存事件描述
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];														// 创建一个type对象 handlers = events[ type ] = elemData.events[type] = jQuery._data( elem ).events[type]  {}.events.click.[]
				handlers.delegateCount = 0;															// 委托个数

				// Only use addEventListener/attachEvent if the special events handler returns false 		// 如果不存在special.setup(只有beforeunload, focusout, focusin, ready对象才有setup方法), 或者返回的是false才使用多投事件api。
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {  // setup是个分水岭, 为模拟事件冒泡而写的。 
					// Bind the global event handler to the element   										
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) { 								// 处理自定义事件
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front 	 		// 前面放代理事件, 后面放普通事件。
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization   		// 用于jQuery.event.trigger
			jQuery.event.global[ type ] = true; 
		}

		// Nullify elem to prevent memory leaks in IE  			// 防止ie内存泄露
		elem = null;
	},

	global: {},
	// 移除一个或多个类型的事件监听函数
	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},
	// 手动触发事件, 执行绑定的事件监听函数和默认行为，并且会模拟冒泡过程
	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes 						// 剔除 文本/注释节点
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}
		
		// Event object or event type 										
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now 	 // 不确保用focus/blur，还是代理的focusout/focusin, 两种都保存	
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces) 		// 如果事件类型以!结尾，则设置变量exclusive为true。  
			type = type.slice(0, -1);
			exclusive = true; 															
		}

		if ( type.indexOf( "." ) >= 0 ) { 												// 解释事件类型和命名空间
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) { 	// 如果未传入参数elem，表示要触发的是该类型的所有事件，但不会触发行内监听函数默认行为。
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string 				// 创建伪Event对象, 可以是一个事件click，对象{"type": "click.xxx.xxx!"}，或者事件字符串click.abc.abc
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event : 			// jQuery事件对象
			// Object literal
			new jQuery.Event( type, event ) : 			// 自定义事件对象 			 
			// Just the event type (string)
			new jQuery.Event( type );					// 事件类型

		event.type = type;																	// 统一修正为不含命名空间的事件类型
		event.isTrigger = true; 															// 指示是否只触发没有命名空间的监听函数
		event.exclusive = exclusive; 														// 命名空间
		event.namespace = namespaces.join( "." ); 											// 命名空间正则
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null; 			// 
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : ""; 								

		// Handle a global trigger 															// 如果没有指明触发者，遍历整个缓存系统
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused 									// 清掉result
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list 	// 把参数event，data封装为数组，当调用方法apply()时，数组将被作为第二个参数传入。
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );																

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {}; 										// 先调用修正对象的special.trigger()，来执行特殊的触发行为。
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) { 			
 			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951) 		
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]]; 									// 把当前元素elem放入到路径数组eventPath中，用来模拟事件传播的目标阶段。格式为[当前元素，事件类型]
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) { 			// 只有参数onlyHandlers不是true，并且当前事件允许冒泡，同时当前元素不是window对象，才会构造冒泡路径。

			bubbleType = special.delegateType || type; 										// 特殊事件(focusin/focus focusout/blur, mouseover/mouseenter mouseout/mouseleave);
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode; 			// 如果是focusinfocus, focusoutblur其中之一, 用当前元素，否则用父元素
			old = null;
			for ( ; cur; cur = cur.parentNode ) { 											// 模仿冒泡过程, 并记录冒泡路径
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM) 	// 判断到document，加到路径最后
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) { 		// 触发冒泡路径上的主监听函数和行内监听函数 

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" ); 		// 
			if ( handle ) {
				handle.apply( cur, data ); 																			// 执行事件, 去调用dispatch执行
			}
			// Note that this is a bare JS function and not a jQuery handler 										// 处理onXXX绑定的事件
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now 														// 触发默认行为
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) && 		 	
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event. 					
				// Can't use an .isFunction() check here because IE6/7 fails that test.								
				// Don't do default actions on window, that's where global variables be (#6170) 					
				// IE<9 dies on focus/blur to hidden element (#1486)												
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method 			
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type; 		// 
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}
		
		return event.result;
	},
	// 分发事件，执行事件监听函数
	dispatch: function( event ) {
		console.log('dispatch');
		// Make a writable jQuery.Event from the native event object 		// event对象进行兼容处理，修复鼠标点击事件
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),  		// 获取事件的缓存  {}.events.click
			delegateCount = handlers.delegateCount,												// 绑定次数
			args = [].slice.call( arguments, 0 ), 												// arguments转成数组
			run_all = !event.exclusive && !event.namespace,  									// 没有命名空间并且没有!
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event 				// 用伪event对象比用真event好
		args[0] = event;
		event.delegateTarget = this; 															// 用于事件代理

		// Determine handlers that should run if there are delegated events 					// 如果为事件代理，并且为左键的点击事件
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) { 	// 有代理事件和非中键和右键的代理 多个代理事件 $('body').delegate('.a', '...', fn), $('body').delegate('.b', '...', fn)

			// Pregenerate a single jQuery object for reuse with .is() 							// 预生成一个单独的jQuery对象，以便重用。
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this; 										

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {				// 从事件源开始，一直遍历所有祖先，直到绑定的点击事件祖先 ; 模拟事件冒泡
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) { 										// 使用事件代理的事件描述对象总是排在前面  有可能是同一个父节点为两个事件委派源。 $(".aaa.bbb"), $('body').delegate('.aaa', type, fn), $('body').delegate('.bbb', type, fn)
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) { 										// 创建selMatch[sel]属性, 是否匹配到 div(#id)?(.class)?  用于匹配父节点是否属于代理元素
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel ) // 换一种写法: 	e.target.className.indexOf(sel)
						);
					}
					if ( selMatch[ sel ] ) {													// 收集事件描述对象
						matches.push( handleObj );
					}
				}
				if ( matches.length ) { 														// 创建事件描述队列
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers 											// 加入普通事件
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us 					// 先跑代理事件, 它们可能会停止冒泡。
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem; 												// currentTarget绑定事件的元素, target委派事件元素; jQuery将其混为一体

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {  // 执行与此元素的所有与event.type同类型的回调 比如： $(ele).click(fn1) $(ele).click(fn2), $('body').delegate(sel, type, fn1) $('body').delegate(sel, type, fn2), sel指相同的元素。
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or 			// 过滤条件 1)为命名空间, 2)具有命名空间（的）一个子集或等于那些在绑定事件 3）有事件, 没有!
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {  

					event.data = handleObj.data;															   // 存储的data最终给了event
					event.handleObj = handleObj; 															   // 存储的handleObj最终给了event

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )   // 最后执行事件, 参数为event
							.apply( matched.elem, args );
					
					if ( ret !== undefined ) {  															   // return false, 一刀切。
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation(); 			
						}
					}
				}
			}
		}
		
		return event.result;
	},
	// 事件对象的公共属性
	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), 		// 共用的事件属性
	// 事件属性修正对象集
	fixHooks: {}, 		
	// 键盘事件对象的属性和修正方法
	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events 					
			if ( event.which == null ) {					// 如果which属性不存在，则依次尝试从可打印字符码charCode、虚拟按键码keyCode中读取。
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},
	// 鼠标事件对象的属性和修正方法
	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "), // button 在2级DOM事件模型中规定了左/中/右分别对应1/4/2。 buttons 在3级DOM事件模型中规定了左/中/右分别对应0/1/2。 clientX/clientY为窗口坐标; offsetX/offsetY为事件源坐标。 pageX/pageY为文档坐标; screenX/screenY为显示器坐标。fromElement对于mouseover/mouseenter来说是离开的元素, toElement对于mouseout/mouseleave来说是进入的元素。fromElement, toElement相当于relatedTarget。
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available 			
			if ( event.pageX == null && original.clientX != null ) { 			// 如果不支持pageX/pageY，手动计算它们
				eventDoc = event.target.ownerDocument || document; 				
				doc = eventDoc.documentElement;									
				body = eventDoc.body; 											

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 ); 	// 距文档左坐标pageX = 距窗口左坐标clientX + 水平滚动偏移 - 文档左边框厚度。
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );		// 距文档上坐标pageY = 距窗口上坐标clientY + 垂直滚动偏移 - 文档上边框厚度。
			}

			// Add relatedTarget, if necessary 									
			if ( !event.relatedTarget && fromElement ) { 						// 如果relatedTarget属性不存在，但fromElement存在。说明在IE9以下的浏览器触发了mouseover/mosuseout、mouseenter/mouseleave中的一种。
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement; 		// 如果fromElement等于target, 说明是触发了mouseout/mouseleave事件，relatedTarget从toElement中读取; 如果fromElement不等于target,说明是触发了mouseover/mouseenter事件，relatedTarget从fromElement中读取。
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right 		
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) { 				// 如果事件属性which不存在，并且有button属性时
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );    //  button的值左/中/右分别为1/4/2，which修正为左/中/右分别为1/2/3
			}

			return event; 												// 返回jQuery事件对象
		}
	},
	// 把原来事件对象封装为jQuery事件对象，并修正不兼容属性
	fix: function( event ) { 					// 定义jQuery.event.fix(event)方法，event可以为原生事件对象(3191 jQuery.event.dispatch(event))或者jQuery事件对象(3408 jQuery.event.simulate( type, elem, event, bubble ))。
		if ( event[ jQuery.expando ] ) {		// 如果参数event中含有jQuery.expando属性，说明event是一个jQuery事件对象。不再需要修正，直接返回。
			return event;
		}

		// Create a writable copy of the event object and normalize some properties 	// 创建一个可读的event对象副本并且规范一些属性
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},						// 尝试从事件属性修正对象集中jQuery.event.fixHooks中获取对应的专属事件修正对象。该对象集中存放了事件类型和修正对象映射，修正对象又含有属性props和修正方法filter()。其中props是一个数组，它存放了键盘事件或者鼠标事件的专属属性。filter用于修正不兼容的属性。
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props; 	// 合并公共事件属性和专属事件属性。this.props指向jQuery.event.props。

		event = jQuery.Event( originalEvent ); 						// 原生事件对象。调用构造函数将原生事件对象封装成jQuery事件对象。
 
		for ( i = copy.length; i; ) {								// 用for循环把合并后的事件对象复制到jQuery事件对象上。
			prop = copy[ --i ];										
			event[ prop ] = originalEvent[ prop ]; 					
		}
		
		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)		// 如果不支持target属性，尝试从原生事件对象上读取srcElement， 
		if ( !event.target ) {													
			event.target = originalEvent.srcElement || document; 				// IE6/7/8/Safari2 在onload事件下事件属性srcElement和target为null,统一修正为document对象。
		}

		// Target should not be a text node (#504, Safari) 						// 如果事件属性为文本节点，则修正为父元素
		if ( event.target.nodeType === 3 ) { 									
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8) 	// MetaKey是MIT键盘上的一个键，IE6/7/8下为undefined，修正为ctrl键
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event; 		// 调用jQuery事件属性对象修正方法fixHook.filter(event, originalEvent)修正特殊的属性。fixHook.filter(event, originalEvent)是jQuery.event.keyHooks.filter(event, original)或者是jQuery.event.mouseHooks.filter(event, original)
	},	
	// 事件修正对象集
	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},	
	// 模拟事件
	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) { 					// 构造函数 		src 可以是原生事件类型(3077, 3079 jQuery.event.trigger)、自定义事件类型(3077, 3079 jQuery.event.trigger(event, data, elem, onlyHandlers))、原生事件对象(3334, jQuery.event.fix(event))或jQuery事件对象
	// Allow instantiation without the 'new' keyword 		// 支持省略new操作符
	if ( !(this instanceof jQuery.Event) ) {				
		return new jQuery.Event( src, props );
	}
	
	// Event object 										// 事件对象。src值为对象, jQuery事件对象实例就多出originalEvent, isDefaultPrevented
	if ( src && src.type ) {								
		this.originalEvent = src;							// 备份原生事件对象
		this.type = src.type;								// 修正事件属性type	

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||		// 修正事件属性isDefaultPrevented. returnValue是ie特有, src.getPreventDefault是FF独有
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse; 		

	// Event type 											// 事件类型
	} else {
		this.type = src; 									
	}

	// Put explicitly provided properties onto the event object 			// 扩展自定义事件属性
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one 				// 修正时间戳，FF的问题，ie9以下的原生对象没有timeStamp属性
	this.timeStamp = src && src.timeStamp || jQuery.now();					

	// Mark it as fixed
	this[ jQuery.expando ] = true; 											// 设置标记
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html 
jQuery.Event.prototype = { 							// 原型对象
	preventDefault: function() {					// 阻止浏览器的默认行为
		this.isDefaultPrevented = returnTrue; 		// 把jQuery事件对象的方法isDefaultPrevented修正一个为总返回true的函数returnTrue()。方法isDefaultPrevented()用来判断是否在当前jQuery事件对象上调用过方法preventDefault(), 其初始值总返回false的函数returnFalse()。

		var e = this.originalEvent; 				
		if ( !e ) {									// 如果原生事件对象originalEvent不存在，说明当前对象是一个自定义事件对象, 浏览器没有默认的行为
			return;
		}

		// if preventDefault exists run it on the original event 			// 如果原生对象有preventDefault()方法，ie9+或者其它浏览器则调用
		if ( e.preventDefault ) { 		
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE) 		// 如果没有，则设置属性returnValue为false。
		} else {		
			e.returnValue = false;
		}
	},
	stopPropagation: function() { 					// 停止事件传播
		this.isPropagationStopped = returnTrue;		// 把jQuery事件对象的方法isPropagationStoped()方法修正为总是返回true的returnTrue()。方法isPropagationStopped()用来判断是否在当前jQuery事件对象上调用过方法stopPropagation(), 其初始值总是返回false的函数returnFalse()。

		var e = this.originalEvent; 				// 如果原生对象originalEvent不存在，说明当前对象是自定义事件对象，不会有事件传播行为。可以直接返回。
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) { 					// 检测原生事件对象是否有stopPropagation()方法，ie9+或者其它浏览器调用
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE) 		// 在调用stopPropagation()方法，IE9+，Opera，FireFox会同步为true，Chrome，safari仍为false。所以统一把cancalBubble设为true。
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {			// 立即停止事件传播和事件执行
		this.isImmediatePropagationStopped = returnTrue; 	// 把jQuery事件对象的isImmediatePropagationStopped()方法修正为总返回true的returnTrue函数。方法isImmediatePropagationStopped()用来判断是否在当前jQuery事件对象上调用过方法stopPropagation()，其初始值总返回false的函数returnFalse()。jQuery.event.dispatch(event)方法会检测isImmdiatePropagationStopped()的状态。
		this.stopPropagation();						// 调用stopPropagation()方法停止事件传播
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};
// 初始化事件 mouseenter, mouseleave, submit, change, focus, blur对应的修正对象
// Create mouseenter/leave events using mouseover/out and event-time checks 		// jQuery不管支不支持mouseenter/mouseleavr,都用mouseover/mouseout来模拟。但模拟的mouseenter/mouseleave会支持事件冒泡。
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target. 			// 判断进入的节点与绑定的节点不相等并且不存在包含
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation 		
if ( !jQuery.support.submitBubbles ) { 		// 如果测试项jQuery.support.submitBubbls为false。
	
	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events 	 	 // 如果当前元素是form元素，则返回false。
			if ( jQuery.nodeName( this, "form" ) ) { 				 
				return false;
			}
			
			// Lazy-add a submit handler when a descendant form may potentially be submitted 						// 懒惰的添加一个提交处理程序时，可能会提交的后裔形式
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) { 			// 绑定委托元素(document, window, body等)
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined; 
				if ( form && !form._submit_attached ) { 										// 已绑定状态
					jQuery.event.add( form, "submit._submit", function( event ) { 				// 绑定form
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true ); 	// 只模拟冒泡，但并没有触发事件
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix 		
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click 		// IE直到离开焦点后才派发事件; 要模拟它必须在propertychange后. 
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};
			// console.log("attaches");
		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true ); 		// 因为focus不支持冒泡。所以用捕获来模拟委托行为。
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}
// 公开方法
jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {			// 统一的事件绑定方法
		var origFn, type; 

		// Types can be a map of types/handlers  	
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )		// 如果是types为对象, selector, data这三个参数的情况
			if ( typeof selector !== "string" ) {
				// ( types-Object, data ) 			// 如果selector不是字串符，那变成types-object, undefined, selector;
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {					// 遍历types，递归调用方法.on(type, selector, data, types[type], one)绑定事件
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}
		// 根据参数类型修正参数
		if ( data == null && fn == null ) { 		// .on(types, fn)
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {   
				// ( types, selector, fn )			// .on(types, selector, fn)
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn ) 				// .on(types, data, fn)
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {						// 如果参数为false, 修正为总返回false的函数returnFalse()
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {							// 一次回调
			origFn = fn;							// 备份传入的参数fn到变量origFn
			fn = function( event ) {				// 修改fn
				// Can use an empty set, since event contains the info
				jQuery().off( event );				// 先移除事件
				return origFn.apply( this, arguments );		// 再触发事件
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ ); 	// 最后设置将传入的参数origFn和新函数fn设置成相同的唯一标识guid。在查找和移除监听函数时，将通过这个唯一标识来匹配监听函数。
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector ); 	// 
		});
	},
	one: function( types, selector, data, fn ) { 					// 用于匹配每个元素集合中的每个元素绑定一个或者多个类型的监听函数，每个监听函数在每个匹配的元素上最多执行一次。
		return this.on.call( this, types, selector, data, fn, 1 ); 
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) { 	// preventDefault存在，说明types参数是一个事件对象。handleObj属性存在，说明types参数是一个被jQuery.event.dispatch(event)分发的jQuery事件对象
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj; 						// 获出jQuery事件对象types.handleObj
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type, 		//  
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) { 		// 
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});
// 便捷方法
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks; 		// 初始化键盘事件对应的属性修正对象
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks; 	// 初始化鼠标事件对应的属性修正对象
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];								// 如果未传入参数results，则默认为空数组[]。			
	context = context || document;							// 如果未传入参数context，则默认为document。

	var origContext = context; 								// 备份context上下文。

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) { 	// 如果context不是元素，也不是document。
		return [];												// 返回空数组
	}
	
	if ( !selector || typeof selector !== "string" ) {		// 如果selector是空字符串或者不是字符串。
		return results;										// 返回results。
	}

	var m, set, checkSet, extra, ret, cur, pop, i, 			// set候选集;checkSet映射集;extra用于存储选择器第一个逗号之后的其他并列表达式;ret从右到左执行方式中用到，存放sizzle.find对最后一个块表达式的查找结果，格式为{expr: .., set: array}; pop表示单个表达式;
		prune = true,										// prune表示候选集是否要筛选，如果表达式只有一个块表达式，则变量prune为false; 
		contextXML = Sizzle.isXML( context ), 				// contextXML表示上下文是否是XML文档; parts存放了正则chunker从选择器表达式中提取
		parts = [], 										// 存放了正则chunker从选择器表达式中提取的块表达式和块间关系符。
		soFar = selector;									// 用于保存chunker每次从选择器表达式中提取了块表达式和块间关系符后的剩余部分，初始值为完整的选择器表达式。
	
	// Reset the position of the chunker regexp (start from head) 		将开始的选择器的块表达式或块间关系符放入到parts数组中
	do {
		chunker.exec( "" ); 								// 重置正则chunker的开始匹配位置
		m = chunker.exec( soFar );							// 每次匹配选择器表达式selector的结果

		if ( m ) { 											// 
			soFar = m[3];
		
			parts.push( m[1] ); 							// 将第一个分组中的块表达式或块间关系符插入数组parts中。
		
			if ( m[2] ) { 									// 如果第二个分组中不是空字符串，表示接下来的是一个并列选择器表达式。
				extra = m[3]; 								// 保存第三个分组在extra中。
				break;
			}
		}
	} while ( m ); 											 
																		// nth|eq|gt|lt|first|last|even|odd
	if ( parts.length > 1 && origPOS.exec( selector ) ) { 		 		// 如果存在块间关系符(即相邻的块表达式之间有依赖关系)和位置伪类，则从左向右查找。例如: $('div p:first');
 	
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) { 		// 如果数组parts中只有两个元素，并且第一个元素是块间关系符。 $(">p:first")
			set = posProcess( parts[0] + parts[1], context, seed ); 	// 则可以调用posProcess(selector, context, seed)来查找匹配的元素集合。

		} else { 	
			set = Expr.relative[ parts[0] ] ? 							// 否则数组parts中有三个元素或三个元素以上。如果数组parts第一个元素是块间关系符，
				[ context ] : 											// 则直接把参数context作为第一个上下文集合。
				Sizzle( parts.shift(), context ); 						// 否则调用Sizzle(selector, context)方法查找匹配元素集合，得到第一个上下文集合。

			while ( parts.length ) {									// 从左向右遍历数组parts中的其他块表达和块间关系符
				selector = parts.shift();								// > 

				if ( Expr.relative[ selector ] ) {						// 如果存在块间关系符
					selector += parts.shift();							// 则加上后面的块表达式
				}
				
				set = posProcess( selector, set, seed );				// 调用posProcess(selector, context, seed)来查找匹配元素集合。再将返回值赋值给变量set，作为下一个块表达式的上下文。
			}
		}

	} else { 
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) { 		// 如果第一个块选择器是ID类型(即格式为#id)，并且最后一个块选择器不是ID类型，则修正上下文context为第一个块选择器匹配的元素。

			ret = Sizzle.find( parts.shift(), context, contextXML ); 									// 简单查找第一个块表达式
			context = ret.expr ?																		// 如果还有剩余部分 例如: #div.div
				Sizzle.filter( ret.expr, ret.set )[0] : 												// 再对结果进行查找，取匹配元素集合的第一个元素作为后续查找的上下文
				ret.set[0];
		}

		if ( context ) {																				// 
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ? 																			// 得到候选集
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {																	// 如果parts.length大于0，说明还有块表达式或块间关系符
				checkSet = makeArray( set );															// 创建一份副本，并赋值给checkSet，作为映射集。

			} else {
				prune = false;																			// 将prune设为false, 不需要对候选集set进行筛选。	
			}

			while ( parts.length ) {																	// 遍历数组parts中剩余的块表达式和块间关系符，调用块间关系符在Sizzle.selector.relative中对应的过滤函数
				cur = parts.pop();																		// cur表示块间关系符，默认为后代关系符
				pop = cur; 																				// pop表示块间关系符左侧的表达式。作为映射集checkSet的上下文

				if ( !Expr.relative[ cur ] ) {															// 如果cur不是块间关系符
					cur = "";																			// 则置为空字符串
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {																	// 如果仍然未找到前一个块表达式pop，说明已经到达数组头部																
					pop = context;																		// 则默认为context
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML ); 										// 将与左侧块表达式pop不匹配的元素替换为false。
			}

		} else {
			checkSet = parts = [];																		// 
		}
	}

	if ( !checkSet ) {												// 如果没有映射集
		checkSet = set;												// 设置候选集和映射集指向同一个数组
	}

	if ( !checkSet ) {												// 
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) { 			// 如果映射集是数组
		if ( !prune ) {												// 如果变量prune为false,则不需要筛选候选集set
			results.push.apply( results, checkSet ); 				// 直接将checkSet加入到results中

		} else if ( context && context.nodeType === 1 ) {			// 如果上下文是元素，而不是文档对象
			for ( i = 0; checkSet[i] != null; i++ ) {				// 遍历映射集
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {  	// 是true; 是元素，并且包含在上下文context中。
					results.push( set[i] ); 						// 将候选集set中对应的元素放入结果集results。
				}
			}

		} else { 														// 如果上下文是文档对象
			for ( i = 0; checkSet[i] != null; i++ ) {					// 遍历映射集
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) { 		// 如果不是null，并且是元素
					results.push( set[i] );								// 则将候选集set中对应的元素放入结果集results中
				}
			}
		}

	} else {
		makeArray( checkSet, results ); 								// checkSet可能不是数组，可能是NodeList。不需要筛选候选集set。checkSet和set指向同一个数组，直接将checkSet插入到结果集中。
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed ); 					
		Sizzle.uniqueSort( results );									// 对元素集合中的元素排序，去重。
	}

	return results; 													// 返回结果集。
};

Sizzle.uniqueSort = function( results ) {								
	if ( sortOrder ) {													
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );										// 重新排序

		if ( hasDuplicate ) {											// 如果有重复的元素
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {				// 去掉
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {								// 使用指定的表达式expr对元素集合set过滤
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {						// 检测某个元素node是否匹配表达式expr
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) { 			// expr块表达式, context上下文, isXML布尔值, 指示是否运行在一个XML文档中。 在上下文context中查找对应的表达式元素
	var set, i, len, match, type, left;

	if ( !expr ) { 											// 如果块表达式为空字符串
		return [];											// 返回空数组
	}														

	for ( i = 0, len = Expr.order.length; i < len; i++ ) { 			
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) { 		// 检查每个表达式类型type在Sizzle.selector.leftMatch中对应的正则是否匹配块表达式expr，如果匹配，则可以确定块表达式的类型。
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {		// 反斜杠之后的字符串被转义，不是期望的类型。
				match[1] = (match[1] || "").replace( rBackslash, "" );			// 过滤反斜杠
				set = Expr.find[ type ]( match, context, isXML );	// 查找匹配的元素集合

				if ( set != null ) {								
					expr = expr.replace( Expr.match[ type ], "" );	// 块表达式删除已匹配的部分
					break;
				}
			}
		}
	}

	if ( !set ) { 													// 如果没有找到，则查找上下文所有后代元素
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };								// 返回{ set: 候选集, expr: expr }
};

Sizzle.filter = function( expr, set, inplace, not ) { 				
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {											// 用表达式expr过滤元素集合set，直到expr变为空字符串
		for ( type in Expr.filter ) {										// 遍历块过滤函数集Sizzle.selector.filter中定义了PSEUDO, CHILD, ID, TAG, CLASS, ATTR, POS对应的过滤函数
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) { 			
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) { 			// 如果匹配正则的内容以反斜杠"\\"开头, 表示反斜杠"\\"之后的字符被转义了，不是期望的类型，这时会认为类型匹配失败。
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {								
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );		// 调用预过滤函数

					if ( !match ) {											// 结果为false, 已经执行了过滤
						anyFound = found = true;

					} else if ( match === true ) {							// 结果为true, 还需要继续执行预过滤
						continue;
					}
				}

				if ( match ) {												
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {		// 遍历元素集合curLoop, 对其中的每个元素执行过滤, 检测元素是否匹配。
						if ( item ) {
							found = filter( item, match, i, curLoop );		// 变量found表示当前元素是否匹配过滤表达式
							pass = not ^ found; 

							if ( inplace && found != null ) {				// 如果inplace为true, 则将与块表达式expr不匹配的元素设置为false; 
								if ( pass ) {								// 
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {							// 如果参数inplace为true, 则重新构造一个元素数组, 只保留匹配元素, 即会不断地缩小元素集合。
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {								// 如果found不等于undefined				
					if ( !inplace ) {
						curLoop = result;									// 则将新构建的元素数组赋值给变量curLoop
					}

					expr = expr.replace( Expr.match[ type ], "" );			// 删除块表达式expr已过滤的部分

					if ( !anyFound ) {										// 
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {										// 
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {										// 如果elem是元素或者是document		
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {								// 则尝试读取属性textContent或者innerText
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {			// 遍历子元素来获取每个子元素的文本内容并合并
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) { 								// 如果是text节点或者是CDATASection节点
			return elem.nodeValue;														// 直接返回nodeValue属性
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {											// 元素集合, 遍历每个元素
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {												// 不是注释
				ret += getText( node );													// 积加文本
			}
		}
	}
	return ret;																			// 返回合并后的文本内容
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],				

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, 										// 匹配简单表达式"#id", 并解析"#"后面的字符串
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,									// 匹配简单表达式".class", 并解析"."后面的字符串
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,					// 匹配属性表达式"[name="value"]"
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,		// 匹配表达式"[attribute="value"]", 并解析属性名和属性值
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,									// 匹配简单表达式, 并解析标签名 
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/, 			// 匹配子元素的伪类表达式，并解析子元素伪类为伪类参数
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,		// 匹配位置伪类表达式, 并解析位置伪类和伪类参数
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/				// 匹配伪类表达式, 并解析伪类, 引号, 伪类参数
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){									
			var isPartStr = typeof part === "string",							
				isTag = isPartStr && !rNonWord.test( part ),			
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {							// 遍历映射集
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}			// 获取前一个元素, 包含文本节点

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?		// 如果没找到兄弟元素，则设置为false。如果找到兄弟元素，并且参数part是标签，则检查兄弟元素的节点名称nodeName是否与之相等，如果相等则替换为兄弟元素，不相等则替换为false。如果找到兄弟元素，并且part是Dom元素, 如果两者相等则替换为true, 不相等则为false。
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {											// 如果参数part是非标签字符串
				Sizzle.filter( part, checkSet, true );							// 则调用Sizzle.fitler(part, checkSet, true);
			}
		},

		">": function( checkSet, part ) {										
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {						// 如果参数part是标签，则遍历映射集checkSet
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {											// 遍历映射集
					elem = checkSet[i];											// 

					if ( elem ) {												// 如果查到这个元素
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false; 			// 如果父元素的节点名称与part相等，则替换为父元素，不相等替换为false。
					}
				}

			} else {															// 如果参数part不是标签,则可能是非标签字符串或DOM元素
				for ( ; i < l; i++ ) {
					elem = checkSet[i]; 										// 

					if ( elem ) {												// 如果查到这个元素
						checkSet[i] = isPartStr ?								// 如果参数part是标签字符串
							elem.parentNode : 									// 则替换为父元素
							elem.parentNode === part; 							// 如果父元素与part参数相等，替换为true，否则为false
					}
				}

				if ( isPartStr ) {												// 如果part是标签字符串
					Sizzle.filter( part, checkSet, true ); 						// 调用Sizzle.filter(part, checkSet, true)来查找
				}
			}
		},

		"": function(checkSet, part, isXML){ 									
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;													// 将dirCheck函数赋值给checkFn

			if ( typeof part === "string" && !rNonWord.test( part ) ) { 		 	// 如果参数part是标签字符串
				part = part.toLowerCase();											// 将part小写
				nodeCheck = part; 													// 将dirNodeCheck函数赋值给checkFn
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML ); 	// 如果part是非标签字符串或DOM元素，则调用函数dirCheck(); 如果是标签字符串, 则调用函数dirNodeCheck()
		},

		"~": function( checkSet, part, isXML ) {									
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML ); 	// 
		}
	},

	find: {
		ID: function( match, context, isXML ) {											// 查找拥有指定id的第一个元素
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {												// 查找拥有指定name的元素集合
			if ( typeof context.getElementsByName !== "undefined" ) {					
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {												// 查找拥有指定tag的元素集合
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {				// 预过滤函数集
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {				// 过滤不匹配的元素, 或缩小元素集合
			match = " " + match[1].replace( rBackslash, "" ) + " ";						// 替换"\\", 前后加上空格

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) { 			// 异或运算符
						if ( !inplace ) { 				// 过滤通过时, 并且inplace不为true, 则将匹配元素放入元素集合result中
							result.push( elem );
						}

					} else if ( inplace ) {				// inplace为true, 则将不匹配的元素替换为false
						curLoop[i] = false;
					}
				}
			}

			return false;								// 表示已经执行过滤, 或已缩小候选集。
		},

		ID: function( match ) {							// 过滤反斜杠, 从匹配结果中提取并返回id值
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {				// 过滤反斜框, 转换为小写
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {						// 将mathc[2]的伪类参数格式化为first * n + last形式
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, ''); 			// 替换伪类开头的加号和包含的空格

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec( 			// 将even, odd转成 2n + last 或者将数字转成 0n + 数字的形式。含有三个分组：负号, first部分, last部分
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;				// 计算first部分
				match[3] = test[3] - 0;									// 计算last部分
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;											// 分配唯一标识

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {	// 属性预过滤函数	 
			var name = match[1] = match[1].replace( rBackslash, "" );	// 删除转义反斜杠
			
			if ( !isXML && Expr.attrMap[name] ) {						// 修正某些特殊属性名
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );	// 当属性值表达式的属性值有引号时, 属性值存储在match[4]

			if ( match[2] === "~=" ) {									// 选择具有att属性且属性值为一用空格分隔的字词列表
				match[4] = " " + match[4] + " ";
			}

			return match;												
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {		// 
			if ( match[1] === "not" ) {									// 如果伪类是:not(selector)
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) { 		// 将匹配结果match中的分组3 selector
					match[3] = Sizzle(match[3], null, null, curLoop); 								// 替换为与之匹配的元素集合

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);				// 在对应的过滤函数中，会筛选出不在分组3中的元素。

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {	// 如果是位置伪类POS或子元素伪类CHILD，则返回true。
				return true;
			}
			
			return match;
		},

		POS: function( match ) {														// 在match头部插入新元素true, 从而与伪类的匹配结果保持一致
			match.unshift( true );

			return match;
		}
	},
	
	filters: {			// 伪类过滤函数
		enabled: function( elem ) {														// 匹配所有可用元素
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {													// 匹配所有不可用元素
			return elem.disabled === true;
		},

		checked: function( elem ) {														// 匹配所有被选中的元素
			return elem.checked === true;
		},
		
		selected: function( elem ) {													// 匹配所有被选中的option元素
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {														// 匹配所有含有子元素或文本的元素
			return !!elem.firstChild;
		},

		empty: function( elem ) {														// 匹配所有不包含子元素或文本的空元素
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {												// 匹配含有选择器所匹配元素的元素
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {														// 匹配h1, h2, h3之类的标题元素
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {														// 匹配所有单行文本框
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {														// 匹配所有单选按钮
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {													// 匹配所有复选框
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {														// 匹配所有文件域
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {													// 匹配所有密码框
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {														// 匹配所有提交按钮
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {														// 匹配所有图像域
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {														// 匹配所有重置按钮
			var name = elem.nodeName.toLowerCase();	
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {														// 匹配所有按钮
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {														// 匹配所有input框
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {														// 匹配当前所有焦点元素
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {			// 位置伪类过滤函数集
		first: function( elem, i ) {													// 匹配找到第一个元素
			return i === 0;
		},

		last: function( elem, i, match, array ) {										// 匹配找到最后一个元素
			return i === array.length - 1;
		},

		even: function( elem, i ) {														// 匹配所有下标为偶数为元素, 从0开始计算
			return i % 2 === 0;
		},

		odd: function( elem, i ) {														// 匹配所有下标为奇数为元素, 从0开始计算
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {												// 匹配所有小于指定下标的元素
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {												// 匹配所有大于指定下标的元素
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {												// 匹配指定下标的元素, 从0开始计算
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {												// 匹配指定下标的元素, 从0开始计算
			return match[3] - 0 === i;
		}
	},
	filter: {		
		PSEUDO: function( elem, match, i, array ) {										// match有三个分组。伪类, 引号, 伪类参数。检查元素是否匹配伪类
			var name = match[1],
				filter = Expr.filters[ name ];											// 如果在伪类过滤函数集Sizzle.selectors.filters中存在对应的伪类过滤函数, 则调用它来检查元素是否匹配伪类。

			if ( filter ) {																
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {											// 用于匹配包含指定文本的所有元素
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {												// 伪类:not(selector)用于匹配指定选择器不匹配的所有元素
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {											// 检查当前元素是否与match[3]中某个元素相等, 如果相等则返回false。
						return false;
					}
				}

				return true;															// 否则返回true

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {												// match有三个分组, 
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {															// 用first-child和last-child来检查当前元素是否有兄弟元素, 有则返回false, 无则返回true
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {							// 如果伪类是:first-child, 则检查当前元素之前(previousSibling)是否有兄弟元素
						if ( node.nodeType === 1 ) { 									// 有则返回false
							return false; 
						}
					}

					if ( type === "first" ) { 											// 无则返回true
						return true; 
					}

					node = elem;														

				case "last":
					while ( (node = node.nextSibling) )	 {								// 如果伪类是:last-child, 则检查当前元素之后(nextSibling)是否有兄弟元素
						if ( node.nodeType === 1 ) { 									// 有则返回false
							return false; 
						}
					}

					return true;														// 无则返回true

				case "nth":
					first = match[2];													
					last = match[3];

					if ( first === 1 && last === 0 ) {									// 如果first部分为1, last为0, 返回true
						return true;
					}
					
					doneName = match[0];												
					parent = elem.parentNode;											// 找到当前元素的父元素, 然后为每个子元素设置
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {	// 如果当前元素的父元素未被本次过滤标识过, 或当前元素未被标识过，才会为子元素设置属性nodeIndex
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;								// 为每个子元素设置属性nodeIndex，从而标识出每个子元素的下标位置。
							}
						} 

						parent[ expando ] = doneName;									// 标识父元素
					}
					
					diff = elem.nodeIndex - last;										

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );				
					}
			}
		},

		ID: function( elem, match ) {													// 
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],														// 变量name是指定的属性名
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?														// 
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {										// 用于检查元素是否匹配位置伪类
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {							// 
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );			// 为对象Sizzle.selectors.match中的正则增加一段后缀正则/(?![^\[]*\])(?![^\(]*\))/, 
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );			// 捕获反斜杠, 以支持将特殊字符作为普通字符使用
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {												// 如果a等于b, 设置hasDuplicate为true
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {					
			return a.sourceIndex - b.sourceIndex;						// 比较元素位置
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {											// 如果父元素相等, 说明是兄弟元素
			return siblingCheck( a, b );								// 调用siblingCheck(a, b)比较

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {											// 如果a没有父元素, 说明a不在文档内, 那么a排在b之前
			return -1;

		} else if ( !bup ) {											// 如果b没有父元素, 说明b不在文档内, 那么b排在a之前
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {													// 如果a有父元素
			ap.unshift( cur );											// 加入ap队列
			cur = cur.parentNode;										// cur设置为父元素
		}

		cur = bup;														// 

		while ( cur ) {													// 如果b有父元素
			bp.unshift( cur );											// 加入bp队列
			cur = cur.parentNode;										// cur设置为父元素
		}

		al = ap.length;													
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {						// 从最顶层的祖先元素向下遍历 
			if ( ap[i] !== bp[i] ) {									// 如果祖先元素ap[i]与bp[i]不是同一个元素, 那么它们必然是兄弟元素。
				return siblingCheck( ap[i], bp[i] );					// 调用siblingCheck(a, b)确定它们的位置关系
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?												// 如果a元素的深度小, 说明a元素与b的祖父元素是兄弟元素或是同一个元素;否则b元素的深度小, 说明b元素与a的祖父元素是兄弟元素或是同一个元素。
			siblingCheck( a, bp[i], -1 ) : 								// 则调用siblingCheck(a, b, -1);
			siblingCheck( ap[i], b, 1 );								// 则调用siblingCheck(a, b, 1);
	};

	siblingCheck = function( a, b, ret ) {								// 比较兄弟元素的位置
		if ( a === b ) {												// 如果a等于b, 则返回ret
			return ret;
		}

		var cur = a.nextSibling;										

		while ( cur ) {													// 向后遍历a的兄弟元素
			if ( cur === b ) {											// 如果找到与b相等, 说明a的位置比b靠前
				return -1;												// 返回-1
			}

			cur = cur.nextSibling;
		}

		return 1;														// 如果没有找到，返回1
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( !document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
		
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {							// 检查某个元素node是否匹配选择器表达式expr
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");					// 

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){																		// 测试当前浏览器是否正确支持方法getElementByClassName()
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");												// 如果支持，向Sizzle.selectors.order中插入"CLASS"						
	Expr.find.CLASS = function( match, context, isXML ) {							// 向Sizzle.selectors.find中插入CLASS查找方法
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {		// 
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {				// 如果找到节点名称nodeName与参数cur相等，则其值变为找到的元素。
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {					// 如果参数cur是DOM元素, 则直接检查找到的元素
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) { 						// 如果遇到已经检查过的元素
					match = checkSet[elem.sizset];							// 则直接取该元素在候选集checkSet中对应位置上的元素，避免重复查找
					break;
				}

				if ( elem.nodeType === 1 ) {								// 如果是DOM元素
					if ( !isXML ) {											// 并且不是XML文档 
						elem[ expando ] = doneName;							// 设置elem的expando属性为doneName
						elem.sizset = i;									// sizset属性为i
					}

					if ( typeof cur !== "string" ) {						 
						if ( elem === cur ) {								// 如果参数cur是DOM元素
							match = true;									// 直接检查找到的元素是否与之相等。
							break;	
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {	// 如果参数是字符串, 则调用Sizzle.filter(selector, checkSet)过滤
						match = elem;
						break;
					}
				}

				elem = elem[dir];											// elem替换为父元素
			}

			checkSet[i] = match;											// 替换映射集checkSet中对应位置的元素。
		}
	}
}

if ( document.documentElement.contains ) {									// Sizzle.contains(a, b)检测元素a是否包含元素b
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) { 							// 参数selector，包含块表达式和块间关系符; context为查找上下文;
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context; 							// 修正上下文

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) { 					// 匹配所有的伪类
		later += match[0];														// 积计到变量later中
		selector = selector.replace( Expr.match.PSEUDO, "" );					// 删除选择器所有伪类
	}

	selector = Expr.relative[selector] ? selector + "*" : selector; 			// 如果selector只块间关系符，则会匹配到相应的方法。利用有没有函数来判断selector后面还有没块间表达式。如果块间关系符后面没有块表达式，则补上通配符。否则说明有块表达式。

	for ( var i = 0, l = root.length; i < l; i++ ) {							// 遍历上下文数组
		Sizzle( selector, root[i], tmpSet, seed );								// 调用Sizzle(selector, context, set, seed)方法查找删除伪类后的选择器表达式匹配的元素集合，并将结果合并到数组tmpSet中。
	}

	return Sizzle.filter( later, tmpSet );										// 调用Sizzle.filter(later, tmpSet)过滤元素集合tmpSet，并返回一个新数组，其中只包含了过滤后的元素集合。
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) { 								// selector可以是jQuery对象, DOM元素, 字符串
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {					// jQuery对象或DOM元素
			return jQuery( selector ).filter(function() {		// 统一封装成jQuery对象, 再调用filter检查其中的元素是否当前jQuery对象中某一个元素的后代元素, 如果是则保留，不是过滤。
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),		// 调用pushStack()方法构造一个新的jQuery空对象。
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {			// 遍历当前元素
			length = ret.length;
			jQuery.find( selector, this[i], ret ); 				// 调用Sizzle(selector, context, results, seed)查找匹配的后代元素, 并将查找结果合并, 去重

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {									// 返回一个新jQuery对象，其中只保留与参数selector匹配的元素
		var targets = jQuery( target );	
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) { 								// 返回一个新jQuery对象，其中只保留与参数selector匹配的元素
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {								// 返回一个新jQuery对象，其中只保留与参数selector匹配的元素
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {								
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {					// 当前匹配元素集合和它们的祖先元素中查找与参数selector匹配的最近元素, 并用查找结果构造一个新jQuery对象
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {								// 判断元素在元素集合中的下标位置

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {					// 用当前jQuery对象中的元素和传入的参数构造一个新的jQuery对象
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({																// 遍历函数
	parent: function( elem ) { 												
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null; 			// 返回父元素, 过滤文档碎片
	},
	parents: function( elem ) {												
		return jQuery.dir( elem, "parentNode" );							// 调用工具函数jQuery.dir(elem, dir, until)返回指定的所有祖先元素
	},
	parentsUntil: function( elem, i, until ) { 								
		return jQuery.dir( elem, "parentNode", until ); 					// 调用工具函数jQuery.dir(elem, dir, until)返回指定DOM元素的祖父元素，直到遇到匹配参数until的元素为止。
	},
	next: function( elem ) {												
		return jQuery.nth( elem, 2, "nextSibling" );						// 返回指定元素下一个兄弟元素。
	},
	prev: function( elem ) {												
		return jQuery.nth( elem, 2, "previousSibling" );					// 返回指定元素前一个兄弟元素。
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );							// 返回指定元素之后所有兄弟元素
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );						// 返回指定元素之前所有兄弟元素
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );					// 返回指定元素之后的兄弟元素，直到遇到匹配参数until的元素为止。
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );				// 返回指定元素之前的兄弟元素，直到遇到匹配参数until的元素为止。
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem ); 			// 返回指定元素的所有兄弟元素。
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );							// 返回指定元素的所有子元素
	},
	contents: function( elem ) {											
		return jQuery.nodeName( elem, "iframe" ) ?							// 返回指定DOM元素的子节点，或者返回iframe元素的document对象。
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) { 													
	jQuery.fn[ name ] = function( until, selector ) {						// until用于过滤查找停止的位置, selector用于过滤找到的元素
		var ret = jQuery.map( this, fn, until );							// 遍历一个元素，对每个元素调用遍历函数fn，并将遍历函数fn的返回值放入一个新的数组中。

		if ( !runtil.test( name ) ) { 										// 检查遍历函数名是否以Until结尾，如果不是，模板函数的参数格式是jQuery.fn[name](selector), 如果是，模板函数的参数格式是jQuery.fn[name](until, selector)
			selector = until;
		}

		if ( selector && typeof selector === "string" ) { 					// 如果是字符串
			ret = jQuery.filter( selector, ret );							// 过滤数组ret中的元素，保留与selector匹配的元素。
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret; 			// 如果只有一个元素，不进行排序和去重。遍历函数children(elem), contents(elem), next(elem),prev(elem)的返回值，也是序唯一的。不需要执行排序和去重。

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {	// 对于过滤函数parents(elem), prevUtil(elem, i, until)，prevAll(elem)。对找到的元素数组ret进行倒序排序，即元素按照由近到远的顺序倒着返回。
			ret = ret.reverse(); 											// 倒序排序，元素按由近到远的顺序返回
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );		// 用找到的元素数组ret构造新jQuery对象并返回。
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) { 							// expr表达式, elems待过滤元素, not为true，则保留不匹配元素, 默认保留匹配元素
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [], 											
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) { 			// 沿着方向dir迭代遍历，将找到的Element节点放入数组matched中。
				matched.push( cur );
			}
			cur = cur[dir];							
		}
		return matched;								// 最后返回matched
	},

	nth: function( cur, result, dir, elem ) {		// 
		result = result || 1;						// 
		var num = 0;

		for ( ; cur; cur = cur[dir] ) { 			// 从起始元素cur出发，沿着方向dir迭代遍历，查找该方向上的第result个Element节点
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;									// 返回找到的节点，没找到返回null
	},

	sibling: function( n, elem ) { 					
		var r = [];

		for ( ; n; n = n.nextSibling ) {			// 从起始元素n出发，沿着方向nextSibling查找紧接的兄弟元素，
			if ( n.nodeType === 1 && n !== elem ) { 		// 是节点元素，并且排除elem元素
				r.push( n );						// 将结果加入到r
			}
		}

		return r;									// 返回r
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;											// 

	if ( jQuery.isFunction( qualifier ) ) {								// 如果参数qualifier是函数, 
		return jQuery.grep(elements, function( elem, i ) {				// 调用jQuery.grep(elems, callback, inv)遍历元素集合elements, 在每个元素上执行该函数, 然后将返回值与参数keep进行比较，如果一致则保留，不一致则丢弃。
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {									// 如果参数qualifier是函数,
		return jQuery.grep(elements, function( elem, i ) {				// 调用方法jQuery.grep(elems, callback, inv)遍历元素集合elements，将elem值与参数值qualifer比较, 再将返回值与参数keep进行比较, 如果一致则保留, 不一致则丢弃。
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {						// 如果参数qualifier是字符串
		var filtered = jQuery.grep(elements, function( elem ) {			// 先过滤出元素	
			return elem.nodeType === 1;									
		});

		if ( isSimple.test( qualifier ) ) {								// 如果是".xxx"，调用jQuery.filter直接过滤匹配qualifier参数的元素
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );			// 否则
		}
	}

	return jQuery.grep(elements, function( elem, i ) {					// 再调用jQuery.grep方法遍历elements，检查每个元素是否在qualifier队列中, 再将结果与keep比较, 一致就则保留, 不一致则丢弃
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, 								// checked|checeked='checked'|checked="checked"|checked= 'checked'|checked= "checked"|checked ='checked'|checked ="checked"
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) { 					// 函数的情况，先执行该函数，返回值作为新文本内容，迭代调用方法.text(text)
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) { 		// 不是对象，也不是undefined
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) ); 	// 先清空内容，创建文本节点插入并插入匹配元素中。
		}

		return jQuery.text( this );					// 获取所有元素的合并后的文本内容
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) { 					// 如果是函数
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) ); 	// 先调用该函数
			});
		}

		if ( this[0] ) { 									
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true); 		// 创建含有包裹元素的jQuery对象

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] ); 								// 把wap放在this[0]前面
			}

			wrap.map(function() { 											// 用.map()方法找到最底层的元素，
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this ); 												// 然后把当前匹配元素集合插入最内层元素中
		}

		return this;
	},

	wrapInner: function( html ) { 											// 如果是函数
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) ); 				// 取其返回值作为包裹元素，迭代调用.wrapInner();
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents(); 	 							// 取匹配元素集合的所有子元素

			if ( contents.length ) {  										// 如果有子元素
				contents.wrapAll( html );									// 将html转成DOM元素，调用.wrapAll()将子元素放入它里面

			} else {
				self.append( html ); 										// 没有子元素，直接调用.append()放入匹配元素中
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html ); 		// html是函数，马上执行，取返回值作为wrapAll方法的第一个参数，调用wrapAll。
		});
	},

	unwrap: function() { 												// 去掉非body的父元素
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) { 					// 如果父元素不是body
				jQuery( this ).replaceWith( this.childNodes );			// 匹配元素调用.replaceWith，使其父元素的所有子元素替代父元素
			}
		}).end(); 														// 返回匹配元素
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {		// 用于在每个匹配元素集合中末尾插入指定的内容。
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) { 		// 用于在每个匹配元素集合中头部内容插入指定的内容。
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {												// 用于在每个匹配元素集合中前面插入指定的内容。
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {								// 对于没有父元素的元素，调用clean()将字符串转成DOM元素
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );						// 将当前匹配元素集合合并到转换后的DOM数组之后
			return this.pushStack( set, "before", arguments );			// 用合并后的DOM元素数组构造成新jQuery对象并返回
		}
	},

	after: function() {											
		if ( this[0] && this[0].parentNode ) {							// 用于在每个匹配元素集合中后面插入指定的内容。	
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {								
			var set = this.pushStack( this, "after", arguments );		// 将当前匹配元素集合构造成新jQuery对象
			set.push.apply( set, jQuery.clean(arguments) );				// 调用clean()将参数转成DOM元素数组，最后加入到新jQuery对象中，返回新jQuery对象
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) { 							
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {		// 遍历匹配元素集合
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) { 			 // 如果未写入参数或者在每个元素上过滤与参数selector匹配的元素
				if ( !keepData && elem.nodeType === 1 ) { 				// 如果keepData为false, 不保留数据。如果为true，则保留关联的数据和事件。
					jQuery.cleanData( elem.getElementsByTagName("*") ); 		// 调用jQuery.cleanData()清除elem自身和所有子元素的事件，数据。
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {								
					elem.parentNode.removeChild( elem );				// 调用原生方法removeChild(elem)删除elem
				}
			}
		}

		return this;
	},

	empty: function() { 											
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {		// 遍历匹配元素集合
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {								// 
				jQuery.cleanData( elem.getElementsByTagName("*") ); 	// 清除匹配元素的所有子元素的关联数据和事件
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) { 								
				elem.removeChild( elem.firstChild );					//逐个移除匹配元素的第一个元素
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents; 			// 如果未传入参数, 修正dataAndEvents为false。
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents; 		// 未传入参数deepDataAndEvents, 修正deepDataAndEvents为dataAndEvents

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents ); 		// 
		});
	},

	html: function( value ) {
		if ( value === undefined ) {						// 未传入参数
			return this[0] && this[0].nodeType === 1 ? 		// 匹配元素是DOM元素
				this[0].innerHTML.replace(rinlinejQuery, "") : 		// 用innerHMLT获取HTML内容，返回前删除jQuery运行时可能在元素上设置的jQuery的扩展属性jQuery.expando
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) && 				// 如果不包含script,style字符串
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&			// 支持前导空白符
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {				// 为需要修正	

			value = value.replace(rxhtmlTag, "<$1></$2>");			// 修正自关闭标签

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {			// 遍历匹配元素
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {								
						jQuery.cleanData( this[i].getElementsByTagName("*") );			// 移除所有后代元素关联的数据和事件
						this[i].innerHTML = value;										// 尝试设置属性innerHTML插入HTML内容
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );								// 如果抛出错误，先调用empty()移除后代元素的关联数据和事件，移除子元素，然后调用方法append()插入HTML内容。
			}

		} else if ( jQuery.isFunction( value ) ) {							// 如果是函数
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );				// 在每个匹配元素上调用该函数，将返回的HTML内容作为参数再迭代调用html函数
			});

		} else {
			this.empty().append( value ); 									// 先调用empty()移除后代元素的关联数据和事件，移除子元素，然后调用方法append()插入HTML内容。
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) { 				
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html(); 	
					self.replaceWith( value.call( this, i, old ) ); 		// 设置关键字this指向当前元素，传入了两个参数：当前元素在集合中的下标位置，当前元素的旧HTML内容	
				});
			}

			if ( typeof value !== "string" ) { 				// value不是字符串的情况, 可能是DOM元素或者jQuery对象
				value = jQuery( value ).detach(); 			// 调用.detach将value从文档中移除，保留其关联数据和事件
			}

			return this.each(function() { 					// 遍历每个匹配元素
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove(); 					// 移除匹配元素和它关联数据和事件	

				if ( next ) {								// 如果当前元素有下一个兄弟元素，则将新内容插入下一个兄弟元素之前
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value ); 		// 如果已经是最后一个元素，则将元素内容插入父元素末尾
				}
			});
		} else {
			return this.length ? 							// 如果当前匹配元素集合中含有元素
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) : 	// 用value构造一个新jQuery对象，然后为了修正属性selector, 用新构造的jQuery对象再次构造一个jQuery对象，并返回。
				this;
		}
	},

	detach: function( selector ) {
			return this.remove( selector, true ); 						// 删除与selector匹配的元素，但保留它的关联数据和事件
	},

	domManip: function( args, table, callback ) {					// 
		var results, first, fragment, parent,						// 
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) { 		// 当浏览器复制文档片段时会丢失其中复制按钮和单选按钮的选中状态checked，并且参数tags中的元素是含有属性checked的HTML代码。
			return this.each(function() {							// 
				jQuery(this).domManip( args, table, callback, true );		// 迭代调用方法.domManip()时，因为测试项为false, html代码中含有属性checked, 因此HTML代码转换后的DOM不会被缓存
			});
		}

		if ( jQuery.isFunction(value) ) {							// 如果是函数的情况，则遍历匹配元素集合，在每个元素上执行该函数，并取其返回值作为等插入的内容。迭代调用方法.domManip();
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;				// 

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts ); 				// 调用buildFragment(args, nodes, scripts)把HTML代码转成DOM元素，返回值结构是{fragment: fragment, cacheable: cacheable}
			}

			fragment = results.fragment;					

			if ( fragment.childNodes.length === 1 ) {		// 如果只有一个子元素
				first = fragment = fragment.firstChild;		// 则覆盖变量fragment的值为子元素
			} else {
				first = fragment.firstChild;				
			}

			if ( first ) {									
				table = table && jQuery.nodeName( first, "tr" );		// 如果待插入元素是tr元素，则调用函数root()检查当前元素是否是table元素

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?											// 如果是table元素，则返回该元素下的tbody元素
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ? 		// 修正待插入元素。如果返回的文档片段是可缓存的，则总是插入该文档片段的副本；如果返回的文档片段不可缓存，但是jQuery对象中含有多个元素。则向最后一个目标元素插入该文档片段。
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {							// 转换后的script要手动加载
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) { 					 	// 用于修正副本不兼容属性
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) { 						// IE6/7/8 调用clearAttributes()移除属性和事件
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) { 						// 通过mergeAttributes()把原始元素的属性复制到副本元素上。
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase(); 			

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {						// 修正object元素的属性outerHTML
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) { 		
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) { 			// 修正复选框和单选框按钮的属性defaultChecked, checked, value
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) { 			
		dest.selected = src.defaultSelected; 			// 修正option元素的selected

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) { 		
		dest.defaultValue = src.defaultValue; 			// 修正input, textarea元素的defaultValue
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando ); 			// 移除扩展属性jQuery.expando
}

jQuery.buildFragment = function( args, nodes, scripts ) { 	 	// 参数args:数组，含有待转换为DOM元素的HTML代码。参数nodes：数组，含有文档对象、jQuery对象或DOM元素。
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) { 																				// 参数nodes存在，并且有值
		doc = nodes[0].ownerDocument || nodes[0];															// 修正doc
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) { 																	// 如果doc.createDocumentFragment不存在
		doc = document; 																					// doc指向document
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document && 		// 数组args的长度为1，且第一个元素是字符串，即数组args中含有一段HTML; HTML代码的长度小于512(1/2KB)，否则可能会导致缓存占用的内存过大; 文档对象doc是当前文档对象，即只缓存为当前文档创建的DOM元素。
		first.charAt(0) === "<" && !rnocache.test( first ) && 												// HTML代码以左括号开头，只缓存DOM元素，不缓存文本节点。不能是<script>, <object>, <embed>, <option>, <style>之一。
		(jQuery.support.checkClone || !rchecked.test( first )) && 											// 当前浏览器能否正确地复制单选按钮和复选框的选中状态，或者HTML代码中的单选按钮和复选按钮没有选中
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) { 										// 当前浏览器能否正确地复制HTML5元素，或者HTML代码没有HTML5标签

		cacheable = true;

		cacheresults = jQuery.fragments[ first ]; 															// 尝试从jQuery.fragments中读取缓存DOM元素
		if ( cacheresults && cacheresults !== 1 ) { 														// 如果有缓存，并且缓存值不为1，表示读取的是文档片段
			fragment = cacheresults; 																		// 赋值给变量fragment.
		}
	}

	if ( !fragment ) { 																						// 说明没有读取到缓存文档
		fragment = doc.createDocumentFragment();															// 创建一个文档碎片
		jQuery.clean( args, doc, fragment, scripts );														// 把HTML代码转成DOM元素，并存储在创建的文档片段中。
	}

	if ( cacheable ) { 																						// 如果HTML代码符合缓存条件
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;											// 转换后的DOM元素放入缓存对象jQuery.fragments中
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) { 																
		var ret = [],
			insert = jQuery( selector ), 										// 变量insert指向目标元素集合，this指向待插入元素集合
			parent = this.length === 1 && this[0].parentNode;					// 

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) { 		// 待插入元素只有一个，并在文档片段中目标元素也只有一个。
			insert[ original ]( this[0] ); 								// 则直接将待插入元素插入目标元素中
			return this; 										

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) { 					// 遍历目标元素集合
				var elems = ( i > 0 ? this.clone(true) : this ).get();			// 第一次插入的是待插入元素集合，第二次插入的是待插入元素副本。
				jQuery( insert[i] )[ original ]( elems );						// 将待插入的插入每个目标元素，
				ret = ret.concat( elems ); 										// 遍历过程过，将待插入元素和元素的副本放入ret中
			}

			return this.pushStack( ret, name, insert.selector );				// 返回由插入元素数组构成新的jQuery对象
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) { 			// 如果是checkbox或者radio，把checked属性赋值给defaultChecked
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase(); 				// 获取elem的标签名，赋值给nodeName变量
	if ( nodeName === "input" ) {										// 如果是input标签
		fixDefaultChecked( elem );										// 调用fixDefaultChecked(elem)
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) { 			// 如果不是script标签并且节点有getElementsByTagName方法
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );							// 
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,		
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?  	// 支持复制html5元素，或者原始元素不是html5元素
				elem.cloneNode( true ) : 		// 调用cloneNode(true)方法复制元素
				shimCloneNode( elem ); 			// 否则调用函数shimCloneNode(elem)通过安全文档片段复制html5元素

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) && 				// 不支持复制元素事件或者不复制选中状态checked, 则调用函数cloneFixAttribute(src.dest)
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) { 	// 
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone ); 										// 则调用cloneFixAttributes(elem, clone)修正副本元素的不兼容属性。

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem ); 											// getAll(elem)获取原始元素和副本元素的所有后代元素。
			destElements = getAll( clone ); 										

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) { 							// 遍历原始元素
				// Ensure that the destination node is not null; Fixes #9587 	
				if ( destElements[i] ) { 									
					cloneFixAttributes( srcElements[i], destElements[i] ); 	// 修正副本元素所有的后代的不兼容属性。
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {							// 如果dataAndEvents为true
			cloneCopyEvent( elem, clone ); 				// 调用cloneCopyEvent(elem, clone)元素关联的数据和事件复制到副本元素上

			if ( deepDataAndEvents ) { 					// 如果deepDataAndEvents为true
				srcElements = getAll( elem ); 			// getAll(elem)获取原始元素和副本元素的所有后代元素。 
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) { 	
					cloneCopyEvent( srcElements[i], destElements[i] );  // 复制副本所有后代元素的关联数据和事件
				}
			}
		}

		srcElements = destElements = null; 				// 

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document; 		// 修正文档对象context.context可能是DOM元素，可能是jQuery对象，可能是普通对象。
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) { 										
			if ( typeof elem === "number" ) {															// 如果elem是数字，则转成字符串
				elem += "";
			}

			if ( !elem ) { 																				// 过滤null, undefined, ''的情况
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) { 															// 如果elem是字符串
				if ( !rhtml.test( elem ) ) { 															// 用rhtml检测HTML代码中是否含有标签、字符代码或数字代码。说明是文字
					elem = context.createTextNode( elem ); 												// 创建文本节点
				} else {																				// 如果是html代码
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>"); 										// 修正自关闭标签

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(), 					// 提取HTML代码中的标签部分，删除了标签的前导空白符和左尖括号，并转换成小写赋值给变量wrap
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment 						
					if ( context === document ) {														// 如果传入的文档对象是当前文档对象
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div ); 												// 教会不
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div ); 								// 创建一个新的文档片段，在片段上逐个创建HTML5元素，从而"教会"不支持HTML5的浏览器的正确地解析和渲染HTML5元素。
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2]; 											// 为HTML包裹必要的父元素

					// Move to the right depth
					while ( depth-- ) { 																// 指向正确的父元素层
						div = div.lastChild;
					} 

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) { 														/// IE6/7下<table>下会自动创建空的<tbody>标签

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?										// 表示HTML代码中含有table标签，没有tbody标签，浏览器生成DOM元素时可能自动插入空tbody元素。
								div.firstChild && div.firstChild.childNodes : 							// div.firstChild.childNodes指向tbody, thead, tfoot, colgroup, caption元素集合

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?  									// 表示HTML代码中含有table标签，但没有tbody。
									div.childNodes : 													// div.childNodes指向tbody, thead, tfoot, colgroup, caption元素集合
									[]; 																// 

						for ( j = tbody.length - 1; j >= 0 ; --j ) {									// 遍历tbody
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {	// 如果tbody没有子元素，则移除tbody
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {		// 测试项jQuery.support.leadingWhitespace为false。浏览器会自动剔除前导空白符。用正则检测出开头是否还有空格
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild ); 			// 用context.createTextNode()创建文本节点，再插入到div元素的第一个子元素上。
					}

					elem = div.childNodes; 																// 获取到最后的HMTL代码
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len; 																					// IE6/7中，复选框和单选按钮插入DOM树后，其选中状态checked会丢失，此时测试项jQuery.support.appendChecked为false。
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );															// 在每个元素上调用findInputs(elem)方法
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) { 																		// 将HMLT代码转换成DOM元素，放在ret数组中
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) { 																				// 如果传入了文档片段
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) { 																												// 遍历数组ret
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) { 			// 如果有传入参数scripts，提取所有的script元素，该元素没有type属性或者type属性忽略小写为'text/javascript'。
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] ); 												// 				

				} else {
					if ( ret[i].nodeType === 1 ) { 																	// 如果是DOM节点元素
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType ); 		// 提取所有的script元素

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) ); 										// 插入当前元素后面，以便再执行6362~6364的检测。
					}
					fragment.appendChild( ret[i] ); 																// 会把除了合法的script元素之外的所有元素插入文档片段中
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {									// 清除元素
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) { 				// 移除绑定事件
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) { 							// 
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) { 								// 删除jQuery扩展属性
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) { 				
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ]; 								// 删除事件缓存对象
			}
		}
	}
});

function evalScript( i, elem ) { 									// 执行html片段中有script标签的javascript代码
	if ( elem.src ) { 												// 如果有src, 说明script是个外链地址
		jQuery.ajax({ 												// 同步请求
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else { 														// 如果是javascript片段
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) ); 		// 调用jQuery.globalEval()方法执行
	}

	if ( elem.parentNode ) { 										// 执行完后删除script标签
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,
 
	cssShow = { position: "absolute", visibility: "hidden", display: "block" }, 		// absolute以避免引起文档布局流变化，通过设置样式visibility为hidden，使得当前元素在不可见的同时进入文档流，通过设置样式display为block，使width和height生效。
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) { 							// 设置或者获取元素的DOM属性name
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) { 			
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) { 	 	// 调用jQuery.access()设置或者获取元素的DOM属性
		return value !== undefined ?
			jQuery.style( elem, name, value ) : 					// 如果传入value，则调用jQuery.style()设置DOM元素的style属性
			jQuery.css( elem, name ); 								// 未传入value，调用jQuery.css()来获取DOM属性name
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) { 				// 如果参数是true，则调用函数curCss()读取计算样式。
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" ); 	
					return ret === "" ? "1" : ret; 		// 如果读取值为'', 则将其修正为'1'返回。

				} else {
					return elem.style.opacity; 		// 否则读取style.opacity读取内联样式
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) { 				// 过滤文本节点和注释
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ), 					// 样式名转成驼峰式
			style = elem.style, hooks = jQuery.cssHooks[ origName ]; 			// 通过style读取内联时需要用驼峰式

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {			// 如果参数value是 '-=100px'/'+=100px'(相对值字符串)，则计算相对值
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) ); 			// 将value转换成整数加上元素的原始值
				// Fixes bug #9237
				type = "number"; 												// 修正type为'number'
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) { 		// 如果value为null或者为NaN(非法数字), 不设置style属性
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) { 		// 为数值型样式追加'px'，jQuery.cssNumber对象定义的属性则不需要添加
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) { 		// 优先调用hooks.set方法，其次设置属性style[name]
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value; 										// 设置元素的style属性name为value
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) { 	 	// 优先调用.get方法
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];												// 读取内联样式
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name ); 										// 样式名转成驼峰式
		hooks = jQuery.cssHooks[ name ];										// 获取样式名对应的修正对象
		name = jQuery.cssProps[ name ] || name; 								// 修正name,在IE6/7中需要通过样式styleFloat来访问样式float，在其他浏览器中则通过样式cssFloat访问

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {											// 对于cssFloat, 在读取计算样式值时需要转换为float											
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) { 	// 优先调用修正对象的get方法读取计算样式，并返回。
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {													// 不需要修正，直接调用curCss方法获取当前属性name的值，并返回。
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) { 	 							// 
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) { 											
			old[ name ] = elem.style[ name ]; 									// 将现有的内联属性保存在old对象中
			elem.style[ name ] = options[ name ]; 								// 再设置临时属性
		}

		callback.call( elem ); 													// 执行回调, 读取属性

		// Revert the old values
		for ( name in options ) { 												// 再恢复原始属性
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) { 
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) { 					
			var val;

			if ( computed ) { 								// 只支持读取计算样式
				if ( elem.offsetWidth !== 0 ) { 			// 如果宽度不为0，表示元素可见
					return getWH( elem, name, extra ); 		// 调用getWH(elem, name, extra)，并返回
				} else {
					jQuery.swap( elem, cssShow, function() { 	// 否则调用jQuery.swap先显示出现，再获取宽度，再恢复隐藏
						val = getWH( elem, name, extra );
					});
				}

				return val; 								// 返回获取宽度
			}
		},

		set: function( elem, value ) { 						 
			if ( rnumpx.test( value ) ) { 					// 如果样式值没有单位或者单位是px
				// ignore negative width and height values #1599 		
				value = parseFloat( value ); 				// 转字符串转成整数，并忽略后面的单位

				if ( value >= 0 ) {							// 如果样式值大于0
					return value + "px"; 					// 追加上'px'
				}

			} else {
				return value; 								// 否则直接返回value
			}
		}
	};
});

if ( !jQuery.support.opacity ) { 			// 	如果不支持opacity.
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) { 		// 
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ? 	// 如果computed为true，即要读取计算样式，则读取elem.currentStyle.filter，否则读取elem.style.filter。
				( parseFloat( RegExp.$1 ) / 100 ) + "" : 	// 如果设置了透明度，除以100，再转为字符串
				computed ? "1" : ""; 						// 如果没设置透明度，并且ccomputed为true，返回1，否则返回0。
		},

		set: function( elem, value ) { 			// 
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "", 		// 如果value为数字，就乘以100
				filter = currentStyle && currentStyle.filter || style.filter || ""; 					// 尝试依次获取计算样式currentStyle.filter，否则获取内联样式style.filter

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1; 					// 在IE中要设置样式zoom为1，使得该元素具有布局hasLayout。

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) { 					// 如果设置值大于等于1

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" ); 														// 则删除filter属性。使用cleartype会出问题。

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) { 							// 在级联样式没有设置其它样式，并且移除了内联样式的属性。所以可以直接返回。
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ? 					// 如果有设置滤镜fitler，则替换已有的alpha为当前alpha属性，否则直接写入。
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) { 					
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) { 						
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() { 		// 通过临时设置属性{display:'inline-block'}来返回正确的样式
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" ); 		// 读取计算样式
					} else {
						ret = elem.style.marginRight; 								// 或者内联样式
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) { 		// 如果支持getComputedStyle方法
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase(); 		// 将驼峰式转成连字符串，或者有ms前面加-

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) { 			
			ret = computedStyle.getPropertyValue( name ); 							// 获取计算样式
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) { 	// 	如果没有获取到样式并且当前元素不在文档中
				ret = jQuery.style( elem, name ); 					// 则调用jQuery.style(elem, name)方法来获取。
			}
		}

		return ret; 												// 最后返回
	};
}

if ( document.documentElement.currentStyle ) { 				// 如果支持currentStyle
	currentStyle = function( elem, name ) { 				
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) { 		// 没有获取计算样式，则尝试从style[name]中读取内联样式
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) { 		// 如果不是'px'为单位, 而是百分比

			// Remember the original values
			left = style.left;									// 备份left
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left; 	// 获取样式left

			// Put in the new values to get a computed value out
			if ( rsLeft ) { 										
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );	// 将ret赋值给style.left
			ret = style.pixelLeft + "px"; 						// 读取left的像素值pixelLeft作为返回值

			// Revert the changed values
			style.left = left; 									// 恢复样式left
			if ( rsLeft ) { 									
				elem.runtimeStyle.left = rsLeft; 				// 恢复样式rsLeft
			}
		}

		return ret === "" ? "auto" : ret; 						// 如果ret是字符串，修正为'auto'
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {					// 获取元素的宽或者高

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight, 		 	// 获取元素的offsetWidth/offsetHeight，包含了content, padding值，边框
		which = name === "width" ? cssWidth : cssHeight, 			// 如果name是'width'，则which为['left', 'right'], 否则which为['top', 'bottom']
		i = 0,
		len = which.length;

	if ( val > 0 ) { 				// 如果元素宽大于0，可见元素
		if ( extra !== "border" ) { 			// 如果extra不是'border'
			for ( ; i < len; i++ ) { 			// 遍历which
				if ( !extra ) {				 	// 未传入参数extra
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0; 		// 减去内边距padding值
				}
				if ( extra === "margin" ) { 				// 如果是'margin', 加上外边距margin值
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0; 		// 默认减去border值
				}
			}
		}

		return val + "px"; 		// 如果未传入参数，返回content。如果传入border，返回content,padding,border;  传入margin，返回content, padding, border, margin。传入padding, 返回content, padding
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name ); 			// 尝试读取height/width的计算样式值
	if ( val < 0 || val == null ) {				// 如果样式小于0或获取不到
		val = elem.style[ name ] || 0;			// 读取内联样式
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0; 				// 转为数值,只有content

	// Add padding, border, margin
	if ( extra ) { 						// 如果有值
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0; 		// 默认加上内边距
			if ( extra !== "padding" ) { 												
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0; 	// 不是padding，是border或margin, 加上外边距border
			}
			if ( extra === "margin" ) { 			
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0; 	// 如果是'margin'，加上外边距margin
			}
		}
	}

	return val + "px"; 					// 最后返回val+'px'
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {}, 				// 初始化变量prefilters

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {}, 				// transports为空对象

	// Document location
	ajaxLocation,

	// Document location segments 	
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) { 			// 添加前置过滤器或者请求发送器

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) { 				// 

		if ( typeof dataTypeExpression !== "string" ) { 		// 如果dataTypeExpression不是字符串
			func = dataTypeExpression; 							// 修正参数dataTypeExpression、func, 参数dataTypeExpression默认为"*"
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) { 						// 如果func是函数 
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ), 			// 用空白符分割参数dataTypeExpression为数组
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) { 						// 遍历数组
				dataType = dataTypes[ i ]; 						
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType ); 			// 将参数func插入数组类型对应的数组中
				if ( placeBefore ) { 							// 如果数据类型前面有"+"，则去掉"+"
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || []; 	// 如果数组不存在，初始化为空数组。
				// then we add to the structure accordingly 					
				list[ placeBefore ? "unshift" : "push" ]( func ); 			// 如果数据类型有"+"，则插入数组头部。否则插入数据类型对应的数组。
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) { 				// 

	dataType = dataType || options.dataTypes[ 0 ]; 					// 数据类型
	inspected = inspected || {}; 									// 

	inspected[ dataType ] = true; 									// 存放已经执行过的数据类型的对象

	var list = structure[ dataType ], 								// 取出数据类型对应的前置过滤数组，或请求发送器工厂函数数组。
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ), 				// 如果structure是前置过滤器集prefilters,则变量executeOnly为true，表示只执行，没有返回值; 否则为false, 表示不只是执行，还会有返回值。
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) { 	// 如果是前置过滤，则遍历执行所有的函数。如果是获取请求发送器，则找到一个请求发送器就立即跳出循环。
		selection = list[ i ]( options, originalOptions, jqXHR ); 	// 执行前置过滤器或者请求发送器函数
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) { 						// 如果函数返回值的类型是字符串，即当前请求被重定向到了另一个类型。
			if ( !executeOnly || inspected[ selection ] ) { 		// 如果是应用前置过滤器，并且重定向的数据已经处理过，则设置selection为undefined，然后继续遍历执行数组list的函数。如果是获取请求发送器，则设置selection为undefined，即丢掉返回值，然后继续遍历执行数组list中的函数。
				selection = undefined;
			} else { 												// 如果是应用前置过滤器
				options.dataTypes.unshift( selection );  			// 并且重定向的数据类型没有处理过，则将该数据类型插入数据类型数组的头部，改变当前请求的数据类型，
				selection = inspectPrefiltersOrTransports( 			// 并递归调用函数inspectPrefiltersOrTransports(), 为当前请求应用该数据类型前置过滤器，递归调用完成后，将继续遍历执行数组list中的函数。
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) { 	// 如果是应用前置过滤器，并且没有处理过通配符*，则递归调用inspectPrefilterOrTransports()应用通配符*对应的前置过滤器; 如果是获取请求发送器，并且没有找到数据类型对应的发送器，同时也没有处理过通配符*。则递归调用inspectPrefiltersOrTransports()获取通配符*对应的请求发送器。
		selection = inspectPrefiltersOrTransports( 					
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;  										// 对于前置过滤器，返回undefined。对于获取请求发送器，返回一个请求发送器。
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) { 					// 如果url是对象
			options = url; 									// 修正url, options
			url = undefined;
		}

		// Force options to be an object
		options = options || {}; 							// 修正options，没获取到options就设置为{}

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ), 			// 创建最后的options参数
			// Callbacks context
			callbackContext = s.context || s, 				// 指定回调函数上下文，如果有指定context, 则以s.context为回调函数上下文，否则以完整的选项对象作为回调函数的上下文
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s && 		// ajax全局事件上下文，默认上下文为对象jQuery.event。通过调用方法jQuery.event.trigger(event, data, elem, onlyHandlers)触发，全局事件会被传播到所有元素。
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(), 					// 创建异步队列
			completeDeferred = jQuery.Callbacks( "once memory" ), 			// 创建回调函数列表。用于触发和存放回调函数
			// Status-dependent callbacks
			statusCode = s.statusCode || {}, 				// 状态码
			// ifModified key 	
			ifModifiedKey, 							// 
			// Headers (they are sent all at once)
			requestHeaders = {}, 					// 存储请求头
			requestHeadersNames = {}, 				// 记录请求头
			// Response headers
			responseHeadersString, 			 	// 存储响应字符串
			responseHeaders, 					// 变量responseHeaders用于存储解析后的响应头和值
			// transport
			transport, 							// 当前请求分配的请求发送器
			// timeout handle
			timeoutTimer, 					// 超时计时器
			// Cross-domain detection vars 			
			parts, 							// 存放解析当前请求的地址得到的协议，域名或IP，端口，用于判断当前请求是否路域。
			// The jqXHR state
			state = 0, 						// 表示当前请求jqXHR对象的状态
			// To know if global events are to be dispatched
			fireGlobals, 					// 是否触发全局Ajax事件
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0, 				// 当前jqXHR对象的状态，其初始值为0，发送前为1，响应完后为4

				// Caches the header
				setRequestHeader: function( name, value ) { 		// 设置请求头。
					if ( !state ) {
						var lname = name.toLowerCase(); 			
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;  // 存储在requestHeadersNames, requerstHeaders中	
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() { 	 			// 用于获取响应头字符串
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) { 				// 用于获取指定响应头的字符串
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) { 		// 第一次调用方法jqXHR.getResponseHeaders(key)时，将解析到的响应头和值缓存到responseHeaders中，之后再调用不需要再解析，直接从对象responseHeaders中获取。
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ]; 
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) { 				// 对应XMLHTTPRequest的同名方法，用于覆盖MIME类型。
					if ( !state ) { 						
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) { 					// 用于取消本次请求
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) { 			// 

			// Called once
			if ( state === 2 ) { 				// 状态码为2，返回
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined; 								// 解除对请求发送器的引用

			// Cache response headers
			responseHeadersString = headers || ""; 				// 将响应头字符串缓存到变量responseHeadersString中

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0; 				// 如果响应完成，则变成4

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) { 			// 如果响应成功，则执行数据类型转换

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) { 					// 如果设置了选项ifModified, 则记录响应头Last-Modified和Etag，用于下一次对同一地址的请求。

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) { 			// 如果状态码为304，表示请求资源没有变化，则设置变量statusText的值为"notmodified"，并且认为本次请求成功。

					statusText = "notmodified"; 	// 则设置变量statusText的值为"notmodified", 并且认为本次请求成功。此时，"notmodified"被传给回调函数success(data, textStatus, jqXHR)和complete(jqXHR, testStatus)。
					isSuccess = true; 				// 请求成功

				// If we have data
				} else {							// 状态码为200~300，表示请求成功

					try { 							
						success = ajaxConvert( s, response );	// 调用函数ajaConvert(s, response)将响应的数据转换为期望的类型。
						statusText = "success";					// 设置statusText值为"success"
						isSuccess = true;						// 设置isSuccess值为true
					} catch(e) {
						// We have a parsererror 				// 如果转换失败
						statusText = "parsererror"; 			// 设置statusText值为"parsererror"
						error = e;								// 设置error为e
					}
				}
			} else { 											// 如果响应失败，则设置变量statusText的值为"error"
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;								// 设置变量error的值statusText
				if ( !statusText || status ) {					
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;								// 设置自定义jqXHR对象的status属性为XMLHttpRequest的同名属性
			jqXHR.statusText = "" + ( nativeStatusText || statusText ); 	// 设置jqXHR的statusText属性为XMLHttpRequest的同名属性

			// Success/Error
			if ( isSuccess ) { 									// 如果响应成功
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] ); 		// 调用方法deferred.resolveWith(context, args)触发成功回调函数。
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] ); 			// 调用方法deferred.resolveWith(context, args)触发失败回调函数。
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode ); 					// 调用jqXHR.statusCode(map)执行状态码对应的回调函数
			statusCode = undefined;								

			if ( fireGlobals ) { 								// 未禁用全局事件，则根据响应是否成功和数据类型转换是否成功，决定触发全局事件ajaxSuccess或ajaxError，并通过调用方法jQuery.event.trigger(event, data, elem, onlyHandlers)或.trigger(type, data)来触发。
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// completeDeferred 								
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] ); 	// 触发完成回调函数

			if ( fireGlobals ) { 													
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] ); 		// 
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) { 										// 属性jQuery.active减1，如果变为0，表示所有的请求都已完成(包括成功，失败，取消)，则调用方法jQuery.evetn.trigger(event, data, elem, onlyHandlers)触发全局事件ajaxStop，事件
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR ); 						// 为jqXHR对象添加异步队列只读副本
		jqXHR.success = jqXHR.done;						// 为了方便，也提供方法.success, .error, .complete方法
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) { 			// 
			if ( map ) {
				var tmp;
				if ( state < 2 ) { 						// 请求还没接收到
					for ( tmp in map ) { 				// 则向变量statusCode中添加状态码对应的回调函数
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else { 								// 请求已接收到或者请求处理中或者请求已完成，且响应已就绪
					tmp = map[ jqXHR.status ]; 			// 如果请求完成，则调用jqXHR.then(tmp, tmp)将状态码对应的回调函数同时添加到异步队列的成功和失败
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" ); 	// 强制将url转成字符串，移除锚文部分，以//开头，要补充协议。

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax ); 			// 删除头尾空格，开头字母小写，将dataType用空格分割成数组，并赋值给选项dataTypes

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) { 						
			parts = rurl.exec( s.url.toLowerCase() ); 				// 用正则rurl从选项url中解析出协议
			s.crossDomain = !!( parts &&							// 与当前url比较，只要其中一项不同就认为是跨域请求，会通过script元素发送。
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) { 			// 如果选项processData为true, 并且data不是字符串，调用jQuery.param方法
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR ); 		// 应用前置过滤器，继续修正选项

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {													// 
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global; 												// 

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type ); 								// 判断请求是否包含内容

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content 					
		if ( !s.hasContent ) {													// 如果没有请求内容，则修正选项url

			// If data is available, append data to url
			if ( s.data ) { 													// 如果设置了选项data, 则将选项data附加到选项url之后。正则rquery用于检测选项url中是否含有问号"?", 即是否已经有查询部分，如果没有则加上"?", 否则加上"&"。
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url; 												// 

			// Add anti-cache in url if needed
			if ( s.cache === false ) { 											// 如果选项cache为false，则禁用缓存，则在选项上替换或追加时间戳。

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) { 		// 如果设置了选项data, 并且当前请求不是GET, HEAD请求，同时选项contentType不是false，则设置请求头Content-Type。如果在原始选项集中设置了选项options.contentType, 也会设置请求头Content-Type。
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) { 																	// 如果有设置ifModified属性
			ifModifiedKey = ifModifiedKey || s.url; 											// ifModified为true，则设置请求头If-Modified-Since和If-None-Match，表示只有当最后一次请求的响应内容发生改变时，才会响应状态码200和新内容。
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader( 																// 设置请求头Accept，用于指定浏览器可授受的响应类型。
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) { 																// 设置其它请求头信息
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) { 		// 如果回调函数返回false，则取消本次请求。
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) { 									// 添加成功，失败，完成回调
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR ); 			// 获取请求发送器

		// If no transport, we auto-abort
		if ( !transport ) { 										// 如果没有找到对应的请求发送器，则结束本次请求
			done( -1, "No Transport" );
		} else { 								
			jqXHR.readyState = 1; 									
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] ); 		// 触发全局事件ajaxSend
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) { 						// 设置超时
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done ); 						// 发送请求，请求头集和回调函数done作为参数
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" || 				 			// 检测当前请求是否是jsonp请求。如果数据类型为"jsonp"，或者
		s.jsonp !== false && ( jsre.test( s.url ) || 				// 数据类型为"json"，并且选项url中含有触发jsonp请求的特征字符"=?&", "=?$"或者"??"
				inspectData && jsre.test( s.data ) ) ) { 			// 未禁用jsonp，并且选项data中含有触发jsonp请求特征的字串符"=?&", "=?$"或者"??"
 
		var responseContainer,
			jsonpCallback = s.jsonpCallback = 						// jsonpCallback表示jsonp回调函数名;如果选项jsonpCallback是函数，则执行并返回值作为回调函数名; 
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ], 					// 备份可能曾经出现过的同名jsonp回调函数。当前响应完成后，就会触发该函数。
			url = s.url, 											
			data = s.data,
			replace = "$1" + jsonpCallback + "$2"; 					// 变量replace用于替换选项url或data中触发jsonp请求的特征字符，其中$1、$2分别对应正则jsre中分组1, 分组2。

		if ( s.jsonp !== false ) { 									
			url = url.replace( jsre, replace ); 					// 修正选项url。
			if ( s.url === url ) { 									// 如果没发生变化
				if ( inspectData ) { 								
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback; 		// 手动在选项url后增加jsonp回调函数参数名和回调函数名
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) { 			// 在window注册一个同名回调函数，用于获取响应的json数据。该回调函数在响应完成后会被自动调用，基参数为服务器返回的json数据。通过闭包机制访问变量responseContainer，并将响应的json数据赋值给变量responseContainer。
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() { 									// 调用jqXHR.always()添加一个回调函数					
			// Set callback back to previous value
			window[ jsonpCallback ] = previous; 					// 在window上注册一个同名回调函数，注销在window对象上注册的同名回调函数。当前请求成功时，触发此函数。
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) { 	
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() { 					// 为本次请求添加"script json"对应的数据转换器，通过闭包机制访问变量responseContainer，将响应的json数据返回给方法jQuery.ajax(url, options)。
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json"; 									// 强制设置本次请求的数据类型为"json"，即期望服务器返回json数据

		// Delegate to script
		return "script"; 											// 
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {												// 
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,											// 如果创建结果可以转换为true，则测试项为ajax为true。
		cors: !!xhr && ( "withCredentials" in xhr )				// 如果创建结果含有属性withCredentials，测试项为true。如果浏览器支持跨域共享资源共享,则测试项为true。
	});
})( jQuery.ajaxSettings.xhr() ); 								// 尝试创建ajax对象

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) { 		// 如果浏览器支持'getBoundingClientRect'
	jQuery.fn.offset = function( options ) { 						// 获取匹配第一个元素当前的文档坐标或设置匹配元素的目标坐标								
		var elem = this[0], box; 									

		if ( options ) {											// 如果有参数传入
			return this.each(function( i ) { 						// 
				jQuery.offset.setOffset( this, options, i ); 		// 调用jQuery.offset.setOffset给每个匹配元素设置文档坐标
			});
		}

		if ( !elem || !elem.ownerDocument ) { 						// 如果没有匹配元素或匹配元素不在文档中
			return null;
		}

		if ( elem === elem.ownerDocument.body ) { 					// 如果是body
			return jQuery.offset.bodyOffset( elem ); 				// 调用jQuery.offset.bodyOffset()设置body的文档坐标
		}

		try {
			box = elem.getBoundingClientRect(); 					// 获取每一个元素的窗口坐标。在IE中，未添加到文档中元素调用方法getBoundingClientRect()会抛出错误
		} catch(e) {}

		var doc = elem.ownerDocument, 
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) { 			// 如果未取到元素的窗口坐标或者元素不在当前文档中
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 }; 		// 如果获取不到元素的窗口坐标，返回{top:0, left:0}。
		}

		var body = doc.body,
			win = getWindow(doc), 					// 获取window对象, 如果是window对象或者document对象，返回window,否则返回false。
			clientTop  = docElem.clientTop  || body.clientTop  || 0, 			// 获取html,body的上边框厚度
			clientLeft = docElem.clientLeft || body.clientLeft || 0, 			// 获取html,body的左边框厚度
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop, 	// 获取滚动条的垂直偏移
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft, 	// 获取滚动条的水平偏移
			top  = box.top  + scrollTop  - clientTop, 			// 计算文档元素的上边距
			left = box.left + scrollLeft - clientLeft; 			// 计算文档元素的左边距

		return { top: top, left: left }; 			// 返回格式为{top:top, left:left}对象
	};

} else {
	jQuery.fn.offset = function( options ) { 		
		var elem = this[0];

		if ( options ) { 							
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) { 		
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem ); 		
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) { 				
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) { 				
		var top = body.offsetTop, 				// offsetTop获取元素的上边框到父元素上边框的距离
			left = body.offsetLeft; 			// offsetTop获取元素的左边框到父元素左边框的距离

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) { 		 		// 如果body元素距html元素边框的距离不包括body元素的外边距margin，则测试项doesNotIncludeMarginInBodyOffset为true。
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0; 			//  
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };		// 返回{top: top, left: left}
	},

	setOffset: function( elem, options, i ) {				
		var position = jQuery.css( elem, "position" );			// 获取position属性

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) { 				// 如果是'static', 修正为'relative'
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),				
			curOffset = curElem.offset(), 			// 获取元素的文档坐标
			curCSSTop = jQuery.css( elem, "top" ), 			// 获取计算样式top
			curCSSLeft = jQuery.css( elem, "left" ), 		// 获取计算样式left
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1, 	// 如果position是absolute或者fixed并且计算样式top或者left属性值为auto
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) { 					// 如果能计算
			curPosition = curElem.position();		// 获取最近定位祖先元素或body的坐标。因为auto可能不是0，但会被解析为0。
			curTop = curPosition.top;				
			curLeft = curPosition.left; 			
		} else {
			curTop = parseFloat( curCSSTop ) || 0; 		// 将计算样式curCSSTop, curCSSLeft解析为数值
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) { 			// 如果是函数 
			options = options.call( elem, i, curOffset ); 			// 执行函数
		} 

		if ( options.top != null ) { 					// 如果设置目标坐标的top属性
			props.top = ( options.top - curOffset.top ) + curTop; 		// 目标文档坐标top - 当前文档坐标top + 计算样式top
		}
		if ( options.left != null ) { 					
			props.left = ( options.left - curOffset.left ) + curLeft; 	// 目标文档坐标left - 当前文档坐标left + 计算样式left
		}

		if ( "using" in options ) { 					// 如果参数options有'using'
			options.using.call( elem, props );			// 执行该using函数
		} else {
			curElem.css( props ); 				// 否则调用.css()设置最终内联样式top,left。
		}
	}
};


jQuery.fn.extend({

	position: function() { 					// 获取匹配的第一个元素的外边框相对于最近定位祖先元素的外边框的坐标
		if ( !this[0] ) { 					
			return null;
		}

		var elem = this[0], 				// 获取第一个匹配元素

		// Get *real* offsetParent
		offsetParent = this.offsetParent(), 		// 获取匹配元素的最近定位祖先元素

		// Get correct offsets
		offset       = this.offset(),				// 获取匹配元素的文档坐标
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset(); 		// 获取最近定位祖先元素的文档坐标，如果是body,html，则top,left为0

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0; 		// 当前文档坐标top减去外上边距
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0; 		// 当前文档坐标left减去外左边距

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0; 		// 最近定位祖先元素文档坐标top再加上上边框
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0; 	// 最近定位祖先元素文档坐标left再加上左边框

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top, 			// 元素外边距到最近定位祖先父素的外边框的距离
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() { 				// 用于获取最近的定位元素 
		return this.map(function() { 		
			var offsetParent = this.offsetParent || document.body; 			// 获取最近的定位的祖先元素
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) { 		// 相对定位的祖先元素不是body,html，并且position不是static
				offsetParent = offsetParent.offsetParent; 			// 迭代最近的定位的祖先元素的最近的定位的祖先元素
			}
			return offsetParent; 			// 返回最近的定位的祖先元素被添加到新构造的jQuery对象
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) { 			// scrollLeft/scrollTop 方法返回或设置匹配元素的滚动条的水平/垂直位置
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) { 			// 未传入参数val
			elem = this[ 0 ]; 				// 获取匹配的第一个元素

			if ( !elem ) {					// 没有匹配元素
				return null; 				// 返回null
			} 

			win = getWindow( elem ); 		// 获取wnidow对象, 如果是dom元素，返回false

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] : 		// 如果是window,document对象，并且支持pageXOffset属性，获取window.pageYOffset/pageXOffset,否则获取window.scrollLeft/scrollTop
				jQuery.support.boxModel && win.document.documentElement[ method ] || 				// 
					win.document.body[ method ] :
				elem[ method ]; 				// dom元素返回elem.scrollLeft/scrollTop
		}

		// Set the scroll offset 			// 如果val有传入
		return this.each(function() { 		
			win = getWindow( this );		// 获取window对象

			if ( win ) { 				 	// 如果是window,document对象
				win.scrollTo( 				// 调用window.scrollTo(x, y);
					!i ? val : jQuery( win ).scrollLeft(), 	 	
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val; 		// 否则设置scrollLeft/scrollTop属性
			}
		});
	};
});

function getWindow( elem ) {				// window, document返回window, dom元素返回false
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) { 

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {		// .innerHeight/.innerWidth方法
		var elem = this[0]; 					// 获取第一个匹配元素
		return elem ? 	 						// 如果匹配到元素
			elem.style ? 						// 并且支持内联样式elem.style
			parseFloat( jQuery.css( elem, type, "padding" ) ) : 		// 获取元素的计算样式type,加上内边距
			this[ type ]() : 	 				// 否则调用方法.width/.height()获取元素的内容content的高度或宽度
			null; 								// 如果匹配不了元素，返回null
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) { 			// .outerHeight/outerWidth方法
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) : 		// 如果参数是true, 则把外边距也计算
			this[ type ]() :
			null; 						
	};

	jQuery.fn[ type ] = function( size ) { 		// .width/height()方法获取元素的宽或高
		// Get window width or height
		var elem = this[0]; 					// 获取第一个匹配元素
		if ( !elem ) {
			return size == null ? null : this; 		// 未传入参数，返回null，否则返回匹配元素集合
		}

		if ( jQuery.isFunction( size ) ) { 		// 如果是函数 
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) ); 	// 则执行
			});
		}

		if ( jQuery.isWindow( elem ) ) { 			// 如果是window对象
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ], 		// 获取window内容宽或高window.clientWidth/cliehtHeight
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp || 			// 如果是开启标准兼容模式，返回window.clientWidth/clientHeight。
				body && body[ "client" + name ] || docElemProp; 						// 否则返回body.clientWidth/clientHeight，如果获取不到，返回window.clientWidth/clientHeight

		// Get document width or height
		} else if ( elem.nodeType === 9 ) { 		// 如果是document元素
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max( 					 	// 返回window.clientWidth/clientHeight, window.scrollLeft/scrollHeight, window.offsetWidth/offsetHeight, body.scrollLeft/scrollHeight, body.offsetWidth/offsetHeight的最大值
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) { 			// 未传入参数size
			var orig = jQuery.css( elem, type ), 	// 获取元素的原始计算样式width/height
				ret = parseFloat( orig ); 			// 转为数值

			return jQuery.isNumeric( ret ) ? ret : orig; 		// 返回该数值

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" ); 	// 否则调用.css()设置width/height属性
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );