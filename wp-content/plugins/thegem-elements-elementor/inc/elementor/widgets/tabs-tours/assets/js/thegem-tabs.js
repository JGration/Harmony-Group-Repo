! function($) {
    "use strict";
    var Tabs, old, clickHandler, changeHandler;

    function Plugin(action, options) {
        var args;
        return args = Array.prototype.slice.call(arguments, 1), this.each(function() {
            var $this, data;
            (data = ($this = $(this)).data("vc.tabs")) || (data = new Tabs($this, $.extend(!0, {}, options)), $this.data("vc.tabs", data)), "string" == typeof action && data[action].apply(data, args)
        })
    }(Tabs = function(element, options) {
        this.$element = $(element), this.activeClass = "gem-tta-active", this.tabSelector = "[data-vc-tab]", this.useCacheFlag = void 0, this.$target = void 0, this.selector = void 0, this.$targetTab = void 0, this.$relatedAccordion = void 0, this.$container = void 0
    }).prototype.isCacheUsed = function() {
        var useCache, that;
        return useCache = function() {
            return !1 !== that.$element.data("vcUseCache")
        }, void 0 === (that = this).useCacheFlag && (this.useCacheFlag = useCache()), this.useCacheFlag
    }, Tabs.prototype.getContainer = function() {
        return this.isCacheUsed() ? (void 0 === this.$container && (this.$container = this.findContainer()), this.$container) : this.findContainer()
    }, Tabs.prototype.findContainer = function() {
        var $container;
        return ($container = this.$element.closest(this.$element.data("vcContainer"))).length || ($container = $("body")), $container
    }, Tabs.prototype.getContainerAccordion = function() {
        return this.getContainer().find("[data-vc-accordion]")
    }, Tabs.prototype.getSelector = function() {
        var findSelector, $this;
        return $this = this.$element, findSelector = function() {
            var selector;
            return (selector = $this.data("vcTarget")) || (selector = $this.attr("href")), selector
        }, this.isCacheUsed() ? (void 0 === this.selector && (this.selector = findSelector()), this.selector) : findSelector()
    }, Tabs.prototype.getTarget = function() {
        var selector;
        return selector = this.getSelector(), this.isCacheUsed() ? (void 0 === this.$target && (this.$target = this.getContainer().find(selector)), this.$target) : this.getContainer().find(selector)
    }, Tabs.prototype.getRelatedAccordion = function() {
        var tab, filterElements;
        return filterElements = function() {
            var $elements;
            if (($elements = tab.getContainerAccordion().filter(function() {
                    var $that, accordion;
                    return void 0 === (accordion = ($that = $(this)).data("vc.accordion")) && ($that.vcAccordion(), accordion = $that.data("vc.accordion")), tab.getSelector() === accordion.getSelector()
                })).length) return $elements
        }, (tab = this).isCacheUsed() ? (void 0 === this.$relatedAccordion && (this.$relatedAccordion = filterElements()), this.$relatedAccordion) : filterElements()
    }, Tabs.prototype.triggerEvent = function(event) {
        var $event;
        "string" == typeof event && ($event = $.Event(event), this.$element.trigger($event))
    }, Tabs.prototype.getTargetTab = function() {
        var $this;
        return $this = this.$element, this.isCacheUsed() ? (void 0 === this.$targetTab && (this.$targetTab = $this.closest(this.tabSelector)), this.$targetTab) : $this.closest(this.tabSelector)
    }, Tabs.prototype.tabClick = function() {
        this.getRelatedAccordion().trigger("click")
    }, Tabs.prototype.show = function() {
        this.getTargetTab().hasClass(this.activeClass) || (this.triggerEvent("show.vc.tab"), this.getTargetTab().addClass(this.activeClass))
    }, Tabs.prototype.hide = function() {
        this.getTargetTab().hasClass(this.activeClass) && (this.triggerEvent("hide.vc.tab"), this.getTargetTab().removeClass(this.activeClass))
    }, old = $.fn.vcTabs, $.fn.vcTabs = Plugin, $.fn.vcTabs.Constructor = Tabs, $.fn.vcTabs.noConflict = function() {
        return $.fn.vcTabs = old, this
    }, clickHandler = function(e) {
        var $this;
        $this = $(this), e.preventDefault(), Plugin.call($this, "tabClick")
    }, changeHandler = function(e) {
        var caller;
        (caller = $(e.target).data("vc.accordion")) && (void 0 === caller.getRelatedTab && (caller.getRelatedTab = function() {
            var findTargets;
            return findTargets = function() {
                return caller.getContainer().find("[data-vc-tabs]").filter(function() {
                    var $this;
                    return void 0 === ($this = $(this)).data("vc.accordion") && $this.vcAccordion(), $this.data("vc.accordion").getSelector() === caller.getSelector()
                })
            }, caller.isCacheUsed() ? (void 0 === caller.relatedTab && (caller.relatedTab = findTargets()), caller.relatedTab) : findTargets()
        }), Plugin.call(caller.getRelatedTab(), e.type))
    }, $(document).on("click.vc.tabs.data-api", "[data-vc-tabs]", clickHandler), $(document).on("show.vc.accordion hide.vc.accordion", changeHandler)
}(window.jQuery);