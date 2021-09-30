class CancelablePromise {
  constructor (executor, chain = []) {
    if (typeof executor !== 'function')
      throw new Error('Expect promise argument to be a function')

    this.promise = new Promise(executor).catch(v =>
      console.log(`Constructor catch: ${v}`)
    )
    console.log(`constructor`)
    this.chain = chain
    console.log({ raw: this.chain })
    this.chain.push(this)
    console.log({ push: this.chain })
    this.isCanceled = false
    console.log(`constructor end`)
  }

  then (onFulfilled, onRejected) {
    if (!onFulfilled && !onRejected) return this
    if (typeof onFulfilled !== 'function' && onFulfilled !== undefined)
      throw new Error('Expect first argument to be a function or undefined')

    console.log({ chain: this.chain })
    const newPromise = new CancelablePromise((res, rej) => {
      this.promise.then(
        result => {
          if (this.isCanceled) {
            for (promise in chain) promise.cancel()
            newPromise.cancel()
            // throw new Error('Promise canceled!')
          }
          if (onFulfilled && !this.isCanceled) res(onFulfilled(result))
          else res(result)
        },
        result => {
          if (this.isCanceled) {
            for (promise in chain) promise.cancel()
            newPromise.cancel()
            // throw new Error('Promise canceled!')
          }
          if (onRejected && !this.isCanceled) res(onRejected(result))
          else rej(result)
        }
      )
    }, this.chain)
    return newPromise
  }

  catch (onRejected) {
    console.log(`Catch`)
    return this.then(undefined, onRejected)
  }

  cancel () {
    this.isCanceled = true
    // return this
  }
}
module.exports = CancelablePromise

const promise1 = new CancelablePromise(resolve => resolve(1))
const promise2 = promise1.then(() => 2)

console.log({ promise1 })
console.log({ promise2 })

promise2.cancel()
console.log({ promise1 })
console.log({ promise2 })

// const main = async () => {
//   let value = 0
//   const promise = new CancelablePromise(resolve =>
//     setTimeout(() => resolve(1), 100)
//   ).then(v => (value = v))
//   const promiseState = await getPromiseState(promise)

//   function getPromiseState (promise, callback) {
//     const unique = Symbol('unique')
//     return Promise.race([promise, Promise.resolve(unique)])
//       .then(value => (value === unique ? 'pending' : 'fulfilled'))
//       .catch(() => 'rejected')
//       .then(state => {
//         callback && callback(state)
//         return state
//       })
//   }

//   console.log(promiseState)

//   setTimeout(() => promise.cancel())

//   promise.then()
// }
// main()
