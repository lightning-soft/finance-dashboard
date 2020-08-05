/*
 *   WARNING! This program and source code is owned and licensed by
 *   Modulus Financial Engineering, Inc. http://www.modulusfe.com
 *   Viewing or use this code requires your acceptance of the license
 *   agreement found at http://www.modulusfe.com/tos
 *   Removal of this comment is a violation of the license agreement.
 *   Copyright 2012-2017 by Modulus Financial Engineering, Inc., Scottsdale, AZ USA
 */
/// <reference path="../StockChartX/Utils/jQueryExtensions.ts" />
/// <reference path="../dataServer/DataFeedSelectWindow.ts"/>
/// <reference path="../dataServer/LoginWindow.ts"/>
var StockChartX;
(function (StockChartX) {
    var DataServer;
    (function (DataServer_1) {
        'use strict';
        var DataServer = /** @class */ (function () {
            function DataServer(config) {
                this.ws = null;
                this.loggingIn = null;
                this.loggingOut = null;
                this.userCredentials = {
                    login: '',
                    password: ''
                };
                this.messageSubscribers = {
                    login: [],
                    logout: [],
                    dataFeeds: [],
                    quotes: [],
                    history: []
                };
                this.dataFeedOption = $("#scxDataFeedDropDown");
                this.config = $.extend({
                    SERVER_HOST: null,
                    SERVER_PORT: null
                }, config);
            }
            DataServer.generateUniqueEventID = function () {
                var idstr = String.fromCharCode(Math.floor((Math.random() * 25) + 65));
                do {
                    var ascicode = Math.floor((Math.random() * 42) + 48);
                    if (ascicode < 58 || ascicode > 64) {
                        idstr += String.fromCharCode(ascicode);
                    }
                } while (idstr.length < 32);
                return idstr;
            };
            DataServer.prototype.subscribe = function (event, fn) {
                var id = DataServer.generateUniqueEventID();
                this.messageSubscribers[event][id] = fn;
                return id;
            };
            DataServer.prototype.notify = function (event, id, data) {
                if (id == null || this.messageSubscribers[event][id] === null) {
                    id = DataServer.getFirstSubscriberId(this.messageSubscribers[event]);
                    if (id === null)
                        return false;
                }
                if ('history' === event && data.IsTail === false) {
                    this.messageSubscribers[event][id](data);
                    return true;
                }
                this.messageSubscribers[event][id](data);
                delete this.messageSubscribers[event][id];
                return true;
            };
            DataServer.prototype.connect = function () {
                var _this = this;
                if (this.ws != null && this.ws.readyState === 1)
                    return false;
                var support = "MozWebSocket" in window ? 'MozWebSocket' : ("WebSocket" in window ? 'WebSocket' : null);
                if (support == null) {
                    // console.log("* Your browser can't support WebSockets");
                    return false;
                }
                this.ws = new window[support]("ws://" + this.config.SERVER_HOST + ":" + this.config.SERVER_PORT + "/");
                this.ws.onopen = function () {
                    if (_this.loggingIn) {
                        _this.sendQuery({
                            MsgType: 'LoginRequest',
                            Login: _this.userCredentials.login,
                            Password: _this.userCredentials.password
                        });
                    }
                };
                this.ws.onclose = function () {
                    if (_this.loggingOut)
                        return;
                    _this.loggingIn = false;
                };
                this.ws.onmessage = function (evt) {
                    var obj = jQuery.parseJSON(evt.data);
                    switch (obj.MsgType) {
                        case 'LoginResponse':
                            if (obj.Error !== null)
                                _this.notify('login', null, { Success: false, Reason: obj.Error });
                            else
                                _this.notify('login', null, { Success: true });
                            break;
                        case 'LogoutResponse':
                            _this.loggingOut = false;
                            _this.disconnect();
                            break;
                        case 'DataFeedListResponse':
                            _this.notify('dataFeeds', null, obj.DataFeeds);
                            break;
                        case 'HistoryResponse':
                            _this.notify('history', obj.ID, { ID: obj.ID, Bars: obj.Bars, IsTail: obj.Tail });
                            break;
                        case 'NewTickResponse':
                            var objTick = obj.Tick;
                            var quotes = 'quotes';
                            for (var _i = 0, objTick_1 = objTick; _i < objTick_1.length; _i++) {
                                var item = objTick_1[_i];
                                var subscribers = _this.messageSubscribers[quotes][item.Symbol.Symbol];
                                for (var i in subscribers) {
                                    if (subscribers.hasOwnProperty(i))
                                        subscribers[i](item);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                };
                return true;
            };
            DataServer.prototype.disconnect = function () {
                if (this.ws == null || this.ws.readyState !== 1)
                    return;
                this.ws.close();
                this.ws = null;
            };
            DataServer.prototype.sendQuery = function (params) {
                if (!this.ws || this.ws.readyState !== 1)
                    return;
                this.ws.send(JSON.stringify(params));
            };
            DataServer.prototype.doLogin = function (fn, data) {
                this.subscribe('login', fn);
                this.userCredentials.login = data.Login;
                this.userCredentials.password = data.Password;
                this.loggingIn = true;
                this.connect();
            };
            DataServer.prototype.doLogout = function () {
                this.loggingOut = true;
                this.sendQuery({ MsgType: 'LogoutRequest' });
                this.disconnect();
            };
            DataServer.getFirstSubscriberId = function (objectArray) {
                for (var i in objectArray) {
                    if (objectArray.hasOwnProperty(i)) {
                        return i;
                    }
                }
                return null;
            };
            DataServer.prototype.getDataFeeds = function (fn) {
                this.subscribe('dataFeeds', fn);
                this.sendQuery({ MsgType: 'DataFeedListRequest' });
            };
            DataServer.prototype.subscribeQuote = function (fn, symbol) {
                var quotes = 'quotes';
                var dataFeed = this._dataFeedOptionsSelect(this.dataFeedOption.val());
                if (typeof this.messageSubscribers[quotes][symbol.symbol])
                    this.messageSubscribers[quotes][symbol.symbol] = [];
                this.messageSubscribers[quotes][symbol.symbol].push(fn);
                this.sendQuery({
                    MsgType: 'SubscribeRequest',
                    Symbol: {
                        DataFeed: dataFeed,
                        Exchange: symbol.exchange,
                        Symbol: symbol.symbol,
                        Company: symbol.company,
                        Type: 1
                    }
                });
            };
            DataServer.prototype.unsubscribeQuote = function (fn, symbol) {
                var quotes = 'quotes';
                var dataFeed = this._dataFeedOptionsSelect(this.dataFeedOption.val());
                var subscribers = this.messageSubscribers[quotes][symbol.symbol];
                if (!subscribers)
                    return;
                for (var i in subscribers)
                    if (subscribers.hasOwnProperty(i) && subscribers[i] === fn)
                        subscribers.splice(i, 1);
                if (subscribers.length === 0)
                    delete this.messageSubscribers[quotes][symbol.symbol];
                this.sendQuery({
                    MsgType: 'UnsubscribeRequest',
                    Symbol: {
                        DataFeed: dataFeed,
                        Exchange: symbol.exchange,
                        Symbol: symbol.symbol,
                        Company: symbol.company,
                        Type: 1
                    }
                });
            };
            DataServer.prototype.getHistory = function (fn, request) {
                var id = this.subscribe('history', fn), chart = request.chart, dataFeed = this._dataFeedOptionsSelect(this.dataFeedOption.val()), periodicity = DataServer.convertPeriodicity(chart.timeFrame.periodicity), timeTo, timeFrom;
                if (request.kind === StockChartX.RequestKind.MORE_BARS) {
                    timeTo = request.endDate;
                    // Sat Sep 01 1984 07:00:00 GMT+0300 (Финляндия (лето))
                    timeFrom = 462859200000;
                }
                var params = {
                    MsgType: 'HistoryRequest',
                    Selection: {
                        Id: id,
                        Symbol: {
                            DataFeed: dataFeed,
                            Exchange: chart.instrument.exchange,
                            Symbol: request.instrument ? request.instrument.symbol : chart.instrument.symbol,
                            Company: chart.instrument.company,
                            Type: 1
                        },
                        Periodicity: periodicity,
                        Interval: chart.timeFrame.interval,
                        barsCount: request.count,
                        From: timeFrom,
                        To: timeTo
                    }
                };
                this.sendQuery(params);
                return id;
            };
            DataServer.convertPeriodicity = function (periodicity) {
                switch (periodicity) {
                    case StockChartX.Periodicity.SECOND:
                        return 0;
                    case StockChartX.Periodicity.MINUTE:
                        return 1;
                    case StockChartX.Periodicity.HOUR:
                        return 2;
                    case StockChartX.Periodicity.DAY:
                        return 3;
                    case StockChartX.Periodicity.WEEK:
                        return 4;
                    case StockChartX.Periodicity.MONTH:
                        return 5;
                    case StockChartX.Periodicity.YEAR:
                        return 6;
                    default:
                        break;
                }
            };
            DataServer.prototype._dataFeedOptionsSelect = function (value) {
                switch (value) {
                    case '0':
                        return 'DDF';
                    case '1':
                        return 'Simulation DataFeed';
                    default:
                        break;
                }
            };
            return DataServer;
        }());
        DataServer_1.DataServer = DataServer;
    })(DataServer = StockChartX.DataServer || (StockChartX.DataServer = {}));
})(StockChartX || (StockChartX = {}));

//# sourceMappingURL=DataServer.js.map
