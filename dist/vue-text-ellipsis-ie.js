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

  var script = {
    name: "DsfMutiEllipsis",
    props: {
      // 需要展示的内容
      text: {
        type: String,
        default: "",
      },
      // 展示区域最大高度（优先级更高，自动匹配最合适的行数）
      height: Number,
      // 只有设置高度属性时才生效。
      heightType: {
        type: String,
        default: "remove", // 当设置高度不等于行高的倍数时，remove -> 采用此高度下最大的整数行数  / increase -> 采用此高度下最大的整数行数 + 1
      },
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
    data() {
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
      };
    },
    watch: {
      text() {
        this.getStylesOfText();
      },
      isComplate(value) {
        if (this.textFat.moreText) {
          if (value) {
            const l = this.textFat.viewText.length - this.$props.more.length;
            this.textFat.viewText = this.textFat.viewText.substring(0, l);
          } else {
            this.textFat.viewText = this.textFat.viewText + this.$props.more;
          }
        }
      },
    },
    computed: {
      limitWidth() {
        let maxWidth = 0;
        let { heightType, height, maxLine } = this.$props;
        if (height !== undefined) {
          let numberLineHeight =
            this.textStyle.lineHeight === "normal"
              ? 1.2 * this.txtStyle.height
              : parseFloat(this.textStyle.lineHeight);
          maxWidth = ~~(height / numberLineHeight) * this.containerStyle.width;
          if (heightType === "increase" && height % numberLineHeight) {
            maxWidth += this.containerStyle.width;
          }
        } else {
          maxWidth = maxLine * this.containerStyle.width;
        }
        return maxWidth;
      },
    },
    mounted() {
      this.getStylesOfText();
    },
    methods: {
      getStylesOfText() {
        this.$nextTick(() => {
          setTimeout(() => {
            if (!this.$refs.container.offsetWidth) {
              this.watchDisplayNone();
              return;
            }
            // 获取填装text容器总宽度
            let span = this.$refs.text.cloneNode();
            span.innerHTML = this.$props.text;
            for (let k in this.$props.txtStyle) {
              span.style[k] = this.$props.txtStyle[k];
            }
            span.style.opacity = 0;
            this.$refs.container.appendChild(span);
            // 展示字体样式
            let textStyle = null;
            if (window.getComputedStyle) {
              textStyle = window.getComputedStyle(this.$refs.text);
              this.textStyle = {
                height: +textStyle.fontSize.replace(/px/, ""),
                letterSpacing: +textStyle.letterSpacing.replace(/px/, "") || 0,
                lineHeight: textStyle.lineHeight,
              };
            } else {
              textStyle = this.$refs.text.currentStyle();
            }
            this.containerStyle.width = Math.max(
              span.offsetWidth,
              this.$refs.container.offsetWidth -
                this.textStyle.height -
                this.textStyle.letterSpacing
            );
            this.$refs.container.removeChild(span);
            this.getChatsLength();
          }, 50);
        });
      },
      getChatsLength() {
        let { more, text, tabs } = this.$props;
        // 规定区域内字符串个数
        let n = ~~Math.max(
          this.limitWidth /
            (this.textStyle.height + this.textStyle.letterSpacing) -
            more.length,
          0
        );
        const canvasContext = document.createElement("canvas").getContext("2d");
        let textStyle = "";
        if (window.getComputedStyle) {
          textStyle = window.getComputedStyle(this.$refs.text);
        } else {
          textStyle = this.$refs.text.currentStyle;
        }
        let textFontStyle =
          textStyle.font ||
          `${textStyle.fontWeight} ${
          textStyle.fontSize
        } ${textStyle.fontFamily.replace(/-apple-system,/g, "")}`;
        canvasContext.font = textFontStyle;
        let relStrWidth = 0;
        if (
          canvasContext.measureText(this.text).width +
            (this.text.length - 1) * this.textStyle.letterSpacing <
          this.limitWidth
        ) {
          this.textFat.viewText = this.text;
        } else {
          let moreLength =
            canvasContext.measureText(more).width +
            more.length * this.textStyle.letterSpacing;
          while (n < this.text.length) {
            // 中文字符大小跟fontSize一致，英文/数字/英文符号等字符大小 小于fontsize
            let txt = text.substring(0, n);
            relStrWidth =
              canvasContext.measureText(txt).width +
              n * this.textStyle.letterSpacing +
              moreLength;
            if (relStrWidth > this.limitWidth) {
              break;
            }
            n++;
          }
          let splitIndex = n - 1 + tabs;
          this.textFat = {
            viewText: this.text.substring(0, splitIndex) + more,
            moreText: this.text.substring(splitIndex),
          };
        }
      },
      watchDisplayNone() {
        try {
          let parentDom = this.$refs.container.parentElement;
          let watchedObject = null;
          const _this = this;
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
          const isWatched = Object.getOwnPropertyDescriptor(
            watchedObject,
            "display"
          );
          this.prDisplayNode = parentDom;
          let watchers = parentDom.EllipsisWatchers || {};
          if (!watchers[this._uid]) {
            // 注册订阅者
            const fn = function (value) {
              if (value !== "none" && !this.textFat.viewText) {
                this.getStylesOfText();
              }
            };
            watchers[this._uid] = fn.bind(this);
            parentDom.EllipsisWatchers = watchers;
          }
          // 若该元素之前就被代理过，则忽略
          if (!isWatched || !typeof(isWatched.isWatched) === "function") {
            Object.defineProperty(watchedObject, "display", {
              configurable: true,
              set: function (value) {
                let watchers = parentDom.EllipsisWatchers;
                // 更改Dom样式
                let style = this.cssText.replace(/display:.+/g, "");
                if (value.trim() !== "") {
                  style += `display: ${value}`;
                }
                parentDom.setAttribute("style", style);
                _this.watchDisplay = value;

                // 分发当前节点下的所有组件
                for (let uid in watchers) {
                  watchers[uid](value);
                }
              },
              get: function () {
                return _this.watchDisplay;
              },
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
    },
    beforeDestroy() {
      if (displayNode) {
        let watchers = this.displayNode?.EllipsisWatchers;
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
      const options = typeof script === 'function' ? script.options : script;
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
      let hook;
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
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
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
                  style.element.setAttribute('media', css.media);
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
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { ref: "container", staticClass: "dsf-muti-ellipsis" }, [
      _c(
        "div",
        { staticClass: "dsf-muti-ellipsis-content" },
        [
          _c("span", { ref: "text", style: _vm.txtStyle }, [
            _vm._v(_vm._s(_vm.textFat.viewText)),
          ]),
          _vm._v(" "),
          _c("transition", { attrs: { name: "ellipsis-slide" } }, [
            _vm.isComplate
              ? _c("span", { staticClass: "more", style: _vm.txtStyle }, [
                  _vm._v(_vm._s(_vm.textFat.moreText)),
                ])
              : _vm._e(),
          ]),
        ],
        1
      ),
    ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-c62caa18_0", { source: "\n.ellipsis-slide-enter-active[data-v-c62caa18] {\r\n  transition: opacity 0.3s;\n}\n.ellipsis-slide-leave-active[data-v-c62caa18] {\r\n  transition: opacity 0.3s;\n}\n.ellipsis-slide-enter[data-v-c62caa18],\r\n.ellipsis-slide-leave-to[data-v-c62caa18] {\r\n  opacity: 0;\n}\n.dsf-muti-ellipsis span[data-v-c62caa18] {\r\n  word-break: break-all;\n}\r\n", map: {"version":3,"sources":["E:\\projects\\work-self\\gitProjects\\vue-text-ellipsis-ie\\packages\\components\\textEllipsis\\textEllipsis.vue"],"names":[],"mappings":";AA6QA;EACA,wBAAA;AACA;AACA;EACA,wBAAA;AACA;AACA;;EAEA,UAAA;AACA;AACA;EACA,qBAAA;AACA","file":"textEllipsis.vue","sourcesContent":["<template>\r\n  <div class=\"dsf-muti-ellipsis\" ref=\"container\">\r\n    <div class=\"dsf-muti-ellipsis-content\">\r\n      <span ref=\"text\" :style=\"txtStyle\">{{ textFat.viewText }}</span>\r\n      <transition name=\"ellipsis-slide\">\r\n        <span class=\"more\" :style=\"txtStyle\" v-if=\"isComplate\">{{\r\n          textFat.moreText\r\n        }}</span>\r\n      </transition>\r\n    </div>\r\n  </div>\r\n</template>\r\n<script>\r\nexport default {\r\n  name: \"DsfMutiEllipsis\",\r\n  props: {\r\n    // 需要展示的内容\r\n    text: {\r\n      type: String,\r\n      default: \"\",\r\n    },\r\n    // 展示区域最大高度（优先级更高，自动匹配最合适的行数）\r\n    height: Number,\r\n    // 只有设置高度属性时才生效。\r\n    heightType: {\r\n      type: String,\r\n      default: \"remove\", // 当设置高度不等于行高的倍数时，remove -> 采用此高度下最大的整数行数  / increase -> 采用此高度下最大的整数行数 + 1\r\n    },\r\n    // 展示区域做大行数\r\n    maxLine: {\r\n      type: Number,\r\n      default: 1,\r\n    },\r\n    // 是否完整展示内容\r\n    isComplate: {\r\n      type: Boolean,\r\n      default: false,\r\n    },\r\n    // 字体样式\r\n    txtStyle: Object,\r\n    // 超出部分内容 展示字符\r\n    more: {\r\n      type: String,\r\n      default: \"...\",\r\n    },\r\n    // 手动调整距离\r\n    tabs: {\r\n      type: Number,\r\n      default: 0,\r\n    },\r\n  },\r\n  data() {\r\n    return {\r\n      textFat: {\r\n        viewText: \"\", // 展示区域文字\r\n        moreText: \"\", // 省略文字\r\n      },\r\n\r\n      containerStyle: {\r\n        width: 0,\r\n      },\r\n      watchDisplay: \"\",\r\n      textStyle: {\r\n        height: 0,\r\n        letterSpacing: 0,\r\n        lineHeight: 0,\r\n      },\r\n      prDisplayNode: null, // 最近的祖先元素被隐藏的节点\r\n    };\r\n  },\r\n  watch: {\r\n    text() {\r\n      this.getStylesOfText();\r\n    },\r\n    isComplate(value) {\r\n      if (this.textFat.moreText) {\r\n        if (value) {\r\n          const l = this.textFat.viewText.length - this.$props.more.length;\r\n          this.textFat.viewText = this.textFat.viewText.substring(0, l);\r\n        } else {\r\n          this.textFat.viewText = this.textFat.viewText + this.$props.more;\r\n        }\r\n      }\r\n    },\r\n  },\r\n  computed: {\r\n    limitWidth() {\r\n      let maxWidth = 0;\r\n      let { heightType, height, maxLine } = this.$props;\r\n      if (height !== undefined) {\r\n        let numberLineHeight =\r\n          this.textStyle.lineHeight === \"normal\"\r\n            ? 1.2 * this.txtStyle.height\r\n            : parseFloat(this.textStyle.lineHeight);\r\n        maxWidth = ~~(height / numberLineHeight) * this.containerStyle.width;\r\n        if (heightType === \"increase\" && height % numberLineHeight) {\r\n          maxWidth += this.containerStyle.width;\r\n        }\r\n      } else {\r\n        maxWidth = maxLine * this.containerStyle.width;\r\n      }\r\n      return maxWidth;\r\n    },\r\n  },\r\n  mounted() {\r\n    this.getStylesOfText();\r\n  },\r\n  methods: {\r\n    getStylesOfText() {\r\n      this.$nextTick(() => {\r\n        setTimeout(() => {\r\n          if (!this.$refs.container.offsetWidth) {\r\n            this.watchDisplayNone();\r\n            return;\r\n          }\r\n          // 获取填装text容器总宽度\r\n          let span = this.$refs.text.cloneNode();\r\n          span.innerHTML = this.$props.text;\r\n          for (let k in this.$props.txtStyle) {\r\n            span.style[k] = this.$props.txtStyle[k];\r\n          }\r\n          span.style.opacity = 0;\r\n          this.$refs.container.appendChild(span);\r\n          // 展示字体样式\r\n          let textStyle = null;\r\n          if (window.getComputedStyle) {\r\n            textStyle = window.getComputedStyle(this.$refs.text);\r\n            this.textStyle = {\r\n              height: +textStyle.fontSize.replace(/px/, \"\"),\r\n              letterSpacing: +textStyle.letterSpacing.replace(/px/, \"\") || 0,\r\n              lineHeight: textStyle.lineHeight,\r\n            };\r\n          } else {\r\n            textStyle = this.$refs.text.currentStyle();\r\n          }\r\n          this.containerStyle.width = Math.max(\r\n            span.offsetWidth,\r\n            this.$refs.container.offsetWidth -\r\n              this.textStyle.height -\r\n              this.textStyle.letterSpacing\r\n          );\r\n          this.$refs.container.removeChild(span);\r\n          this.getChatsLength();\r\n        }, 50);\r\n      });\r\n    },\r\n    getChatsLength() {\r\n      let { more, text, tabs } = this.$props;\r\n      // 规定区域内字符串个数\r\n      let n = ~~Math.max(\r\n        this.limitWidth /\r\n          (this.textStyle.height + this.textStyle.letterSpacing) -\r\n          more.length,\r\n        0\r\n      );\r\n      const canvasContext = document.createElement(\"canvas\").getContext(\"2d\");\r\n      let textStyle = \"\";\r\n      if (window.getComputedStyle) {\r\n        textStyle = window.getComputedStyle(this.$refs.text);\r\n      } else {\r\n        textStyle = this.$refs.text.currentStyle;\r\n      }\r\n      let textFontStyle =\r\n        textStyle.font ||\r\n        `${textStyle.fontWeight} ${\r\n          textStyle.fontSize\r\n        } ${textStyle.fontFamily.replace(/-apple-system,/g, \"\")}`;\r\n      canvasContext.font = textFontStyle;\r\n      let relStrWidth = 0;\r\n      if (\r\n        canvasContext.measureText(this.text).width +\r\n          (this.text.length - 1) * this.textStyle.letterSpacing <\r\n        this.limitWidth\r\n      ) {\r\n        this.textFat.viewText = this.text;\r\n      } else {\r\n        let moreLength =\r\n          canvasContext.measureText(more).width +\r\n          more.length * this.textStyle.letterSpacing;\r\n        while (n < this.text.length) {\r\n          // 中文字符大小跟fontSize一致，英文/数字/英文符号等字符大小 小于fontsize\r\n          let txt = text.substring(0, n);\r\n          relStrWidth =\r\n            canvasContext.measureText(txt).width +\r\n            n * this.textStyle.letterSpacing +\r\n            moreLength;\r\n          if (relStrWidth > this.limitWidth) {\r\n            break;\r\n          }\r\n          n++;\r\n        }\r\n        let splitIndex = n - 1 + tabs;\r\n        this.textFat = {\r\n          viewText: this.text.substring(0, splitIndex) + more,\r\n          moreText: this.text.substring(splitIndex),\r\n        };\r\n      }\r\n    },\r\n    watchDisplayNone() {\r\n      try {\r\n        let parentDom = this.$refs.container.parentElement;\r\n        let watchedObject = null;\r\n        const _this = this;\r\n        // 寻找最近的display为none的祖先元素\r\n        while (parentDom) {\r\n          if (parentDom.style.display !== \"none\") {\r\n            parentDom = parentDom.parentElement;\r\n          } else {\r\n            watchedObject = parentDom.style;\r\n            break;\r\n          }\r\n        }\r\n        this.watchDisplay = watchedObject.display;\r\n        const isWatched = Object.getOwnPropertyDescriptor(\r\n          watchedObject,\r\n          \"display\"\r\n        );\r\n        this.prDisplayNode = parentDom;\r\n        let watchers = parentDom.EllipsisWatchers || {};\r\n        if (!watchers[this._uid]) {\r\n          // 注册订阅者\r\n          const fn = function (value) {\r\n            if (value !== \"none\" && !this.textFat.viewText) {\r\n              this.getStylesOfText();\r\n            }\r\n          };\r\n          watchers[this._uid] = fn.bind(this);\r\n          parentDom.EllipsisWatchers = watchers;\r\n        }\r\n        // 若该元素之前就被代理过，则忽略\r\n        if (!isWatched || !typeof(isWatched.isWatched) === \"function\") {\r\n          Object.defineProperty(watchedObject, \"display\", {\r\n            configurable: true,\r\n            set: function (value) {\r\n              let watchers = parentDom.EllipsisWatchers;\r\n              // 更改Dom样式\r\n              let style = this.cssText.replace(/display:.+/g, \"\");\r\n              if (value.trim() !== \"\") {\r\n                style += `display: ${value}`;\r\n              }\r\n              parentDom.setAttribute(\"style\", style);\r\n              _this.watchDisplay = value;\r\n\r\n              // 分发当前节点下的所有组件\r\n              for (let uid in watchers) {\r\n                watchers[uid](value);\r\n              }\r\n            },\r\n            get: function () {\r\n              return _this.watchDisplay;\r\n            },\r\n          });\r\n        }\r\n      } catch (e) {\r\n        console.log(e);\r\n      }\r\n    },\r\n  },\r\n  beforeDestroy() {\r\n    if (displayNode) {\r\n      let watchers = this.displayNode?.EllipsisWatchers;\r\n      if (watchers) {\r\n        delete watchers[this._uid];\r\n      }\r\n    }\r\n  },\r\n};\r\n</script>\r\n<style lang=\"css\" scoped>\r\n.ellipsis-slide-enter-active {\r\n  transition: opacity 0.3s;\r\n}\r\n.ellipsis-slide-leave-active {\r\n  transition: opacity 0.3s;\r\n}\r\n.ellipsis-slide-enter,\r\n.ellipsis-slide-leave-to {\r\n  opacity: 0;\r\n}\r\n.dsf-muti-ellipsis span {\r\n  word-break: break-all;\r\n}\r\n</style>"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = "data-v-c62caa18";
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
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

  let components = [__vue_component__];

  function install(vue) {
    components.map(component => {
      vue.component(component.name, component);
    });
  }

  exports.TextEllipsis = __vue_component__;
  exports["default"] = install;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
