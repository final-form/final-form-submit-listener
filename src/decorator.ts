import { Decorator, FormApi } from 'final-form'

export interface Config {
  beforeSubmit?: (form: FormApi) => void | boolean
  afterSubmitSucceeded?: (form: FormApi) => void
  afterSubmitFailed?: (form: FormApi) => void
}

const maybeAwait = (maybePromise: unknown, callback: () => void): void => {
  if (maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function') {
    // async
    (maybePromise as Promise<unknown>).then(callback)
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