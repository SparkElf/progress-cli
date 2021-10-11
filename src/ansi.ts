import { stdin, stdout } from "process"
import { inspect } from "util"

export const GET_CURSOR_POSITION = '\x1b[6n'
export const SPACE = '\x20'
export const HIDE_CURSOR = '\x1b[?25l'
export const SHOW_CURSOR = '\x1b[?25h'
export const ERASE_END_OF_LINE = '\x1b[K'
export const ERASE_START_OF_LINE = '\x1b[1K'
export const ERASE_LINE = '\x1b[2K'
export class CursorPos {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}
export const validateCursorPositionStr = (s: string): boolean => {
    if (s[0] == '\x1b' && s[1] == '\x1b')
        process.exit(-1)
    if (s[0] != '\x1b') return false
    if (s[1] != '[') return false
    let i = 2
    for (; s[i] >= '0' && s[i] <= '9'; i++);
    if (s[i] != ';') return false
    for (i = i + 1; s[i] >= '0' && s[i] <= '9'; i++);
    if (s[i] != 'R') return false

    return true
}
const parseCursorPosition = (s: string) => {
    let row = ''
    let col = ''
    let i = 2
    for (; s[i] != ';'; i++)
        row += s[i]
    for (i += 1; s[i] != 'R'; i++)
        col += s[i]
    const pos: CursorPos = { x: parseInt(col), y: parseInt(row) }
    return pos

}
export const getCursorPosition = (): Promise<CursorPos> => {
    let mode = stdin.isRaw
    stdin.setRawMode(true);
    stdout.write(GET_CURSOR_POSITION);
    stdin.resume();//养成习惯需要输入时主动resume(),不用保存流状态
    return new Promise(resolve => {
        const f = data => {
            stdin.pause()
            let s = data.toString()
            if (validateCursorPositionStr(s)) {
                resolve(parseCursorPosition(data.toString()))
                if (!mode)
                    stdin.setRawMode(false)
                stdin.removeListener('data', f)
            }
        }
        stdin.on("data", f);
    })
}
export const setCursorPosition = (pos: CursorPos) => {
    stdout.write(`\x1b[${pos.y};${pos.x}H`)
}
//return ture if end cursor behind or equal the start cursor
export const compareCursor = (start: CursorPos, end: CursorPos): boolean => {
    if (end.y > start.y)
        return true
    if (end.y < start.y)
        return false
    if (end.x >= start.x)
        return true
    return false
}
export const equalCursor = (start: CursorPos, end: CursorPos): boolean => {
    return (end.y == start.y && end.x == start.x)
}
export const clearSection = async (start: CursorPos, end: CursorPos) => {
    if (start.y === end.y) {
        let origin = await getCursorPosition()
        if (!(compareCursor(start, end)))
            return
        let total = end.x - start.x + 1
        let a = ''
        for (let i = 0; i < total; i++) {
            a += ' '
        }
        stdout.write(a.toString())
        setCursorPosition(origin)
    } else if (start.y < end.y) {
        let origin = await getCursorPosition()
        setCursorPosition(start)
        eraseEndOfLine()
        let curY = start.y + 1
        while (curY != end.y) {
            setCursorPosition({ x: 1, y: curY })
            eraseLine()
            curY += 1
        }
        setCursorPosition(end)
        eraseStartOfLine()
    }
}
export const clearSectionByNum = async (startX: number, startY: number, endX: number, endY: number) => {
    await clearSection(new CursorPos(startX, startY), new CursorPos(endX, endY))
}
export const getTerminalWidth = async () => {
    let origin = await getCursorPosition()
    setCursorPosition({ x: 999, y: 2 })
    let width = (await getCursorPosition()).x
    setCursorPosition(origin)
    return width
}
export const getTerminalHeight = async () => {
    let origin = await getCursorPosition()
    setCursorPosition({ x: 2, y: 99999 })
    let height = (await getCursorPosition()).y
    setCursorPosition(origin)
    return height
}
export const hideCursor = () => {
    stdout.write(HIDE_CURSOR)
}
export const showCursor = () => {
    stdout.write(SHOW_CURSOR)
}
export const eraseEndOfLine = () => {
    stdout.write(ERASE_END_OF_LINE)
}
export const eraseStartOfLine = () => {
    stdout.write(ERASE_START_OF_LINE)
}
export const eraseLine = () => {
    stdout.write(ERASE_LINE)
}