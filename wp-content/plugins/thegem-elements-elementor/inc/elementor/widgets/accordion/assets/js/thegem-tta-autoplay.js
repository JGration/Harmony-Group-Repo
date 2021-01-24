! function($) {
    "use strict";
    var Plugin, TtaAutoPlay, old;
    Plugin = function(action, options) {
        var args;
        return args = Array.prototype.slice.call(arguments, 1), this.each(function() {
            var $this, data;
            (data = ($this = $(this)).data("vc.tta.autoplay")) || (data = new TtaAutoPlay($this, $.extend(!0, {}, TtaAutoPlay.DEFAULTS, $this.data("vc-tta-autoplay"), options)), $this.data("vc.tta.autoplay", data)), "string" == typeof action ? data[action].apply(data, args) : data.start(args)
        })
    }, (TtaAutoPlay = function($element, options) {
        this.$element = $element, this.options = options
    }).DEFAULTS = {
        delay: 5e3,
        pauseOnHover: !0,
        stopOnClick: !0
    }, TtaAutoPlay.prototype.show = function() {
        this.$element.find("[data-vc-accordion]:eq(0)").vcAccordion("showNext", {
            changeHash: !1,
            scrollTo: !1
        })
    }, TtaAutoPlay.prototype.hasTimer = function() {
        return void 0 !== this.$element.data("vc.tta.autoplay.timer")
    }, TtaAutoPlay.prototype.setTimer = function(windowInterval) {
        this.$element.data("vc.tta.autoplay.timer", windowInterval)
    }, TtaAutoPlay.prototype.getTimer = function() {
        return this.$element.data("vc.tta.autoplay.timer")
    }, TtaAutoPlay.prototype.deleteTimer = function() {
        this.$element.removeData("vc.tta.autoplay.timer")
    }, TtaAutoPlay.prototype.start = function() {
        var $this, that;
        $this = this.$element, (that = this).hasTimer() || (this.setTimer(window.setInterval(this.show.bind(this), this.options.delay)), this.options.stopOnClick && $this.on("click.vc.tta.autoplay.data-api", "[data-vc-accordion]", function(e) {
            e && e.preventDefault && e.preventDefault(), that.hasTimer() && Plugin.call($this, "stop")
        }), this.options.pauseOnHover && $this.hover(function(e) {
            e && e.preventDefault && e.preventDefault(), that.hasTimer() && Plugin.call($this, "mouseleave" === e.type ? "resume" : "pause")
        }))
    }, TtaAutoPlay.prototype.resume = function() {
        this.hasTimer() && this.setTimer(window.setInterval(this.show.bind(this), this.options.delay))
    }, TtaAutoPlay.prototype.stop = function() {
        this.pause(), this.deleteTimer(), this.$element.off("click.vc.tta.autoplay.data-api mouseenter mouseleave")
    }, TtaAutoPlay.prototype.pause = function() {
        var timer;
        void 0 !== (timer = this.getTimer()) && window.clearInterval(timer)
    }, old = $.fn.vcTtaAutoPlay, $.fn.vcTtaAutoPlay = Plugin, $.fn.vcTtaAutoPlay.Constructor = TtaAutoPlay, $.fn.vcTtaAutoPlay.noConflict = function() {
        return $.fn.vcTtaAutoPlay = old, this
    }, $(document).ready(function() {
        $("[data-vc-tta-autoplay]").each(function() {
            $(this).vcTtaAutoPlay()
        })
    })
}(window.jQuery);