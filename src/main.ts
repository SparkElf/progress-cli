import chalk from "chalk";
import { stdin } from "process";
import { clearSection, compareCursor, CursorPos, getCursorPosition, hideCursor, setCursorPosition, showCursor } from "./ansi";
import Time from "./time";
export interface ProgressBarConfig {
  //the output style
  fmt?: string;
  //current completed index defaultint to zero
  cur?: number;
  //total number of ticks to complete
  total: number;
  //custom data for progress bar
  extra?: {};
  //the displayed width of the progress bar defaulting to total
  width?: number;
  //the output stream defaulting to stdout,you can set it to none.
  stream?: NodeJS.WriteStream;
  //completion character defaulting to chalk.bgGreenBright(' ')
  complete?: string;
  //incomplete character defaulting to ' '
  incomplete?: string;
  //minimum time between updates in milliseconds defaulting to 1
  renderThrottle?: number;
  //optional function to call when the progress bar completes
  callback?: Function;
  //will clear the progress bar upon termination or not,defaulting to false
  clear?: boolean;
  //1:millisecond 1000:second etc.
  rateUnit?: number;
}

export class ProgressBar {
  //the output style defalting to ''
  fmt: string;
  status: {
    //time when start working
    start?: number;
    //current completed index defaulting to zero
    cur: number;
    //total number of ticks to complete
    total: number;
    //whether it is complete
    done?: boolean;
    //ticks per second
    rate?: number
    //time when last rendered
    lastRenderTime?: number;
    //estimat the remaining time to finish
    eta?: number
    //time has been used
    elapse?: number
    //time finish percent
    percent?: number
    //pos where render begin
    initRenderPos?: CursorPos
    //pos where last render end
    lastRenderPos?: CursorPos
    extra: {};
  };
  //the displayed width of the progress bar defaulting to total
  width: number;
  //the output stream defaulting to stdout,you can set it to none.
  stream: NodeJS.WriteStream;
  chars: {
    //completion character defaulting to 'green'
    complete: string;
    //incomplete character defaulting to ' '
    incomplete: string;
  };

  //minimum time between updates in milliseconds defaulting to 1
  renderThrottle: number;
  //optional function to call when the progress bar completes
  callback: Function;
  //will clear the progress bar upon termination or not,defaulting to false
  clear: boolean;
  //1:millisecond 1000:second etc.
  rateUnit?: number;
  constructor(options: ProgressBarConfig) {
    this.fmt = options.fmt || "";
    this.status = {
      cur: options.cur || 0,
      total: options.total,
      extra: options.extra || null,
    };
    this.width = options.width || this.status.total;
    this.stream = options.stream || process.stdout;
    this.chars = {
      complete: options.complete || chalk.bgGreen(" "),
      incomplete: options.incomplete || "-"
    }
    this.renderThrottle = options.renderThrottle || 1;
    this.callback = options.callback || (() => { });
    this.clear = options.clear || false;
    this.rateUnit = options.rateUnit || Time.SECOND
  }
  setFormat(s: string): ProgressBar {
    this.fmt = s
    return this
  }
  Format(): string {
    let completeLen = Math.floor(this.width * this.status.percent / 100)
    let completeStr = ''
    for (let i = 0; i < completeLen; i++)
      completeStr += this.chars.complete
    let incompleteStr = ''
    for (let i = 0; i < this.width - completeLen; i++)
      incompleteStr += this.chars.incomplete
    return this.fmt//replace不修改原字符串
      .replace(':current', this.status.cur.toString())
      .replace(':total', this.status.total.toString())
      .replace(':elapse', isNaN(this.status.elapse) ? '\u221E' : (this.status.elapse / 1000).toFixed(1))
      .replace(':eta', isNaN(this.status.eta) ? '\u221E' : (this.status.eta / Time.SECOND)
        .toFixed(1))
      .replace(':percent', this.status.percent.toFixed(2) + '%')
      .replace(':rate', this.status.rate.toString())
      .replace(':bar', completeStr + incompleteStr)
  }
  tick(len: number, extra?: {}): ProgressBar {
    if (extra != undefined)
      Object.keys(extra).forEach(key => {
        this.status.extra[key] = extra[key];
      });

    if (this.status.cur == 0)
      this.status.start = Date.now();

    this.status.cur += len;

    if (this.status.cur >= this.status.total) {
      this.status.done = true;
      this.update(true)
    }

    else
      this.update()
    return this
  }
  update(force = false): ProgressBar {
    let now = Date.now();
    if (!force && now - this.status.lastRenderTime < this.renderThrottle)
      return;
    else
      this.status.lastRenderTime = now;

    let ratio = this.status.cur / this.status.total
    this.status.percent = (ratio * 100)
    this.status.elapse = now - this.status.start
    this.status.rate = this.status.cur / this.status.elapse * this.rateUnit
    this.status.eta = (this.status.percent == 100) ? 0 : this.status.elapse * (this.status.total / this.status.cur - 1)

    return this
  }
  async draw() {
    if (this.stream === process.stdout) {
      stdin.setRawMode(true)
      hideCursor()//避免闪烁
      if (this.status.initRenderPos == undefined) {
        this.status.initRenderPos = await getCursorPosition()
        this.stream.write(this.Format())
        this.status.lastRenderPos = await getCursorPosition()
      } else {
        //假设进度条不会覆盖后续内容
        let origin = await getCursorPosition()
        await clearSection(this.status.initRenderPos, this.status.lastRenderPos)
        setCursorPosition(this.status.initRenderPos)
        this.stream.write(this.Format())
        this.status.lastRenderPos = await getCursorPosition()
        //判断光标是否变长了
        if (!compareCursor(origin, this.status.lastRenderPos))
          setCursorPosition(origin)
      }
      showCursor()
    }

  }
}
