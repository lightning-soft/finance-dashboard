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
/// <reference path="../dataServer/DataServer.ts"/>
var StockChartX;
(function (StockChartX) {
    var DataServer;
    (function (DataServer) {
        'use strict';
        var LoginWindow = /** @class */ (function () {
            function LoginWindow(server) {
                this.btnStart = $("#loginDialog_start");
                this.container = $("#scxLogInDialog");
                this.form = $("#scxLogInDialog");
                this.inputLogin = this.container.find("#scxLogInUsername");
                this.inputPassword = this.container.find("#scxLogInPassword");
                this.btnLogin = this.container.find("#scxLogInConnect");
                this.errorMessage = this.container.find("#scxLogInError");
                this.server = server;
                this.init();
            }
            LoginWindow.prototype.init = function () {
                var _this = this;
                this.form.show();
                this.btnLogin.on('click', function () {
                    _this.doLogin();
                });
            };
            LoginWindow.prototype.show = function (fn) {
                this.callback = fn;
                this.btnStart.trigger('click');
            };
            LoginWindow.prototype.hide = function () {
                this.form.hide();
                this.inputLogin.val("");
                this.inputPassword.val("");
            };
            LoginWindow.prototype.enable = function () {
                this.btnLogin.removeAttr('disabled');
                this.inputLogin.removeAttr('disabled');
                this.inputPassword.removeAttr('disabled');
            };
            LoginWindow.prototype.disable = function () {
                this.btnLogin.attr('disabled', 'disabled');
                this.inputLogin.attr('disabled', 'disabled');
                this.inputPassword.attr('disabled', 'disabled');
            };
            LoginWindow.prototype.onResponce = function (data) {
                this.enable();
                if (data.Success) {
                    this.hide();
                    if (this.callback)
                        this.callback();
                    this.callback = null;
                }
                else {
                    this.inputLogin.trigger('focus');
                    this.errorMessage.text("Incorrect login or paswword");
                }
            };
            LoginWindow.prototype.doLogin = function () {
                var _this = this;
                if (!this.inputLogin.val().length || !this.inputPassword.val().length)
                    return;
                this.disable();
                var loginData = {
                    Login: this.inputLogin.val(),
                    Password: this.inputPassword.val()
                };
                this.server.doLogin(function (responseData) { return _this.onResponce(responseData); }, loginData);
            };
            return LoginWindow;
        }());
        DataServer.LoginWindow = LoginWindow;
    })(DataServer = StockChartX.DataServer || (StockChartX.DataServer = {}));
})(StockChartX || (StockChartX = {}));

//# sourceMappingURL=LoginWindow.js.map
