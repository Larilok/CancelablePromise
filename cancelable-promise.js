class CancelablePromise extends Promise {
  constructor (query) {
    if (typeof query !== 'function')
      throw new Error('Expect promise argument to be a function')
    super((res, rej) => query(res, rej))
  }
}

module.exports = CancelablePromise
