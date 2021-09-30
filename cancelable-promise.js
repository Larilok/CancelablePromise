class CancelablePromise {
  constructor (executor, chain = []) {
    if (typeof executor !== 'function')
      throw new Error('Expect promise argument to be a function')

    this.isCanceled = false
    this.promise = new Promise((res, rej) => {
      executor(res, rej)
    }).catch(v => v)
    this.chain = chain
    this.chain.push(this)
  }

  then (onFulfilled, onRejected) {
    if (!onFulfilled && !onRejected) return this
    if (typeof onFulfilled !== 'function' && onFulfilled !== undefined)
      throw new Error('Expect first argument to be a function or undefined')

    const newPromise = new CancelablePromise((res, rej) => {
      this.promise.then(
        result => {
          if (this.isCanceled) {
            rej('Promise canceled')
          }
          if (onFulfilled && !this.isCanceled) res(onFulfilled(result))
          else res(result)
        },
        result => {
          if (this.isCanceled) {
            rej('Promise canceled')
          }
          if (onRejected && !this.isCanceled) res(onRejected(result))
          else rej(result)
        }
      )
    }, this.chain)
    return newPromise
  }

  catch (onRejected) {
    return this.promise.then(undefined, onRejected)
  }

  cancel () {
    let i = 0
    while (true) {
      this.chain[i].isCanceled = true
      if (this.chain[i] === this) break
      i++
    }
    return this
  }
}
module.exports = CancelablePromise
