// @flow
import type { Decorator, FormApi } from 'final-form'

export type Config = {
  beforeSubmit?: FormApi => void | boolean,
  afterSubmitSucceeded?: FormApi => void,
  afterSubmitFailed?: FormApi => void
}

const maybeAwait = (maybePromise, callback) => {
  if (maybePromise && typeof maybePromise.then === 'function') {
    // async
    maybePromise.then(callback)
  } else {
    // sync
    callback()
  }
}

const createDecorator = ({
  beforeSubmit,
  afterSubmitSucceeded,
  afterSubmitFailed
}: Config): Decorator => (form: FormApi) => {
  const originalSubmit = form.submit

  form.submit = () => {
    if (beforeSubmit) {
      if (beforeSubmit(form) === false) {
        return
      }
    }
    const result = originalSubmit.call(form)
    if (afterSubmitSucceeded || afterSubmitFailed) {
      maybeAwait(result, () => {
        const { submitSucceeded, submitFailed } = form.getState()
        if (afterSubmitSucceeded && submitSucceeded) {
          afterSubmitSucceeded(form)
        }
        if (afterSubmitFailed && submitFailed) {
          afterSubmitFailed(form)
        }
      })
    }
    return result
  }

  return () => {
    form.submit = originalSubmit
  }
}

export default createDecorator
