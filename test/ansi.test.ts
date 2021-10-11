import { stdin, stdout } from "process"
import { getCursorPosition, validateCursorPositionStr } from "../src/ansi"

describe('validateCursorPositionStr', () => {
    let dataTrue = ['\x1b[1;2R', '\x1b[200;69R']
    let len = dataTrue.length
    for (let i = 0; i < len; i++) {
        test('True' + i.toString(), () => {
            expect(validateCursorPositionStr(dataTrue[i])).toBe(true)
        })
    }
    let dataFalse = ['\x1b[1;2sR', '\x1b[s2s0s0;69R']
    len = dataFalse.length
    for (let i = 0; i < len; i++) {
        test('False' + i.toString(), () => {
            expect(validateCursorPositionStr(dataFalse[i])).toBe(false)
        })
    }
})
describe('getCursorPos', () => {
    describe('side effect', () => {
        test('stdin status1', async (done) => {
            await getCursorPosition()
            expect(stdin.isPaused()).toBe(false)
            expect(stdin.isRaw).toBe(false)
            stdin.pause()
            done()
        })
        test('stdin status2', async () => {
            stdin.setRawMode(true)
            stdin.pause()
            await getCursorPosition()
            expect(stdin.isPaused()).toBe(true)
            expect(stdin.isRaw).toBe(true)
            stdin.pause()
        })
    })
    test('disable keyboard input', done => {
        //闪烁问题是jest终端原因 API测试通过
        let count = 0;
        let s = setInterval(async () => {
            count += 1;
            await getCursorPosition()
            if (count == 15) {
                clearInterval(s)

                done()
            }
        }, 1000)
    }, 20000)
    test('exit', () => {
        setInterval(() => {
            getCursorPosition()
        }, 1000)
    })
})
