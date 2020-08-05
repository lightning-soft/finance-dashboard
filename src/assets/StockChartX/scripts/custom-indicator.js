/*
 *   WARNING! This program and source code is owned and licensed by
 *   Modulus Financial Engineering, Inc. http://www.modulusfe.com
 *   Viewing or use this code requires your acceptance of the license
 *   agreement found at http://www.modulusfe.com/tos
 *   Removal of this comment is a violation of the license agreement.
 *   Copyright 2012-2017 by Modulus Financial Engineering, Inc., Scottsdale, AZ USA
 */

var MyCustomMACD;   // eslint-disable-line no-implicit-globals, init-declarations

$(function() {
    "use strict";

    // endregion Register custom indicators

    MyCustomMACD = function(config) {
        config = config || {};  // eslint-disable-line no-param-reassign
        config.isCustomIndicator = true;

        StockChartX.Indicator.call(this, config);

        this.allowSettingsDialog = true;
        this._options.parameters = {};
        if (config.parameters) {
            this._options.parameters = config.parameters;
        } else {
            this._options.parameters = {};
            this.setParameterValue(StockChartX.IndicatorParam.LINE_COLOR, "green");
            this.setParameterValue(StockChartX.IndicatorParam.LINE_WIDTH, 1);
            this.setParameterValue(StockChartX.IndicatorParam.LINE_STYLE, "solid");
            this.setParameterValue(StockChartX.IndicatorParam.LINE2_COLOR, "red");
            this.setParameterValue(StockChartX.IndicatorParam.LINE2_WIDTH, 1);
            this.setParameterValue(StockChartX.IndicatorParam.LINE2_STYLE, "solid");
            this.setParameterValue(StockChartX.IndicatorParam.LINE3_COLOR, "goldenrod");
            this.setParameterValue(StockChartX.IndicatorParam.LINE3_WIDTH, 1);
            this.setParameterValue(StockChartX.IndicatorParam.LINE3_STYLE, "solid");
            this.setParameterValue(StockChartX.IndicatorParam.LINE3_STYLE, "solid");
        }

        if (config.panelIndex != null)
            this._panel = this._chart.chartPanelsContainer.panels[config.panelIndex];
    };

    MyCustomMACD.prototype = {
        setDefaults: function() {
            this.name = "My MACD";
            this.period = 14;
            this.fast = 12;
            this.slow = 26;
            this.smooth = 9;
            this.inputSeriesKind = StockChartX.DataSeriesSuffix.CLOSE;
            this.addPlot('green', "MACD");
            this.addPlot('red', "Down");
            this.addPlot('goldenrod', "Diff", StockChartX.HistogramPlot.Style.LINE);

            this.addLine('gray', 0);
            this.addLine('yellow', 1);
            this.addLine('red', -1);
        },

        setConfigure: function() {
            this._constant1 = 2 / (1 + this.fast);
            this._constant2 = 1 - (2 / (1 + this.fast));
            this._constant3 = 2 / (1 + this.slow);
            this._constant4 = 1 - (2 / (1 + this.slow));
            this._constant5 = 2 / (1 + this.smooth);
            this._constant6 = 1 - (2 / (1 + this.smooth));
            this._fastEma = new StockChartX.TADataSeries('fastEma', this);
            this._slowEma = new StockChartX.TADataSeries('slowEma', this);
        },

        onBarUpdate: function() {
            var input0 = this.input.get(0);
            var values = this.values.get("MACD");
            var avg = this.values.get("Down");
            var diff = this.values.get("Diff");

            if (this.currentBar === 0) {
                this._fastEma.set(input0);
                this._slowEma.set(input0);
                values.set(0);
                avg.set(0);
                diff.set(0);
            } else {
                var fastEma0 = (this._constant1 * input0) + (this._constant2 * this._fastEma.get(1));
                var slowEma0 = (this._constant3 * input0) + (this._constant4 * this._slowEma.get(1));
                var macd = fastEma0 - slowEma0;
                var macdAvg = (this._constant5 * macd) + (this._constant6 * avg.get(1));
                var diffVal = (macd - macdAvg) * 2;

                this._fastEma.set(fastEma0);
                this._slowEma.set(slowEma0);
                values.set(macd);
                avg.set(macdAvg);
                diff.set(diffVal);
            }
        }
    };
    MyCustomMACD.className = "MyMACD";
    StockChartX.Indicator.register(MyCustomMACD);
    StockChartX.JsUtil.extend(MyCustomMACD, StockChartX.Indicator);
    Object.defineProperty(MyCustomMACD.prototype, "period", {
        get: function() {
            return this.getParameterValue(StockChartX.IndicatorParam.PERIODS);
        },
        set: function(value) {
            this.setParameterValue(StockChartX.IndicatorParam.PERIODS, value);
        }
    });
    Object.defineProperty(MyCustomMACD.prototype, "fast", {
        get: function() {
            return this.getParameterValue(StockChartX.IndicatorParam.FAST);
        },
        set: function(value) {
            this.setParameterValue(StockChartX.IndicatorParam.FAST, value);
        }
    });
    Object.defineProperty(MyCustomMACD.prototype, "slow", {
        get: function() {
            return this.getParameterValue(StockChartX.IndicatorParam.SLOW);
        },
        set: function(value) {
            this.setParameterValue(StockChartX.IndicatorParam.SLOW, value);
        }
    });
    Object.defineProperty(MyCustomMACD.prototype, "smooth", {
        get: function() {
            return this.getParameterValue(StockChartX.IndicatorParam.SMOOTH);
        },
        set: function(value) {
            this.setParameterValue(StockChartX.IndicatorParam.SMOOTH, value);
        }
    });
});
