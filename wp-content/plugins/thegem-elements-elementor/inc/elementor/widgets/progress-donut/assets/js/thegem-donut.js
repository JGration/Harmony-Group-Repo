!(function ($) {
    "use strict";
    function Donut(element, options) {
        (this.el = element), (this.$el = $(this.el)), (this.options = $.extend({ color: "#f7f7f7", units: "", label_selector: ".gem_chart_value", back_selector: ".gem_chart_back", responsive: !0 }, options)), this.init();
    }
    (Donut.prototype = {
        constructor: Donut,
        _progress_v: 0,
        animated: !1,
        init: function () {
            (this.color = this.options.color),
                (this.value = this.$el.data("pie-value") / 100),
                (this.label_value = this.$el.data("pie-label-value") || this.$el.data("pie-value")),
                (this.$wrapper = $(".gem_wrapper", this.$el)),
                (this.$label = $(this.options.label_selector, this.$el)),
                (this.$back = $(this.options.back_selector, this.$el)),
                (this.$canvas = this.$el.find("canvas")),
                this.draw(),
                this.setWayPoint(),
                !0 === this.options.responsive && this.setResponsive();
        },
        setResponsive: function () {
            var that = this;
            $(window).on("resize", function () {
                that.$el && that.$el.is(":visible") && (!0 === that.animated && that.circle.stop(), that.draw(!0));
            });
        },
        draw: function (redraw) {
            var radius,
            arcW = this.$el.data("pie-width"),
                w = this.$el.addClass("gem-ready").width();
            w || (w = this.$el.parents(":visible").first().width() - 2),
                (radius = (w = (w / 100) * 80) / 2 - 6 - 1),
                this.$wrapper.css({ width: w + "px" }),
                this.$label.css({ width: w, height: w, "line-height": w + "px" }),
                this.$back.css({ width: w, height: w }),
                this.$canvas.attr({ width: w + "px", height: w + "px" }),
                this.$el.addClass("gem-ready"),
                (this.circle = new ProgressCircle({ canvas: this.$canvas.get(0), minRadius: radius - arcW + 6, arcWidth: arcW })),
                !0 === redraw && !0 === this.animated && ((this._progress_v = this.value), this.circle.addEntry({ fillColor: this.color, progressListener: $.proxy(this.setProgress, this) }).start());
        },
        setProgress: function () {
            if (this._progress_v >= this.value) return this.circle.stop(), this.$label.text(this.label_value + this.options.units), this._progress_v;
            this._progress_v += 0.005;
            if (!isNaN(this.label_value)) {
                var label_value = (this._progress_v / this.value) * this.label_value,
                val = Math.round(label_value) + this.options.units;
            } else {
                val = this.label_value + this.options.units;
            }      
            return this.$label.text(val), this._progress_v;
        },
        animate: function () {
            !0 !== this.animated && ((this.animated = !0), this.circle.addEntry({ fillColor: this.color, progressListener: $.proxy(this.setProgress, this) }).start(5));
        },
        setWayPoint: function () {
            void 0 !== $.fn.waypoint ? this.$el.waypoint($.proxy(this.animate, this), { offset: "85%" }) : this.animate();
        },
    }),
        ($.fn.DonutPrepare = function (option, value) {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data("donut"),
                    options = "object" == typeof option ? option : { color: $this.data("pie-color"), units: $this.data("pie-units") };
                void 0 === option && $this.data("donut", (data = new Donut(this, options))), "string" == typeof option && data[option](value);
            });
        }),
        "function" != typeof window.gemDonut &&
            (window.gemDonut = function () {
                $(".gem_chart:visible").DonutPrepare();
            }),
        $(document).ready(function () {
            gemDonut();
        });
})(window.jQuery);
