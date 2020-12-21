!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Sqrl={})}(this,(function(e){"use strict";function t(e){var n,r,s=new Error(e);return n=s,r=t.prototype,Object.setPrototypeOf?Object.setPrototypeOf(n,r):n.__proto__=r,s}function n(e,n,r){var s=n.slice(0,r).split(/\n/),o=s.length,i=s[o-1].length+1;throw t(e+=" at line "+o+" col "+i+":\n\n  "+n.split(/\n/)[o-1]+"\n  "+Array(i).join(" ")+"^")}t.prototype=Object.create(Error.prototype,{name:{value:"Squirrelly Error",enumerable:!1}});var r=new Function("return this")().Promise,s=!1;try{s=new Function("return (async function(){}).constructor")()}catch(e){if(!(e instanceof SyntaxError))throw e}function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function i(e,t,n){for(var r in t)o(t,r)&&(null==t[r]||"object"!=typeof t[r]||"storage"!==r&&"prefixes"!==r||n?e[r]=t[r]:e[r]=i({},t[r]));return e}var a=/^async +/,c=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,l=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,u=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g,p=/[.*+\-?^${}()|[\]\\]/g;function f(e){return p.test(e)?e.replace(p,"\\$&"):e}function d(e,r){r.rmWhitespace&&(e=e.replace(/[\r\n]+/g,"\n").replace(/^\s+|\s+$/gm,"")),c.lastIndex=0,l.lastIndex=0,u.lastIndex=0;var s=r.prefixes,o=[s.h,s.b,s.i,s.r,s.c,s.e].reduce((function(e,t){return e&&t?e+"|"+f(t):t?f(t):e}),""),i=new RegExp("([|()]|=>)|('|\"|`|\\/\\*)|\\s*((\\/)?(-|_)?"+f(r.tags[1])+")","g"),p=new RegExp("([^]*?)"+f(r.tags[0])+"(-|_)?\\s*("+o+")?\\s*","g"),d=0,h=!1;function m(t,s){var o,f={f:[]},m=0,g="c";function y(t){var s=e.slice(d,t),o=s.trim();if("f"===g)"safe"===o?f.raw=!0:r.async&&a.test(o)?(o=o.replace(a,""),f.f.push([o,"",!0])):f.f.push([o,""]);else if("fp"===g)f.f[f.f.length-1][1]+=o;else if("err"===g){if(o){var i=s.search(/\S/);n("invalid syntax",e,d+i)}}else f[g]=o;d=t+1}for("h"===s||"b"===s||"c"===s?g="n":"r"===s&&(f.raw=!0,s="i"),i.lastIndex=d;null!==(o=i.exec(e));){var v=o[1],b=o[2],x=o[3],w=o[4],E=o[5],A=o.index;if(v)"("===v?(0===m&&("n"===g?(y(A),g="p"):"f"===g&&(y(A),g="fp")),m++):")"===v?0===--m&&"c"!==g&&(y(A),g="err"):0===m&&"|"===v?(y(A),g="f"):"=>"===v&&(y(A),d+=1,g="res");else if(b){if("/*"===b){var C=e.indexOf("*/",i.lastIndex);-1===C&&n("unclosed comment",e,o.index),i.lastIndex=C+2}else if("'"===b){l.lastIndex=o.index,l.exec(e)?i.lastIndex=l.lastIndex:n("unclosed string",e,o.index)}else if('"'===b){u.lastIndex=o.index,u.exec(e)?i.lastIndex=u.lastIndex:n("unclosed string",e,o.index)}else if("`"===b){c.lastIndex=o.index,c.exec(e)?i.lastIndex=c.lastIndex:n("unclosed string",e,o.index)}}else if(x)return y(A),d=A+o[0].length,p.lastIndex=d,h=E,w&&"h"===s&&(s="s"),f.t=s,f}return n("unclosed tag",e,t),f}var g=function o(i,c){i.b=[],i.d=[];var l,u=!1,f=[];function g(e,t){e&&(e=function(e,t,n,r){var s,o;return"string"==typeof t.autoTrim?s=o=t.autoTrim:Array.isArray(t.autoTrim)&&(s=t.autoTrim[1],o=t.autoTrim[0]),(n||!1===n)&&(s=n),(r||!1===r)&&(o=r),"slurp"===s&&"slurp"===o?e.trim():("_"===s||"slurp"===s?e=String.prototype.trimLeft?e.trimLeft():e.replace(/^[\s\uFEFF\xA0]+/,""):"-"!==s&&"nl"!==s||(e=e.replace(/^(?:\n|\r|\r\n)/,"")),"_"===o||"slurp"===o?e=String.prototype.trimRight?e.trimRight():e.replace(/[\s\uFEFF\xA0]+$/,""):"-"!==o&&"nl"!==o||(e=e.replace(/(?:\n|\r|\r\n)$/,"")),e)}(e,r,h,t))&&(e=e.replace(/\\|'/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n"),f.push(e))}for(;null!==(l=p.exec(e));){var y,v=l[1],b=l[2],x=l[3]||"";for(var w in s)if(s[w]===x){y=w;break}g(v,b),d=l.index+l[0].length,y||n("unrecognized tag type: "+x,e,d);var E=m(l.index,y),A=E.t;if("h"===A){var C=E.n||"";r.async&&a.test(C)&&(E.a=!0,E.n=C.replace(a,"")),E=o(E),f.push(E)}else if("c"===A){if(i.n===E.n)return u?(u.d=f,i.b.push(u)):i.d=f,i;n("Helper start and end don't match",e,l.index+l[0].length)}else if("b"===A){u?(u.d=f,i.b.push(u)):i.d=f;var O=E.n||"";r.async&&a.test(O)&&(E.a=!0,E.n=O.replace(a,"")),u=E,f=[]}else if("s"===A){var S=E.n||"";r.async&&a.test(S)&&(E.a=!0,E.n=S.replace(a,"")),f.push(E)}else f.push(E)}if(!c)throw t('unclosed helper "'+i.n+'"');return g(e.slice(d,e.length),!1),i.d=f,i}({f:[]},!0);if(r.plugins)for(var y=0;y<r.plugins.length;y++){var v=r.plugins[y];v.processAST&&(g.d=v.processAST(g.d,r))}return g.d}function h(e,t){var n=d(e,t),r="var tR='';"+(t.useWith?"with("+t.varName+"||{}){":"")+b(n,t)+"if(cb){cb(null,tR)} return tR"+(t.useWith?"}":"");if(t.plugins)for(var s=0;s<t.plugins.length;s++){var o=t.plugins[s];o.processFnString&&(r=o.processFnString(r,t))}return r}function m(e,t){for(var n=0;n<t.length;n++){var r=t[n][0],s=t[n][1];e=(t[n][2]?"await ":"")+"c.l('F','"+r+"')("+e,s&&(e+=","+s),e+=")"}return e}function g(e,t,n,r,s,o){var i="{exec:"+(s?"async ":"")+v(n,t,e)+",params:["+r+"]";return o&&(i+=",name:'"+o+"'"),s&&(i+=",async:true"),i+="}"}function y(e,t){for(var n="[",r=0;r<e.length;r++){var s=e[r];n+=g(t,s.res||"",s.d,s.p||"",s.a,s.n),r<e.length&&(n+=",")}return n+="]"}function v(e,t,n){return"function("+t+"){var tR='';"+b(e,n)+"return tR}"}function b(e,t){for(var n=0,r=e.length,s="";n<r;n++){var o=e[n];if("string"==typeof o){s+="tR+='"+o+"';"}else{var i=o.t,a=o.c||"",c=o.f,l=o.n||"",u=o.p||"",p=o.res||"",f=o.b,d=!!o.a;if("i"===i){t.defaultFilter&&(a="c.l('F','"+t.defaultFilter+"')("+a+")");var h=m(a,c);!o.raw&&t.autoEscape&&(h="c.l('F','e')("+h+")"),s+="tR+="+h+";"}else if("h"===i)if(t.storage.nativeHelpers.get(l))s+=t.storage.nativeHelpers.get(l)(o,t);else{var v=(d?"await ":"")+"c.l('H','"+l+"')("+g(t,p,o.d,u,d);v+=f?","+y(f,t):",[]",s+="tR+="+m(v+=",c)",c)+";"}else"s"===i?s+="tR+="+m((d?"await ":"")+"c.l('H','"+l+"')({params:["+u+"]},[],c)",c)+";":"e"===i&&(s+=a+"\n")}}return s}var x=function(){function e(e){this.cache=e}return e.prototype.define=function(e,t){this.cache[e]=t},e.prototype.get=function(e){return this.cache[e]},e.prototype.remove=function(e){delete this.cache[e]},e.prototype.reset=function(){this.cache={}},e.prototype.load=function(e){i(this.cache,e,!0)},e}();function w(e,n,r,s){if(n&&n.length>0)throw t((s?"Native":"")+"Helper '"+e+"' doesn't accept blocks");if(r&&r.length>0)throw t((s?"Native":"")+"Helper '"+e+"' doesn't accept filters")}var E={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function A(e){return E[e]}var C=new x({}),O=new x({each:function(e,t){var n="",r=e.params[0];if(w("each",t,!1),e.async)return new Promise((function(t){!function e(t,n,r,s,o){r(t[n],n).then((function(i){s+=i,n===t.length-1?o(s):e(t,n+1,r,s,o)}))}(r,0,e.exec,n,t)}));for(var s=0;s<r.length;s++)n+=e.exec(r[s],s);return n},foreach:function(e,t){var n=e.params[0];if(w("foreach",t,!1),e.async)return new Promise((function(t){!function e(t,n,r,s,o,i){s(n[r],t[n[r]]).then((function(a){o+=a,r===n.length-1?i(o):e(t,n,r+1,s,o,i)}))}(n,Object.keys(n),0,e.exec,"",t)}));var r="";for(var s in n)o(n,s)&&(r+=e.exec(s,n[s]));return r},include:function(e,n,r){w("include",n,!1);var s=r.storage.templates.get(e.params[0]);if(!s)throw t('Could not fetch template "'+e.params[0]+'"');return s(e.params[1],r)},extends:function(e,n,r){var s=e.params[1]||{};s.content=e.exec();for(var o=0;o<n.length;o++){var i=n[o];s[i.name]=i.exec()}var a=r.storage.templates.get(e.params[0]);if(!a)throw t('Could not fetch template "'+e.params[0]+'"');return a(s,r)},useScope:function(e,t){return w("useScope",t,!1),e.exec(e.params[0])}}),S=new x({if:function(e,t){w("if",!1,e.f,!0);var n="if("+e.p+"){"+b(e.d,t)+"}";if(e.b)for(var r=0;r<e.b.length;r++){var s=e.b[r];"else"===s.n?n+="else{"+b(s.d,t)+"}":"elif"===s.n&&(n+="else if("+s.p+"){"+b(s.d,t)+"}")}return n},try:function(e,n){if(w("try",!1,e.f,!0),!e.b||1!==e.b.length||"catch"!==e.b[0].n)throw t("native helper 'try' only accepts 1 block, 'catch'");var r="try{"+b(e.d,n)+"}",s=e.b[0];return r+="catch"+(s.res?"("+s.res+")":"")+"{"+b(s.d,n)+"}"},block:function(e,t){return w("block",e.b,e.f,!0),"if(!"+t.varName+"["+e.p+"]){tR+=("+v(e.d,"",t)+")()}else{tR+="+t.varName+"["+e.p+"]}"}}),j=new x({e:function(e){var t=String(e);return/[&<>"']/.test(t)?t.replace(/[&<>"']/g,A):t}}),T={varName:"it",autoTrim:[!1,"nl"],autoEscape:!0,defaultFilter:!1,tags:["{{","}}"],l:function(e,n){if("H"===e){var r=this.storage.helpers.get(n);if(r)return r;throw t("Can't find helper '"+n+"'")}if("F"===e){var s=this.storage.filters.get(n);if(s)return s;throw t("Can't find filter '"+n+"'")}},async:!1,storage:{helpers:O,nativeHelpers:S,filters:j,templates:C},prefixes:{h:"@",b:"#",i:"",r:"*",c:"/",e:"!"},cache:!1,plugins:[],useWith:!1};function q(e,t){var n={};return i(n,T),t&&i(n,t),e&&i(n,e),n.l.bind(n),n}function N(e,n){var r=q(n||{}),o=Function;if(r.async){if(!s)throw t("This environment doesn't support async/await");o=s}try{return new o(r.varName,"c","cb",h(e,r))}catch(n){throw n instanceof SyntaxError?t("Bad template syntax\n\n"+n.message+"\n"+Array(n.message.length+1).join("=")+"\n"+h(e,r)):n}}function R(e,t){var n;return t.cache&&t.name&&t.storage.templates.get(t.name)?t.storage.templates.get(t.name):(n="function"==typeof e?e:N(e,t),t.cache&&t.name&&t.storage.templates.define(t.name,n),n)}T.l.bind(T),e.compile=N,e.compileScope=b,e.compileScopeIntoFunction=v,e.compileToString=h,e.defaultConfig=T,e.filters=j,e.getConfig=q,e.helpers=O,e.nativeHelpers=S,e.parse=d,e.render=function(e,n,s,o){var i=q(s||{});if(!i.async)return R(e,i)(n,i);if(!o){if("function"==typeof r)return new r((function(t,r){try{t(R(e,i)(n,i))}catch(e){r(e)}}));throw t("Please provide a callback function, this env doesn't support Promises")}try{R(e,i)(n,i,o)}catch(e){return o(e)}},e.templates=C,Object.defineProperty(e,"__esModule",{value:!0})})),function(e){"use strict";const t={initValues:function(e){e.missings={required:[],optional:[]},e.different={},e.errors=[],e.compiled={}},objLiteral:function(e){return"[object object]"===Object.prototype.toString.call(e).toLowerCase()},typesAccepted:["string","number","boolean","array","object"],getType:{obj:function(e){return Array.isArray(e)?"array":typeof e},schema:function(e){let n;if(Array.isArray(e))n="mixed";else if(t.objLiteral(e))n=e.hasOwnProperty("type")?this.schema(e.type):"object";else{const r=typeof e;n="string"===r&&-1!==t.typesAccepted.indexOf(e)?e:r}return n}},reg:function(e,t,n){let r=!1;return n?e.hasOwnProperty(n)||(e[n]=t,r=!0):(e.push(t),r=!0),r},mergeProps:function(e,t,n){const r=t.errors;let s,o;r.length&&(e.errors=e.errors.concat(r)),["required","optional"].forEach((function(n){s=t.missings[n],s.length&&(e.missings[n]=e.missings[n].concat(s))})),["different","compiled"].forEach((function(r){o=t[r],Object.keys(o).length&&(e[r].hasOwnProperty(n)||(e[r][n]={}),e[r][n]=o)}))}};function n(e){if(!e)return console.log("Object missing ",e);this.schema=Object.assign({},e),t.initValues(this)}n.version="1.0.2Beta",n.prototype.compile=function(e){return e&&this.validate(e),!this.missings.required.length&&this.compiled},n.prototype.validate=function(e){t.initValues(this);const r=this.schema,s=this;let o=!0;return Object.keys(r).forEach((function(i){const a=r[i],c=t.getType.schema(a);if(e.hasOwnProperty(i)){const r=e[i],l=t.getType.obj(r);switch(c){case"string":case"number":case"boolean":case"array":c!==l?(a.required&&(o=!1),t.reg(s.different,{current:l,expected:c,value:r},i)):t.reg(s.compiled,r,i);break;case"object":if("object"===l)if(a.hasOwnProperty("properties")){const e=new n(a.properties);e.validate(r)||(o=!1),t.mergeProps(s,e,i)}else t.reg(s.compiled,r,i);else a.required&&(o=!1,t.reg(s.different,{current:l,expected:c,value:r},i));break;case"mixed":!(Array.isArray(a)?a:a.type).filter((function(e){return e===l})).length&&a.required?(o=!1,t.reg(s.different,{current:l,expected:a,value:r},i)):t.reg(s.compiled,r,i);break;default:console.log("format type dont accepted: "+c),o=!1}}else{let e;a.required?(o=!1,e="required"):e="optional",t.reg(s.missings[e],i),a.hasOwnProperty("default")&&(s.compiled[i]=a.default)}})),o},"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(module.exports=n),exports.Schema=n):e.Schema=n}(this),function(e){"use strict";function t(){this.events=null,this.version="1.1"}function n(e,t){this.name=e,this.detail=t&&t.detail?t.detail:null,this.constant=!(!t||!t.constant)&&t.constant}function r(e){if(t.call(this),this.registered=new Map,this.builded=new Map,this.mounted=new Map,this.data=new Map,e){const t=this;Object.keys(e).forEach((function(n){t[n]=e[n]}))}}window.SmartEvent=n,t.prototype.addEventListener=function(e,t,n){this.events||(this.events={});const r={cb:t,options:Object.assign({once:!1},n||{})},s=this.events[e];if(s)s.executed?s.constant?t(r.options):(s.executed=!1,s.fns.set(t,r)):s.fns.set(t,r);else{const t=new Map;t.set(r.cb,r),this.events[e]={fns:t}}},t.prototype.removeEventListener=function(e,t){if(!this.events||!this.events[e])return!1;void 0===t?delete this.events[e]:(this.events[e].fns.delete(t),this.events[e].fns.size||this.events[e].constant||delete this.events[e]),Object.keys(this.events).length||(this.events=null)},t.prototype.dispatchEvent=function(e){if(!this.events||!this.events[e.name])return!1;const t=this;this.events[e.name].executed=!0,e.constant&&(this.events[e.name].constant=!0),this.events[e.name].fns.forEach((function(n,r){r.call(t,e),n.options.once&&t.removeEventListener(e.name,r)}))},r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.prototype.version="1.0.0",r.prototype.utils={},r.prototype.utils.attrsCleaner=function(e,t,n){const r=e.shift(),s=r.value.trim();if("[]"===s||"[undefined]"===s||"undefined"===s)"value"===r.name&&(t.value=""),t.removeAttribute(r.name);else{const e=r.value.length;"["===r.value.substring(0,1)&&"]"===r.value.substring(e-1)&&t.setAttribute(r.name,r.value.substring(1,e-1))}if(!e.length)return n();this.attrsCleaner(e,t,n)},r.prototype.utils.forRecur=function(e,t,n){const r=this,s=Array.isArray(e)?e:this.toArray(e),o=s.shift();t(o,(function(){s.length?r.forRecur(s,t,n):n&&n()}))},r.prototype.utils.getProps=function(e){const t=this,n=e.attributes;if(!n.length)return!1;const r={};let s,o,i;const a=["placeholder","value"];return Array.prototype.forEach.call(n,(function(n){if(o=n.value.trim(),-1!==a.indexOf(n.name))r[n.name]=o;else if(isNaN(o))if(s=o.substring(0,1),"["===s||"{"===s)if("pattern"!==n.name&&"regex"!==n.name)try{r[n.name]=JSON.parse(o)}catch(r){t.regError("Error de parseo de data (attr : "+n.name+")",e.outerHTML.replace(/&quot;/g,'"'))}else r[n.name]="true"===o||"false"===o?JSON.parse(o):o;else i=o.length,"/"===s&&"/"===o.substring(i-1)?r[n.name]=JSON.parse(o.substring(1,i-1)):r[n.name]="true"===o||"false"===o?JSON.parse(o):o;else r[n.name]=""===o||Number(o)})),r},r.prototype.utils.isComponent=function(e){const t=e.nodeName.toLowerCase();return"c-"===t.substring(0,2)&&t.substring(2)},r.prototype.utils.regError=function(e,t,n){const r=new Error;return r.name=e,r.message=t,console.error(r),n&&console.log(n),r},r.prototype.utils.toArray=function(e){return Array.prototype.map.call(e,(function(e){return e}))},r.prototype.notifyComponent=function(e,t,r){this.dispatchEvent(new n("component:"+e,{detail:r})),t&&setTimeout((function(){t.dispatchEvent(new n(e,{detail:r}))}),0)},r.prototype.searchComponents=function(e){const t=e.querySelectorAll("*");if(!t.length)return[];const n=this;return Array.prototype.filter.call(t,(function(e){return n.utils.isComponent(e)}))},r.prototype.registerComponent=function(e,n){if(this.registered.has(e))return this.utils.regError("Componente Duplicado",'Ya se había registrado el componente "'+e+'".');if(n||(n={}),n.styles){const t=document.createElement("style");t.type="text/css",t.innerHTML=n.styles,t.id=e,document.body.appendChild(t)}function r(){t.call(this,e)}r.prototype=Object.create(t.prototype),r.prototype.constructor=r;const s={schema:n.schema?new Schema(n.schema):null,styles:n.styles||null,template:n.template||null,script:n.script||null,constructor:r,instance:new r};this.registered.set(e,s);const o=Object.assign({},s);return delete o.constructor,delete o.instance,this.notifyComponent("registered",s.instance,{name:e,data:o}),s.instance},r.prototype.createComponent=function(e,t,n){if(t||(t={}),!this.registered.has(e))return this.utils.regError("Componente Inexistente",'No se puede crear el componente "'+e+'", porque no está registrado.');const r=this,s=this.registered.get(e);let o=null;if(s.schema){if(!s.schema.validate(t))return this.utils.regError("Data inválida",'No fué posible crear el componente "'+e+'", ya que su data es inválida.',{different:s.schema.different,missings:{required:s.schema.missings.required,optional:s.schema.missings.optional},errors:s.schema.errors});o=s.schema.compile(t)}if(!s.template){let t;return s.script&&(t=new s.script(r,null,o)),this.notifyComponent("created",s.instance,{name:e}),n&&n(null,o,s.script,t),s.instance}const i=document.createElement("div");i.innerHTML=o?Sqrl.render(s.template,o):s.template;const a=i.querySelectorAll("*");if(a.length)this.utils.forRecur(a,(function(e,t){let n=e.attributes;if(!n.length)return t();n=r.utils.toArray(n),r.utils.attrsCleaner(n,e,t)}),(function(){let t;if(s.script){let e=i.querySelector("[component]");e&&e.removeAttribute("component"),t=new s.script(r,e,o),s.script.prototype.created&&t.created()}const a=i.children[0];r.notifyComponent("created",s.instance,{name:e,node:a}),n&&n(a,o,s.script,t)}));else{let t;s.script&&(t=new s.script(this,null,o),s.script.prototype.created&&t.created()),this.notifyComponent("created",s.instance,{name:e}),n&&n(null,o,s.script,t)}return s.instance};const s=function(e,t,n,r){this.App=e,this.name=t,this.gross=n,this.constructed=null,this.cb=r,this.instance=null,this.data=null,this.constr=null};s.prototype.saveData=function(e){const t=this.App.utils.getProps(e);return t&&t.hasOwnProperty("id")&&!this.App.data.has(t.id)&&this.App.data.set(t.id,{innerHTML:e.innerHTML.trim(),outerHTML:e.outerHTML.trim(),props:t}),t},s.prototype.created=function(e,t,n,r){const s=this;if(this.constructed=e,this.props=t,this.constr=n,this.instance=r,!e)return this.builded();const o=e.hasAttribute("content")?e:e.querySelector("[content]"),i=this.App.searchComponents(e);if(!i.length)return this.haveChildren(this.gross,(function(e){e.length?s.childrens(e,o):s.builded()})),!1;this.App.utils.forRecur(i,(function(e,t){s.App.buildComponent(e,(function(n){n.node?s.App.mountComponent({gross:e,builded:n.node,props:n.props},t):t()}))}),(function(){s.haveChildren(s.gross,(function(e){e.length?s.childrens(e,o):s.builded()}))}))},s.prototype.builded=function(){const e={node:this.constructed,props:this.props};this.App.builded.set(this.gross,{node:this.constructed,props:this.props}),this.gross&&this.gross.dispatchEvent(new CustomEvent("builded",{detail:e})),this.App.notifyComponent("builded",!1,Object.assign({name:this.name},e)),this.constr&&this.constr.prototype.builded&&this.instance.builded(e),this.cb&&this.cb({node:this.constructed,props:this.props})},s.prototype.haveChildren=function(e,t){let n=e.childNodes;if(!n.length)return t([]);const r=[];this.App.utils.forRecur(n,(function(e,t){3===e.nodeType?e.textContent.trim()&&r.push(e):r.push(e),t()}),(function(){t(r)}))},s.prototype.childrens=function(e,t){const n=this;if(!t)return this.App.utils.regError("Falta Nodo contenedor","El componente "+node.outerHTML+" tiene nodos hijos pero no se a determinado el nodo que los contendrá.");this.App.utils.forRecur(e,(function(e,n){t.appendChild(e),n()}),(function(){n.builded()}))},r.prototype.buildComponent=function(e,t){const n=this.utils.isComponent(e);if(!n)return this.utils.regError("Componente inválido","El Nodo pasado NO es un componente, no se puede procesar");if(this.builded.has(e))return this.utils.regError("Ya construido","El Componente yá a sido construido.");const r=new s(this,n,e,t),o=r.saveData(e);if(!this.registered.has(n))return this.utils.regError("Sin registrar",'El componente "'+n+'" no puede ser construido porque no a sido registrado previamente.');this.createComponent(n,o,r.created.bind(r))},r.prototype.mountComponent=function(e,t){if(this.mounted.has(e.gross))return this.utils.regError("Ya montado","El componente yá fué montado con anterioridad: ",e.gross);let n=e.gross.parentNode;if(n){n.replaceChild(e.builded,e.gross),this.mounted.set(e.gross,{builded:e.builded,props:e.props});const r={name:e.name,gross:e.gross,builded:e.builded,props:e.props};this.notifyComponent("mounted",e.instance,r),t&&t(r)}},window&&(window.Smart=r),"object"==typeof module&&module.exports?module.exports=r:e.Smart=r}(this);