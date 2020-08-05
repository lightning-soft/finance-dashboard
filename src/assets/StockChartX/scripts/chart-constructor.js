/* global Promise, MyCustomMACD */

$(function() {
    "use strict";

    var isDebugMode = window.location.port === '63342';
    var isMobile = StockChartX.Environment.isMobile || StockChartX.Environment.isPhone;
    var isFullWindowMode = isDebugMode || isMobile;
    var datafeed = new StockChartX.CsvDatafeed({
        urlBuilder: function(request) {
            if (request.instrument) {
                switch (request.instrument.symbol) {
                    case 'AAPL':
                        return 'data/aapl.csv';
                    case 'MSFT':
                        return 'data/msft.csv';
                    case 'GOOG':
                        return 'data/goog.csv';
                    default:
                        throw new Error('Please load bars for you instrument');
                }
            } else {
                return 'data/aapl.csv';
            }
        },
        dateFormat: function() {
            return 'D-MMM-YY';
        }
    });

    window.createChart = function(config) {
        setupInstruments();

        return createChart(config);
    };

    window.createMultiCharts = function(config) {
        setupInstruments();

        return createMultiCharts(config);
    };

    function setupInstruments() {
        var symbolsFilePath = isMobile
            ? "data/symbols.mobile.json"
            : "data/symbols.json";

        $.get(symbolsFilePath, function(symbols) {
            var allSymbols = typeof symbols === 'string'
                ? JSON.parse(symbols)
                : symbols;

            StockChartX.getAllInstruments = function() {
                return allSymbols;
            };
        }).fail(function() {
            StockChartX.UI.Notification.error("Load symbols failed.");
        });
    }

    function createChart(config) {
        if (config.datafeed)
            datafeed = config.datafeed;
        var mergedConfig = $.extend(config, {
            width: 768,
            height: 460,
            theme: StockChartX.Theme.Dark,
            fullWindowMode: isFullWindowMode,
            keyboardEventsEnabled: config.keyboardEventsEnabled,
            datafeed: datafeed,
            instrument: {
                symbol: "AAPL",
                company: "Apple Computer Inc",
                exchange: "NASDAQ",
                tickSize: 0.01
            }
        });
        var chart = $(config.chartContainer).StockChartX(mergedConfig); // eslint-disable-line new-cap

        return setupChart(chart, config);
    }

    function createMultiCharts(config) {
        var mergedConfig = $.extend(config, {
            theme: StockChartX.Theme.Dark,
            datafeed: datafeed,
            instrument: {
                symbol: "GOOG",
                company: "Google Inc.",
                exchange: "NASDAQ",
                tickSize: 0.01
            }
        });
        mergedConfig.showToolbar = false;

        var chartsContainer = new StockChartX.ChartsContainer($('#chartsContainer'));
        for (var i = 0; i < 4; i++) {
            var chart = chartsContainer.addChart(mergedConfig);
            if (config.indicators !== false)
                setupIndicators(chart);
        }
        chartsContainer.resizeCharts();

        return chartsContainer;
    }

    function setupChart(chart, config) {
        return config.autoSave
            ? setupChartWithState(chart, config)
            : setupChartWithoutState(chart, config);
    }

    function setupChartWithoutState(chart, config) {
        return new Promise(function(resolve) {
            if (config.indicators !== false)
                setupIndicators(chart);

            resolve(chart);
        });
    }

    function setupChartWithState(chart, config) {
        return new Promise(function(resolve) {
            chart.stateHandler
                .load()
                .then(function(isLoaded) {
                    if (!isLoaded && config.indicators !== false)
                        setupIndicators(chart);

                    resolve(chart);
                })
                .catch(function(error) {
                    StockChartX.UI.Notification.error(error.message);

                    chart.stateHandler.clear().then(function() {
                        chart.destroy(false);

                        createChart(config);
                    });
                });
        });
    }

    function setupIndicators(chart) {
        if (!StockChartX.Environment.isPhone) {
            var indicators = [new StockChartX.Bollinger(), new MyCustomMACD(), new StockChartX.RSI()];
            chart.addIndicators(indicators);
        }

        var vol = new StockChartX.VOL();
        vol.setParameterValue(StockChartX.IndicatorParam.LINE_WIDTH, 3);
        chart.addIndicators(vol);
    }
});
