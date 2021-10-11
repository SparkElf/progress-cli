import chalk from "chalk"
import ora from "ora"
import { ProgressBar } from "../src/main"

let p = new ProgressBar({
    total: 100,
    width: 100,
    complete: chalk.bgGreen(' '),
    incomplete: ' ',
    fmt: ` :bar${chalk.bgGreen(' ')} :percent  :etas`
})

let spinner = ora()
spinner.start()

let s = setInterval(() => {
    spinner.text = p.tick(1).Format()
    if (p.status.done) {
        spinner.succeed()
        clearInterval(s)
    }
}, 1000)