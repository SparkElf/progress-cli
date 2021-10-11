#!/usr/bin/env node
import chalk from 'chalk';
import { stdin, stdout } from 'process';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var GET_CURSOR_POSITION = '\x1b[6n';
var HIDE_CURSOR = '\x1b[?25l';
var SHOW_CURSOR = '\x1b[?25h';
var ERASE_END_OF_LINE = '\x1b[K';
var ERASE_START_OF_LINE = '\x1b[1K';
var ERASE_LINE = '\x1b[2K';
var validateCursorPositionStr = function (s) {
    if (s[0] == '\x1b' && s[1] == '\x1b')
        process.exit(-1);
    if (s[0] != '\x1b')
        return false;
    if (s[1] != '[')
        return false;
    var i = 2;
    for (; s[i] >= '0' && s[i] <= '9'; i++)
        ;
    if (s[i] != ';')
        return false;
    for (i = i + 1; s[i] >= '0' && s[i] <= '9'; i++)
        ;
    if (s[i] != 'R')
        return false;
    return true;
};
var parseCursorPosition = function (s) {
    var row = '';
    var col = '';
    var i = 2;
    for (; s[i] != ';'; i++)
        row += s[i];
    for (i += 1; s[i] != 'R'; i++)
        col += s[i];
    var pos = { x: parseInt(col), y: parseInt(row) };
    return pos;
};
var getCursorPosition = function () {
    var mode = stdin.isRaw;
    stdin.setRawMode(true);
    stdout.write(GET_CURSOR_POSITION);
    stdin.resume(); //养成习惯需要输入时主动resume(),不用保存流状态
    return new Promise(function (resolve) {
        var f = function (data) {
            stdin.pause();
            var s = data.toString();
            if (validateCursorPositionStr(s)) {
                resolve(parseCursorPosition(data.toString()));
                if (!mode)
                    stdin.setRawMode(false);
                stdin.removeListener('data', f);
            }
        };
        stdin.on("data", f);
    });
};
var setCursorPosition = function (pos) {
    stdout.write("\u001B[" + pos.y + ";" + pos.x + "H");
};
//return ture if end cursor behind or equal the start cursor
var compareCursor = function (start, end) {
    if (end.y > start.y)
        return true;
    if (end.y < start.y)
        return false;
    if (end.x >= start.x)
        return true;
    return false;
};
var clearSection = function (start, end) { return __awaiter(void 0, void 0, void 0, function () {
    var origin_1, total, a, i, curY;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(start.y === end.y)) return [3 /*break*/, 2];
                return [4 /*yield*/, getCursorPosition()];
            case 1:
                origin_1 = _a.sent();
                if (!(compareCursor(start, end)))
                    return [2 /*return*/];
                total = end.x - start.x + 1;
                a = '';
                for (i = 0; i < total; i++) {
                    a += ' ';
                }
                stdout.write(a.toString());
                setCursorPosition(origin_1);
                return [3 /*break*/, 4];
            case 2:
                if (!(start.y < end.y)) return [3 /*break*/, 4];
                return [4 /*yield*/, getCursorPosition()];
            case 3:
                _a.sent();
                setCursorPosition(start);
                eraseEndOfLine();
                curY = start.y + 1;
                while (curY != end.y) {
                    setCursorPosition({ x: 1, y: curY });
                    eraseLine();
                    curY += 1;
                }
                setCursorPosition(end);
                eraseStartOfLine();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var hideCursor = function () {
    stdout.write(HIDE_CURSOR);
};
var showCursor = function () {
    stdout.write(SHOW_CURSOR);
};
var eraseEndOfLine = function () {
    stdout.write(ERASE_END_OF_LINE);
};
var eraseStartOfLine = function () {
    stdout.write(ERASE_START_OF_LINE);
};
var eraseLine = function () {
    stdout.write(ERASE_LINE);
};

var MILLISECOND = 1;
var SECOND = 1000 * MILLISECOND;
var MINIUTE = 60 * SECOND;
var HOUR = 60 * MINIUTE;
var DAY = 24 * HOUR;
var Time = {
    MILLISECOND: MILLISECOND,
    SECOND: SECOND,
    MINIUTE: MINIUTE,
    HOUR: HOUR,
    DAY: DAY
};

var ProgressBar = /** @class */ (function () {
    function ProgressBar(options) {
        this.fmt = options.fmt || "";
        this.status = {
            cur: options.cur || 0,
            total: options.total,
            extra: options.extra || null
        };
        this.width = options.width || this.status.total;
        this.stream = options.stream || process.stdout;
        this.chars = {
            complete: options.complete || chalk.bgGreen(" "),
            incomplete: options.incomplete || "-"
        };
        this.renderThrottle = options.renderThrottle || 1;
        this.callback = options.callback || (function () { });
        this.clear = options.clear || false;
        this.rateUnit = options.rateUnit || Time.SECOND;
    }
    ProgressBar.prototype.setFormat = function (s) {
        this.fmt = s;
        return this;
    };
    ProgressBar.prototype.Format = function () {
        var completeLen = Math.floor(this.width * this.status.percent / 100);
        var completeStr = '';
        for (var i = 0; i < completeLen; i++)
            completeStr += this.chars.complete;
        var incompleteStr = '';
        for (var i = 0; i < this.width - completeLen; i++)
            incompleteStr += this.chars.incomplete;
        return this.fmt //replace不修改原字符串
            .replace(':current', this.status.cur.toString())
            .replace(':total', this.status.total.toString())
            .replace(':elapse', isNaN(this.status.elapse) ? '\u221E' : (this.status.elapse / 1000).toFixed(1))
            .replace(':eta', isNaN(this.status.eta) ? '\u221E' : (this.status.eta / Time.SECOND)
            .toFixed(1))
            .replace(':percent', this.status.percent.toFixed(2) + '%')
            .replace(':rate', this.status.rate.toString())
            .replace(':bar', completeStr + incompleteStr);
    };
    ProgressBar.prototype.tick = function (len, extra) {
        var _this = this;
        if (extra != undefined)
            Object.keys(extra).forEach(function (key) {
                _this.status.extra[key] = extra[key];
            });
        if (this.status.cur == 0)
            this.status.start = Date.now();
        this.status.cur += len;
        if (this.status.cur >= this.status.total) {
            this.status.done = true;
            this.update(true);
        }
        else
            this.update();
        return this;
    };
    ProgressBar.prototype.update = function (force) {
        if (force === void 0) { force = false; }
        var now = Date.now();
        if (!force && now - this.status.lastRenderTime < this.renderThrottle)
            return;
        else
            this.status.lastRenderTime = now;
        var ratio = this.status.cur / this.status.total;
        this.status.percent = (ratio * 100);
        this.status.elapse = now - this.status.start;
        this.status.rate = this.status.cur / this.status.elapse * this.rateUnit;
        this.status.eta = (this.status.percent == 100) ? 0 : this.status.elapse * (this.status.total / this.status.cur - 1);
        return this;
    };
    ProgressBar.prototype.draw = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, origin_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(this.stream === process.stdout)) return [3 /*break*/, 8];
                        stdin.setRawMode(true);
                        hideCursor(); //避免闪烁
                        if (!(this.status.initRenderPos == undefined)) return [3 /*break*/, 3];
                        _a = this.status;
                        return [4 /*yield*/, getCursorPosition()];
                    case 1:
                        _a.initRenderPos = _d.sent();
                        this.stream.write(this.Format());
                        _b = this.status;
                        return [4 /*yield*/, getCursorPosition()];
                    case 2:
                        _b.lastRenderPos = _d.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, getCursorPosition()];
                    case 4:
                        origin_1 = _d.sent();
                        return [4 /*yield*/, clearSection(this.status.initRenderPos, this.status.lastRenderPos)];
                    case 5:
                        _d.sent();
                        setCursorPosition(this.status.initRenderPos);
                        this.stream.write(this.Format());
                        _c = this.status;
                        return [4 /*yield*/, getCursorPosition()
                            //判断光标是否变长了
                        ];
                    case 6:
                        _c.lastRenderPos = _d.sent();
                        //判断光标是否变长了
                        if (!compareCursor(origin_1, this.status.lastRenderPos))
                            setCursorPosition(origin_1);
                        _d.label = 7;
                    case 7:
                        showCursor();
                        _d.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return ProgressBar;
}());

export { ProgressBar };
