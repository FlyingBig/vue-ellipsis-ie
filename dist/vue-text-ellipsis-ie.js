(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.vueTextEllipsis = {}));
})(this, (function (exports) { 'use strict';

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var clientIsIe = "";

  var script = {
    name: "MutiEllipsis",
    props: {
      // 需要展示的内容
      text: {
        type: String,
        default: "",
      },
      // // 展示区域最大高度（优先级更高，自动匹配最合适的行数） ====== 抛弃--保持跟webkit多行省略一致
      // height: Number,
      // // 只有设置高度属性时才生效。 ====== 抛弃--保持跟webkit多行省略一致
      // heightType: {
      //   type: String,
      //   default: "remove", // 当设置高度不等于行高的倍数时，remove -> 采用此高度下最大的整数行数  / increase -> 采用此高度下最大的整数行数 + 1
      // },
      // 展示区域做大行数
      maxLine: {
        type: Number,
        default: 1,
      },
      // 是否完整展示内容
      isComplate: {
        type: Boolean,
        default: false,
      },
      // 字体样式
      txtStyle: Object,
      // 超出部分内容 展示字符
      more: {
        type: String,
        default: "...",
      },
      // 手动调整距离
      tabs: {
        type: Number,
        default: 0,
      },
    },
    data: function data() {
      return {
        textFat: {
          viewText: "", // 展示区域文字
          moreText: "", // 省略文字
        },

        containerStyle: {
          width: 0,
        },
        watchDisplay: "",
        textStyle: {
          height: 0,
          letterSpacing: 0,
          lineHeight: 0,
        },
        prDisplayNode: null, // 最近的祖先元素被隐藏的节点
        clientIsIe: "",
        webkitStyle: {},
        // 消除tab标签之间幽灵元素
        txtStylePlus: Object.assign({}, { "font-size": "16px" }, this.txtStyle),
        moreStrLength: 0,
        showSuffix: true,
      };
    },
    watch: {
      text: function text() {
        this.getStylesOfText();
      },
      isComplate: function isComplate(value) {
        if (this.textFat.moreText) {
          if (value) {
            var l = this.textFat.viewText.length;
            this.textFat.viewText = this.textFat.viewText.substring(0, l);
          }
        }
      },
    },
    computed: {
      limitWidth: function limitWidth() {
        return this.maxLine * this.containerStyle.width;
      },
    },
    mounted: function mounted() {
      var userAgent = navigator.userAgent;
      if (clientIsIe !== "") {
        this.clientIsIe = clientIsIe;
        if (clientIsIe) {
          this.getStylesOfText();
        } else {
          this.webkitStyle = {
            display: "-webkit-box",
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
            "-webkit-line-clamp": this.maxLine,
            "text-overflow": "ellipsis",
          };
        }
        return;
      }
      // 若超过显示的字符不为...，则使用ie模式处理
      if (
        this.more !== "..." ||
        (userAgent.indexOf("compatible") > -1 &&
          userAgent.indexOf("MSIE") > -1) ||
        userAgent.indexOf("Trident") > -1
      ) {
        clientIsIe = true;
        this.getStylesOfText();
      } else {
        clientIsIe = false;
        this.webkitStyle = {
          display: "-webkit-box",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
          "-webkit-line-clamp": this.maxLine,
          "text-overflow": "ellipsis",
        };
      }
      this.clientIsIe = clientIsIe;
    },
    methods: {
      getMoreStyle: function getMoreStyle() {
        return {
          "margin-left": ("-" + (this.textStyle.letterSpacing + this.moreStrLength / 2) + "px"),
        };
      },
      getStylesOfText: function getStylesOfText() {
        var this$1$1 = this;

        this.$nextTick(function () {
          setTimeout(function () {
            if (!this$1$1.$refs.container.offsetWidth) {
              this$1$1.watchDisplayNone();
              return;
            }
            // 获取填装text容器总宽度
            var span = this$1$1.$refs.text.cloneNode();
            span.innerHTML = this$1$1.$props.text;
            for (var k in this$1$1.txtStylePlus) {
              span.style[k] = this$1$1.txtStylePlus[k];
            }
            span.style.opacity = 1;
            this$1$1.$refs.container.appendChild(span);
            // 展示字体样式
            var textStyle = null;
            if (window.getComputedStyle) {
              textStyle = window.getComputedStyle(this$1$1.$refs.text);
              this$1$1.textStyle = {
                height: +textStyle.fontSize.replace(/px/, ""),
                letterSpacing: +textStyle.letterSpacing.replace(/px/, "") || 0,
                lineHeight:
                  textStyle.lineHeight === "normal" ? 1.2 : textStyle.lineHeight,
              };
            } else {
              textStyle = this$1$1.$refs.text.currentStyle();
            }
            this$1$1.containerStyle.width = Math.max(
              span.offsetWidth,
              this$1$1.$refs.container.offsetWidth -
                this$1$1.textStyle.height -
                this$1$1.textStyle.letterSpacing
            );
            this$1$1.$refs.container.removeChild(span);
            this$1$1.getChatsLength();
          }, 50);
        });
      },
      getChatsLength: function getChatsLength() {
        var ref = this.$props;
        var more = ref.more;
        var text = ref.text;
        var tabs = ref.tabs;
        var canvasContext = document.createElement("canvas").getContext("2d");
        var moreLength = canvasContext.measureText(more).width;
        this.moreStrLength = moreLength;
        // 计算区域内字符串个数(大概)
        var n = ~~Math.max(
          (this.limitWidth - moreLength) /
            (this.textStyle.height + this.textStyle.letterSpacing),
          0
        );
        var textStyle = "";
        if (window.getComputedStyle) {
          textStyle = window.getComputedStyle(this.$refs.text);
        } else {
          textStyle = this.$refs.text.currentStyle;
        }
        var textFontStyle =
          textStyle.font ||
          ((textStyle.fontWeight) + " " + (textStyle.fontSize) + " " + (textStyle.fontFamily.replace(/-apple-system,/g, "")));
        canvasContext.font = textFontStyle;
        var relStrWidth = 0;
        if (
          canvasContext.measureText(this.text).width +
            (this.text.length - 1) * this.textStyle.letterSpacing <
          this.limitWidth
        ) {
          // 内容小于外层容器宽度
          this.textFat.viewText = this.text;
          this.showSuffix = false;
        } else {
          this.showSuffix = true;

          while (n < this.text.length) {
            // 中文字符大小跟fontSize一致，英文/数字/英文符号等字符大小 小于fontsize
            var txt = text.substring(0, n);
            relStrWidth =
              canvasContext.measureText(txt).width +
              n * this.textStyle.letterSpacing +
              moreLength;
            if (relStrWidth > this.limitWidth) {
              break;
            }
            n++;
          }
          // 在容器高度判断字符长度是否超长
          var heightDom = document.createElement("div");
          heightDom.style.background = "red";
          heightDom.style.wordBreak = "break-all";
          var splitIndex = n - 1 + tabs;
          heightDom.innerHTML = "<span>" + (this.text.substring(
            0,
            splitIndex
          )) + "\n<span class=\"muti-ellipsis-content-more\" style=\"letter-spacing: 0; margin-left: -" + (this.textStyle.letterSpacing + this.moreStrLength / 2) + "px\">" + (this.more) + "</span></span>";
          this.$refs.container.appendChild(heightDom);
          var relHeight = heightDom.offsetHeight;
          var height =
            ~~this.maxLine * this.textStyle.height * this.textStyle.lineHeight +
            1;
          while (relHeight >= height) {
            --splitIndex;
            heightDom.innerHTML = "<span>" + (this.text.substring(
              0,
              splitIndex
            )) + "\n<span class=\"muti-ellipsis-content-more\" style=\"letter-spacing: 0;margin-left: -" + (this.textStyle.letterSpacing + this.moreStrLength / 2) + "px\">" + (this.more) + "</span></span>";
            relHeight = heightDom.offsetHeight;
          }
          this.$refs.container.removeChild(heightDom);
          this.textFat = {
            viewText: this.text.substring(0, splitIndex),
            moreText: this.text.substring(splitIndex),
          };
        }
      },
      watchDisplayNone: function watchDisplayNone() {
        try {
          var parentDom = this.$refs.container.parentElement;
          var watchedObject = null;
          var _this = this;
          // 寻找最近的display为none的祖先元素
          while (parentDom) {
            if (parentDom.style.display !== "none") {
              parentDom = parentDom.parentElement;
            } else {
              watchedObject = parentDom.style;
              break;
            }
          }
          this.watchDisplay = watchedObject.display;
          var isWatched = Object.getOwnPropertyDescriptor(
            watchedObject,
            "display"
          );
          this.prDisplayNode = parentDom;
          var watchers = parentDom.EllipsisWatchers || {};
          if (!watchers[this._uid]) {
            // 注册订阅者
            var fn = function (value) {
              if (value !== "none" && !this.textFat.viewText) {
                this.getStylesOfText();
              }
            };
            watchers[this._uid] = fn.bind(this);
            parentDom.EllipsisWatchers = watchers;
          }
          // 若该元素之前就被代理过，则忽略
          if (!isWatched || !typeof isWatched.isWatched === "function") {
            Object.defineProperty(watchedObject, "display", {
              configurable: true,
              set: function (value) {
                var watchers = parentDom.EllipsisWatchers;
                // 更改Dom样式
                var style = this.cssText.replace(/display:.+/g, "");
                if (value.trim() !== "") {
                  style += "display: " + value;
                }
                parentDom.setAttribute("style", style);
                _this.watchDisplay = value;
                // 分发当前节点下的所有组件
                for (var uid in watchers) {
                  watchers[uid](value);
                }
              },
              get: function () {
                return _this.watchDisplay;
              },
            });
          }
        } catch (e) {
          console.error(e);
        }
      },
    },
    beforeDestroy: function beforeDestroy() {
      if (this.prDisplayNode) {
        var watchers = this.prDisplayNode.EllipsisWatchers;
        if (watchers) {
          delete watchers[this._uid];
        }
      }
    },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      var options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      var hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              var originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              var existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  var isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return function (id, style) { return addStyle(id, style); };
  }
  var HEAD;
  var styles = {};
  function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          var code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  { style.element.setAttribute('media', css.media); }
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              var index = style.ids.size - 1;
              var textNode = document.createTextNode(code);
              var nodes = style.element.childNodes;
              if (nodes[index])
                  { style.element.removeChild(nodes[index]); }
              if (nodes.length)
                  { style.element.insertBefore(textNode, nodes[index]); }
              else
                  { style.element.appendChild(textNode); }
          }
      }
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { ref: "container", staticClass: "muti-ellipsis" }, [
      !_vm.clientIsIe
        ? _c(
            "div",
            {
              staticClass: "ellipsis-webkit-type",
              style: !_vm.isComplate && _vm.webkitStyle,
            },
            [_c("div", { style: _vm.txtStylePlus }, [_vm._v(_vm._s(_vm.text))])]
          )
        : _c("div", { staticClass: "ellipsis-ie-type" }, [
            _c(
              "div",
              { staticClass: "muti-ellipsis-content" },
              [
                _c("span", { ref: "text", style: _vm.txtStylePlus }, [
                  _vm._v(
                    "\n        " + _vm._s(_vm.textFat.viewText) + "\n        "
                  ),
                  _vm.showSuffix && !_vm.isComplate
                    ? _c(
                        "span",
                        {
                          staticClass: "muti-ellipsis-content-more",
                          style: _vm.getMoreStyle(),
                        },
                        [_vm._v(_vm._s(_vm.more))]
                      )
                    : _vm._e() ]),
                _vm._v(" "),
                _c("transition", { attrs: { name: "ellipsis-slide" } }, [
                  _vm.isComplate
                    ? _c(
                        "span",
                        { staticClass: "more", style: _vm.txtStylePlus },
                        [_vm._v(_vm._s(_vm.textFat.moreText))]
                      )
                    : _vm._e() ]) ],
              1
            ) ]) ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = function (inject) {
      if (!inject) { return }
      inject("data-v-226c7357_0", { source: "\n.muti-ellipsis[data-v-226c7357] {\r\n  word-break: break-all;\n}\n.muti-ellipsis-content[data-v-226c7357] {\r\n  font-size: 0;\n}\n.muti-ellipsis-content-more[data-v-226c7357] {\r\n  letter-spacing: 0;\n}\n.ellipsis-slide-enter-active[data-v-226c7357] {\r\n  transition: opacity 0.3s;\n}\n.ellipsis-slide-leave-active[data-v-226c7357] {\r\n  transition: opacity 0.3s;\n}\n.ellipsis-slide-enter[data-v-226c7357],\r\n.ellipsis-slide-leave-to[data-v-226c7357] {\r\n  opacity: 0;\n}\r\n", map: {"version":3,"sources":["E:\\programs\\githubPrograms\\vue-text-ellipsis-ie\\packages\\components\\textEllipsis\\textEllipsis.vue"],"names":[],"mappings":";AA0WA;EACA,qBAAA;AACA;AACA;EACA,YAAA;AACA;AACA;EACA,iBAAA;AACA;AACA;EACA,wBAAA;AACA;AACA;EACA,wBAAA;AACA;AACA;;EAEA,UAAA;AACA","file":"textEllipsis.vue","sourcesContent":["<template>\r\n  <div\r\n    class=\"muti-ellipsis\"\r\n    ref=\"container\"\r\n  >\r\n    <div\r\n      class=\"ellipsis-webkit-type\"\r\n      :style=\"!isComplate && webkitStyle\"\r\n      v-if=\"!clientIsIe\"\r\n    >\r\n      <div :style=\"txtStylePlus\">{{ text }}</div>\r\n    </div>\r\n    <div\r\n      class=\"ellipsis-ie-type\"\r\n      v-else\r\n    >\r\n      <div class=\"muti-ellipsis-content\">\r\n        <span\r\n          ref=\"text\"\r\n          :style=\"txtStylePlus\"\r\n        >\r\n          {{ textFat.viewText }}\r\n          <span\r\n            v-if=\"showSuffix && !isComplate\"\r\n            class=\"muti-ellipsis-content-more\"\r\n            :style=\"getMoreStyle()\"\r\n          >{{\r\n            more\r\n          }}</span>\r\n        </span>\r\n        <transition name=\"ellipsis-slide\">\r\n          <span\r\n            class=\"more\"\r\n            :style=\"txtStylePlus\"\r\n            v-if=\"isComplate\"\r\n          >{{\r\n            textFat.moreText\r\n          }}</span>\r\n        </transition>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</template>\r\n<script>\r\nlet clientIsIe = \"\";\r\n\r\nexport default {\r\n  name: \"MutiEllipsis\",\r\n  props: {\r\n    // 需要展示的内容\r\n    text: {\r\n      type: String,\r\n      default: \"\",\r\n    },\r\n    // // 展示区域最大高度（优先级更高，自动匹配最合适的行数） ====== 抛弃--保持跟webkit多行省略一致\r\n    // height: Number,\r\n    // // 只有设置高度属性时才生效。 ====== 抛弃--保持跟webkit多行省略一致\r\n    // heightType: {\r\n    //   type: String,\r\n    //   default: \"remove\", // 当设置高度不等于行高的倍数时，remove -> 采用此高度下最大的整数行数  / increase -> 采用此高度下最大的整数行数 + 1\r\n    // },\r\n    // 展示区域做大行数\r\n    maxLine: {\r\n      type: Number,\r\n      default: 1,\r\n    },\r\n    // 是否完整展示内容\r\n    isComplate: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n    // 字体样式\r\n    txtStyle: Object,\r\n    // 超出部分内容 展示字符\r\n    more: {\r\n      type: String,\r\n      default: \"...\",\r\n    },\r\n    // 手动调整距离\r\n    tabs: {\r\n      type: Number,\r\n      default: 0,\r\n    },\r\n  },\r\n  data() {\r\n    return {\r\n      textFat: {\r\n        viewText: \"\", // 展示区域文字\r\n        moreText: \"\", // 省略文字\r\n      },\r\n\r\n      containerStyle: {\r\n        width: 0,\r\n      },\r\n      watchDisplay: \"\",\r\n      textStyle: {\r\n        height: 0,\r\n        letterSpacing: 0,\r\n        lineHeight: 0,\r\n      },\r\n      prDisplayNode: null, // 最近的祖先元素被隐藏的节点\r\n      clientIsIe: \"\",\r\n      webkitStyle: {},\r\n      // 消除tab标签之间幽灵元素\r\n      txtStylePlus: Object.assign({}, { \"font-size\": \"16px\" }, this.txtStyle),\r\n      moreStrLength: 0,\r\n      showSuffix: true,\r\n    };\r\n  },\r\n  watch: {\r\n    text() {\r\n      this.getStylesOfText();\r\n    },\r\n    isComplate(value) {\r\n      if (this.textFat.moreText) {\r\n        if (value) {\r\n          const l = this.textFat.viewText.length;\r\n          this.textFat.viewText = this.textFat.viewText.substring(0, l);\r\n        }\r\n      }\r\n    },\r\n  },\r\n  computed: {\r\n    limitWidth() {\r\n      return this.maxLine * this.containerStyle.width;\r\n    },\r\n  },\r\n  mounted() {\r\n    let userAgent = navigator.userAgent;\r\n    if (clientIsIe !== \"\") {\r\n      this.clientIsIe = clientIsIe;\r\n      if (clientIsIe) {\r\n        this.getStylesOfText();\r\n      } else {\r\n        this.webkitStyle = {\r\n          display: \"-webkit-box\",\r\n          \"-webkit-box-orient\": \"vertical\",\r\n          overflow: \"hidden\",\r\n          \"-webkit-line-clamp\": this.maxLine,\r\n          \"text-overflow\": \"ellipsis\",\r\n        };\r\n      }\r\n      return;\r\n    }\r\n    // 若超过显示的字符不为...，则使用ie模式处理\r\n    if (\r\n      this.more !== \"...\" ||\r\n      (userAgent.indexOf(\"compatible\") > -1 &&\r\n        userAgent.indexOf(\"MSIE\") > -1) ||\r\n      userAgent.indexOf(\"Trident\") > -1\r\n    ) {\r\n      clientIsIe = true;\r\n      this.getStylesOfText();\r\n    } else {\r\n      clientIsIe = false;\r\n      this.webkitStyle = {\r\n        display: \"-webkit-box\",\r\n        \"-webkit-box-orient\": \"vertical\",\r\n        overflow: \"hidden\",\r\n        \"-webkit-line-clamp\": this.maxLine,\r\n        \"text-overflow\": \"ellipsis\",\r\n      };\r\n    }\r\n    this.clientIsIe = clientIsIe;\r\n  },\r\n  methods: {\r\n    getMoreStyle() {\r\n      return {\r\n        \"margin-left\": `-${\r\n          this.textStyle.letterSpacing + this.moreStrLength / 2\r\n        }px`,\r\n      };\r\n    },\r\n    getStylesOfText() {\r\n      this.$nextTick(() => {\r\n        setTimeout(() => {\r\n          if (!this.$refs.container.offsetWidth) {\r\n            this.watchDisplayNone();\r\n            return;\r\n          }\r\n          // 获取填装text容器总宽度\r\n          let span = this.$refs.text.cloneNode();\r\n          span.innerHTML = this.$props.text;\r\n          for (let k in this.txtStylePlus) {\r\n            span.style[k] = this.txtStylePlus[k];\r\n          }\r\n          span.style.opacity = 1;\r\n          this.$refs.container.appendChild(span);\r\n          // 展示字体样式\r\n          let textStyle = null;\r\n          if (window.getComputedStyle) {\r\n            textStyle = window.getComputedStyle(this.$refs.text);\r\n            this.textStyle = {\r\n              height: +textStyle.fontSize.replace(/px/, \"\"),\r\n              letterSpacing: +textStyle.letterSpacing.replace(/px/, \"\") || 0,\r\n              lineHeight:\r\n                textStyle.lineHeight === \"normal\" ? 1.2 : textStyle.lineHeight,\r\n            };\r\n          } else {\r\n            textStyle = this.$refs.text.currentStyle();\r\n          }\r\n          this.containerStyle.width = Math.max(\r\n            span.offsetWidth,\r\n            this.$refs.container.offsetWidth -\r\n              this.textStyle.height -\r\n              this.textStyle.letterSpacing\r\n          );\r\n          this.$refs.container.removeChild(span);\r\n          this.getChatsLength();\r\n        }, 50);\r\n      });\r\n    },\r\n    getChatsLength() {\r\n      let { more, text, tabs } = this.$props;\r\n      const canvasContext = document.createElement(\"canvas\").getContext(\"2d\");\r\n      const moreLength = canvasContext.measureText(more).width;\r\n      this.moreStrLength = moreLength;\r\n      // 计算区域内字符串个数(大概)\r\n      let n = ~~Math.max(\r\n        (this.limitWidth - moreLength) /\r\n          (this.textStyle.height + this.textStyle.letterSpacing),\r\n        0\r\n      );\r\n      let textStyle = \"\";\r\n      if (window.getComputedStyle) {\r\n        textStyle = window.getComputedStyle(this.$refs.text);\r\n      } else {\r\n        textStyle = this.$refs.text.currentStyle;\r\n      }\r\n      let textFontStyle =\r\n        textStyle.font ||\r\n        `${textStyle.fontWeight} ${\r\n          textStyle.fontSize\r\n        } ${textStyle.fontFamily.replace(/-apple-system,/g, \"\")}`;\r\n      canvasContext.font = textFontStyle;\r\n      let relStrWidth = 0;\r\n      if (\r\n        canvasContext.measureText(this.text).width +\r\n          (this.text.length - 1) * this.textStyle.letterSpacing <\r\n        this.limitWidth\r\n      ) {\r\n        // 内容小于外层容器宽度\r\n        this.textFat.viewText = this.text;\r\n        this.showSuffix = false;\r\n      } else {\r\n        this.showSuffix = true;\r\n\r\n        while (n < this.text.length) {\r\n          // 中文字符大小跟fontSize一致，英文/数字/英文符号等字符大小 小于fontsize\r\n          let txt = text.substring(0, n);\r\n          relStrWidth =\r\n            canvasContext.measureText(txt).width +\r\n            n * this.textStyle.letterSpacing +\r\n            moreLength;\r\n          if (relStrWidth > this.limitWidth) {\r\n            break;\r\n          }\r\n          n++;\r\n        }\r\n        // 在容器高度判断字符长度是否超长\r\n        let heightDom = document.createElement(\"div\");\r\n        heightDom.style.background = \"red\";\r\n        heightDom.style.wordBreak = \"break-all\";\r\n        let splitIndex = n - 1 + tabs;\r\n        heightDom.innerHTML = `<span>${this.text.substring(\r\n          0,\r\n          splitIndex\r\n        )}\\n<span class=\"muti-ellipsis-content-more\" style=\"letter-spacing: 0; margin-left: -${\r\n          this.textStyle.letterSpacing + this.moreStrLength / 2\r\n        }px\">${this.more}</span></span>`;\r\n        this.$refs.container.appendChild(heightDom);\r\n        let relHeight = heightDom.offsetHeight;\r\n        const height =\r\n          ~~this.maxLine * this.textStyle.height * this.textStyle.lineHeight +\r\n          1;\r\n        while (relHeight >= height) {\r\n          --splitIndex;\r\n          heightDom.innerHTML = `<span>${this.text.substring(\r\n            0,\r\n            splitIndex\r\n          )}\\n<span class=\"muti-ellipsis-content-more\" style=\"letter-spacing: 0;margin-left: -${\r\n            this.textStyle.letterSpacing + this.moreStrLength / 2\r\n          }px\">${this.more}</span></span>`;\r\n          relHeight = heightDom.offsetHeight;\r\n        }\r\n        this.$refs.container.removeChild(heightDom);\r\n        this.textFat = {\r\n          viewText: this.text.substring(0, splitIndex),\r\n          moreText: this.text.substring(splitIndex),\r\n        };\r\n      }\r\n    },\r\n    watchDisplayNone() {\r\n      try {\r\n        let parentDom = this.$refs.container.parentElement;\r\n        let watchedObject = null;\r\n        const _this = this;\r\n        // 寻找最近的display为none的祖先元素\r\n        while (parentDom) {\r\n          if (parentDom.style.display !== \"none\") {\r\n            parentDom = parentDom.parentElement;\r\n          } else {\r\n            watchedObject = parentDom.style;\r\n            break;\r\n          }\r\n        }\r\n        this.watchDisplay = watchedObject.display;\r\n        const isWatched = Object.getOwnPropertyDescriptor(\r\n          watchedObject,\r\n          \"display\"\r\n        );\r\n        this.prDisplayNode = parentDom;\r\n        let watchers = parentDom.EllipsisWatchers || {};\r\n        if (!watchers[this._uid]) {\r\n          // 注册订阅者\r\n          const fn = function (value) {\r\n            if (value !== \"none\" && !this.textFat.viewText) {\r\n              this.getStylesOfText();\r\n            }\r\n          };\r\n          watchers[this._uid] = fn.bind(this);\r\n          parentDom.EllipsisWatchers = watchers;\r\n        }\r\n        // 若该元素之前就被代理过，则忽略\r\n        if (!isWatched || !typeof isWatched.isWatched === \"function\") {\r\n          Object.defineProperty(watchedObject, \"display\", {\r\n            configurable: true,\r\n            set: function (value) {\r\n              let watchers = parentDom.EllipsisWatchers;\r\n              // 更改Dom样式\r\n              let style = this.cssText.replace(/display:.+/g, \"\");\r\n              if (value.trim() !== \"\") {\r\n                style += `display: ${value}`;\r\n              }\r\n              parentDom.setAttribute(\"style\", style);\r\n              _this.watchDisplay = value;\r\n              // 分发当前节点下的所有组件\r\n              for (let uid in watchers) {\r\n                watchers[uid](value);\r\n              }\r\n            },\r\n            get: function () {\r\n              return _this.watchDisplay;\r\n            },\r\n          });\r\n        }\r\n      } catch (e) {\r\n        console.error(e);\r\n      }\r\n    },\r\n  },\r\n  beforeDestroy() {\r\n    if (this.prDisplayNode) {\r\n      let watchers = this.prDisplayNode.EllipsisWatchers;\r\n      if (watchers) {\r\n        delete watchers[this._uid];\r\n      }\r\n    }\r\n  },\r\n};\r\n</script>\r\n<style lang=\"css\" scoped>\r\n.muti-ellipsis {\r\n  word-break: break-all;\r\n}\r\n.muti-ellipsis-content {\r\n  font-size: 0;\r\n}\r\n.muti-ellipsis-content-more {\r\n  letter-spacing: 0;\r\n}\r\n.ellipsis-slide-enter-active {\r\n  transition: opacity 0.3s;\r\n}\r\n.ellipsis-slide-leave-active {\r\n  transition: opacity 0.3s;\r\n}\r\n.ellipsis-slide-enter,\r\n.ellipsis-slide-leave-to {\r\n  opacity: 0;\r\n}\r\n</style>\r\n"]}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__ = "data-v-226c7357";
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    var __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  function install(vue) {
    vue.component(__vue_component__.name, __vue_component__);
  }

  exports.MutiEllipsis = __vue_component__;
  exports["default"] = install;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
