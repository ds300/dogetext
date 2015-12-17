// custom implementaiton of es6 promises for fun. i will use a real one soon.

export type PromiseConstructor<T> = (resolve: (value: T) => void, reject: (reason) => void) => void;

export interface Promise<T> {
  then<E>(
    onFulfilled: (value: T) => E,
    onRejected: (reason) => any
  ): Promise<E>;
  then<E>(
    onFulfilled: (value: T) => Promise<E>,
    onRejected: (reason) => any
  ): Promise<E>;
  catch<E>(onRejected: (reason) => E): Promise<E>;
}

export function Promise<T>(cons: PromiseConstructor<T>): void {
  let resolved = false;
  let resolvedValue = null;
  let resolutionListeners = [];

  let rejected = false;
  let rejectedReason = null;
  let rejectionListeners = [];

  let resolve = (value: T) => {
    if (!resolved && !rejected) {
      resolved = true;
      resolvedValue = value;
      resolutionListeners.forEach(w => w(value));
      resolutionListeners = [];
      rejectionListeners = [];
    } else {
      throw new Error('promise already resolved or rejected');
    }
  };
  let reject = (reason) => {
    if (!resolved && !rejected) {
      rejected = true;
      rejectedReason = reason;
      rejectionListeners.forEach(w => w(reason));
      rejectionListeners = [];
      resolutionListeners = [];
    } else {
      throw new Error('promise already resolved or rejected');
    }
  };

  cons(resolve, reject);

  this.then = (onFulfilled, onRejected) => {
    return new Promise((resolve, reject) => {
      if (onFulfilled) {
        if (resolved) {
          const next = onFulfilled(resolvedValue);
          if (next instanceof Promise) {
            next.then(resolve, reject);
          } else {
            resolve(next);
          }
        } else if (!rejected) {
          resolutionListeners.push(value => {
            const next = onFulfilled(value);
            if (next instanceof Promise) {
              next.then(resolve, reject);
            } else {
              resolve(next);
            }
          });
        }
      }
      if (onRejected) {
        if (rejected) {
          const next = onRejected(rejectedReason);
          if (next instanceof Promise) {
            next.then(resolve, reject);
          } else {
            reject(next);
          }
        } else if (!rejected) {
          rejectionListeners.push(reason => {
            const next = onRejected(reason);
            if (next instanceof Promise) {
              next.then(resolve, reject);
            } else {
              reject(next);
            }
          });
        }
      }
    });
  };

  this.catch = (onRejected) => {
    return this.then(null, onRejected);
  };
}

export module Promise {
  export function all (promises: Promise<any>[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const n = promises.length;
      let numResolved = 0;
      const result = Array(n);

      let rejected = false;

      promises.forEach((p, i) => {
        p.then(
          v => {
            if (!rejected) {
              result[i] = v;
              numResolved++;
              if (numResolved === n) {
                resolve(result);
              }
            }
          },
          reason => {
            if (!rejected) {
              rejected = true;
              reject(reason);
            }
          }
        )
      })
    });
  }

  export function race (promises: Promise<any>[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let raceOver = false;

      promises.forEach(p => {
        p.then(
          v => {
            if (!raceOver) {
              raceOver = true;
              resolve(p);
            }
          },
          reason => {
            if (!raceOver) {
              raceOver = true;
              reject(reason);
            }
          }
        )
      })
    });
  }

  export function reject<T>(reason: T) {
    return Promise((_, reject) => reject(reason));
  }

  export function resolve<T>(value: T) {
    return Promise((resolve, _) => resolve(value));
  }
}
