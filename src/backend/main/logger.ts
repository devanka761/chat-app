/* eslint-disable @typescript-eslint/no-explicit-any */
class ConsoleLogger {
  private origin: string

  constructor() {
    this.origin = this._getLogOrigin().split(/[\\/]/).pop()
  }

  private _getLogOrigin() {
    let filename: any

    const _pst = Error.prepareStackTrace
    Error.prepareStackTrace = function (err, stack) {
      return stack
    }
    try {
      const err: any = new Error()
      let callerfile: string

      const currentfile: string = err.stack.shift().getFileName()

      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName()

        if (currentfile !== callerfile) {
          filename = callerfile
          break
        }
      }
    } catch (_err) {
      // nonshowed err
    }
    Error.prepareStackTrace = _pst

    return filename
  }

  public error(content: string | Error | unknown): void {
    console.log(`${new Date().toLocaleTimeString()} ❗️ [${this.origin.length > 25 ? this.origin.substring(0, 17) + "..." : this.origin}] ${content}`)
  }

  public info(content: string): void {
    console.log(`${new Date().toLocaleTimeString()} 🔆 ${content}`)
  }

  public success(content: string): void {
    console.log(`${new Date().toLocaleTimeString()} ❇️ ${content}`)
  }
}

export default new ConsoleLogger()
