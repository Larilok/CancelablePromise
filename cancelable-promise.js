class CancelablePromise extends Promise {
  constructor (query) {
    if (typeof query !== 'function')
      throw new Error('Expect promise argument to be a function')
  }
}

module.exports = CancelablePromise
