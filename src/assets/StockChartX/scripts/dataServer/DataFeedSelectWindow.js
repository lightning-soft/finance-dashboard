/*
 *   WARNING! This program and source code is owned and licensed by
 *   Modulus Financial Engineering, Inc. http://www.modulusfe.com
 *   Viewing or use this code requires your acceptance of the license
 *   agreement found at http://www.modulusfe.com/tos
 *   Removal of this comment is a violation of the license agreement.
 *   Copyright 2012-2017 by Modulus Financial Engineering, Inc., Scottsdale, AZ USA
 */
/// <reference path="../StockChartX/Utils/jQueryExtensions.ts" />
/// <reference path="../dataServer/DataServer.ts"/>
/// <reference path="../dataServer/LoginWindow.ts"/>
var StockChartX;
(function (StockChartX) {
    var DataServer;
    (function (DataServer) {
        'use strict';
        var DataFeedSelectWindow = /** @class */ (function () {
            function DataFeedSelectWindow(server) {
                this.btnStart = $("#scxDataFeedDialog");
                this.select = $("#scxDataFeedDropDown");
                this.btnOk = $("#scxDataFeedSelect");
                this.callback = null;
                this.dataFeeds = [];
                this.server = server;
                this.init();
            }
            DataFeedSelectWindow.prototype.init = function () {
                var _this = this;
                this.btnStart.show();
                this.btnOk.on('click', function () {
                    _this.makeChoise();
                });
            };
            DataFeedSelectWindow.prototype.show = function (fn) {
                var _this = this;
                this.callback = fn;
                this.btnStart.trigger('click');
                this.disable();
                this.server.getDataFeeds(function (array) { return _this.fillSelect(array); });
            };
            DataFeedSelectWindow.prototype.hide = function () {
                this.btnStart.hide();
            };
            DataFeedSelectWindow.prototype.disable = function () {
                this.select.attr('disabled', 'disabled');
                this.btnOk.attr('disabled', 'disabled');
            };
            DataFeedSelectWindow.prototype.enable = function () {
                this.select.removeAttr('disabled');
                this.btnOk.removeAttr('disabled');
            };
            DataFeedSelectWindow.prototype.fillSelect = function (array) {
                this.dataFeeds = array;
                var items = [];
                this.dataFeeds.forEach(function (item, index) {
                    items.push($("<option value=\"" + index + "\">" + item.Name + " </option>"));
                });
                this.select.empty().append(items);
                this.enable();
            };
            DataFeedSelectWindow.prototype.makeChoise = function () {
                var index = this.select.val();
                this.hide();
                this.callback(this.dataFeeds[index], this.formatInstruments(this.dataFeeds[index].Exchanges));
            };
            DataFeedSelectWindow.prototype.formatInstruments = function (instruments) {
                var results = [];
                var symbols = instruments[0].Symbols;
                for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
                    var i = symbols_1[_i];
                    results.push({
                        exchange: instruments[0].Name,
                        company: i.Company,
                        symbol: i.Symbol,
                        type: i.Type
                    });
                }
                return results;
            };
            return DataFeedSelectWindow;
        }());
        DataServer.DataFeedSelectWindow = DataFeedSelectWindow;
    })(DataServer = StockChartX.DataServer || (StockChartX.DataServer = {}));
})(StockChartX || (StockChartX = {}));

//# sourceMappingURL=DataFeedSelectWindow.js.map
