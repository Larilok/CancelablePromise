class CancelablePromise extends Promise {
  constructor (executor, chain = []) {
    if (typeof executor !== 'function')
      throw new Error('Expect promise argument to be a function')

    console.log(`constructor`)
    super(executor)
    this.isCanceled = false
    this.chain = chain
    this.chain.push(this)
  }

  then (onFulfilled, onRejected) {
    if (!onFulfilled && !onRejected) return this
    if (typeof onFulfilled !== 'function' && onFulfilled !== undefined)
      throw new Error('Expect first argument to be a function or undefined')

    const newPromise = new CancelablePromise((res, rej) => {
      super
        .then(
          result => {
            if (this.isCanceled) {
              // rej('Promise canceled')
              throw new Error('Promise canceled!')
            }
            if (onFulfilled && !this.isCanceled) res(onFulfilled(result))
            else res(result)
          },
          result => {
            if (this.isCanceled) {
              // rej('Promise canceled')
              throw new Error('Promise canceled!')
            }
            if (onRejected && !this.isCanceled) res(onRejected(result))
            else rej(result)
          }
        )
        .catch(v => console.log(v))
    }, this.chain)
    return newPromise
  }

  // catch (onRejected) {
  //   console.log(`Catch`)
  //   return this.then(undefined, onRejected)
  // }

  cancel () {
    this.chain.forEach(promise => (promise.isCanceled = true))
  }
}
module.exports = CancelablePromise

const main = async () => {
  let value = 0
  const promise = new CancelablePromise(resolve =>
    setTimeout(() => resolve(1), 100)
  ).then(v => (value = v))
  const promiseState = await getPromiseState(promise)

  function getPromiseState (promise, callback) {
    const unique = Symbol('unique')
    return Promise.race([promise, Promise.resolve(unique)])
      .then(value => (value === unique ? 'pending' : 'fulfilled'))
      .catch(() => 'rejected')
      .then(state => {
        callback && callback(state)
        return state
      })
  }

  console.log(promiseState)

  setTimeout(() => promise.cancel())

  promise
    .then(v => console.log({ then: v }))
    .catch(v => console.log({ catch: v }))
}
main()
