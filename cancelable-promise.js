class CancelablePromise {
  constructor (executor, promise = null, chain = []) {
    if (typeof executor !== 'function' && promise === null)
      throw new Error('Expect promise argument to be a function')

    this.isCanceled = false
    this.promise =
      promise ||
      new Promise((res, rej) =>
        executor(val => {
          if (this.isCanceled) rej(this)
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
    this.chain.forEach(promise => (promise.isCanceled = true))
    return this
  }
}
module.exports = CancelablePromise
