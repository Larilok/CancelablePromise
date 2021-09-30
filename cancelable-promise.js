class CancelablePromise {
  constructor (executor, promise = null, chain = []) {
    if (typeof executor !== 'function' && promise === null)
      throw new Error('Expect promise argument to be a function')

    this.isCanceled = false
    this.promise =
      promise ||
      new Promise((res, rej) =>
        executor(val => {
          if (this.isCanceled) rej('Promise canceled')
          res(val)
        }, rej)
      )
    this.chain = chain
    this.chain.push(this)
  }

  then (onFulfilled, onRejected) {
    if (!onFulfilled && !onRejected) return this
    if (typeof onFulfilled !== 'function' && onFulfilled !== undefined)
      throw new Error('Expect first argument to be a function or undefined')

    const newPromise = this.promise
      .then(onFulfilled, onRejected)
      .catch(onRejected)

    return new CancelablePromise(null, newPromise, this.chain)
  }

  catch (onRejected) {
    return this.then(undefined, onRejected)
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
