/// <reference types="jest" />
import createDecorator from '../src/decorator'
import { createForm, FormApi } from 'final-form'

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

describe('decorator', () => {
  it('should call beforeSubmit before submit', () => {
    const beforeSubmit = jest.fn() as jest.Mock<void | boolean, [FormApi]>
    const onSubmit = jest.fn(() => {
      expect(beforeSubmit).toHaveBeenCalled() // ensure it's called BEFORE
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({ beforeSubmit })
    decorator(form)

    form.change('foo', 42)

    expect(beforeSubmit).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    form.submit()
    expect(beforeSubmit).toHaveBeenCalled()
    expect(beforeSubmit).toHaveBeenCalledTimes(1)
    expect(beforeSubmit.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should allow before submit to cancel submission', () => {
    const onSubmit = jest.fn()
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const beforeSubmit = jest.fn(() => false)
    const decorator = createDecorator({ beforeSubmit })
    decorator(form)

    form.change('foo', 42)

    expect(beforeSubmit).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    form.submit()
    expect(beforeSubmit).toHaveBeenCalled()
    expect(beforeSubmit).toHaveBeenCalledTimes(1)
    expect(beforeSubmit.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should call afterSubmitSucceeded after submit succeeded', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(() => {
      expect(afterSubmitSucceeded).not.toHaveBeenCalled() // ensure it's called AFTER
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    form.submit()
    await sleep(0) // Let the promise resolve
    expect(afterSubmitSucceeded).toHaveBeenCalled()
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(afterSubmitSucceeded.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // failed never called
    expect(afterSubmitFailed).not.toHaveBeenCalled()
  })

  it('should call afterSubmitSucceeded after async submit succeeded', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(async () => {
      expect(afterSubmitSucceeded).not.toHaveBeenCalled() // ensure it's called AFTER
      await sleep(5)
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    form.submit()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // not called....YET
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()

    await sleep(8)

    // NOW it's been called
    expect(afterSubmitSucceeded).toHaveBeenCalled()
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(afterSubmitSucceeded.mock.calls[0]?.[0]).toBeDefined()

    // failed never called
    expect(afterSubmitFailed).not.toHaveBeenCalled()
  })

  it('should call afterSubmitFailed when validation fails', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(() => {
      expect(afterSubmitFailed).not.toHaveBeenCalled() // ensure it's called AFTER
    })
    const form = createForm({ onSubmit, validate: () => ({ foo: 'BAD FOO' }) })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
    form.submit()
    await sleep(0) // Let the promise resolve
    expect(onSubmit).not.toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalledTimes(1)
    expect(afterSubmitFailed.mock.calls[0]?.[0]).toBeDefined()

    // succeeded never called
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
  })

  it('should call afterSubmitFailed sync when sync validation fails', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(async () => {
      expect(afterSubmitFailed).not.toHaveBeenCalled() // ensure it's called AFTER
      await sleep(5)
    })
    const form = createForm({ onSubmit, validate: () => ({ foo: 'BAD FOO' }) })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()
    await sleep(0) // Let the promise resolve

    expect(afterSubmitFailed).toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalledTimes(1)
    expect(afterSubmitFailed.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()

    // succeeded never called
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
  })

  it('should call afterSubmitFailed async when async validation fails', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(async () => {
      expect(afterSubmitFailed).not.toHaveBeenCalled() // ensure it's called AFTER
      await sleep(5)
    })
    const form = createForm({
      onSubmit,
      validate: async () => {
        await sleep(2)
        return { foo: 'BAD FOO' }
      }
    })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    await sleep(8)

    expect(afterSubmitFailed).toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalledTimes(2)
    expect(afterSubmitFailed.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()

    // succeeded never called
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
  })

  it('should call afterSubmitFailed sync when sync submit fails', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(() => {
      expect(afterSubmitFailed).not.toHaveBeenCalled() // ensure it's called AFTER
      return { foo: 'BAD FOO' }
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()
    await sleep(0) // Let the promise resolve

    expect(afterSubmitFailed).toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalledTimes(1)
    expect(afterSubmitFailed.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // succeeded never called
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
  })

  it('should call afterSubmitFailed async when async submit fails', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(async () => {
      expect(afterSubmitFailed).not.toHaveBeenCalled() // ensure it's called AFTER
      await sleep(5)
      return { foo: 'BAD FOO' }
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()

    expect(afterSubmitFailed).not.toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await sleep(8)

    expect(afterSubmitFailed).toHaveBeenCalled()
    expect(afterSubmitFailed).toHaveBeenCalledTimes(1)
    expect(afterSubmitFailed.mock.calls[0]?.[0]).toBeDefined()

    // succeeded never called
    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
  })

  it('should unsubscribe on unsubscribe', async () => {
    const afterSubmitSucceeded = jest.fn()
    const onSubmit = jest.fn()
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({ afterSubmitSucceeded })
    const unsubscribe = decorator(form)

    form.change('foo', 42)

    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    // subscribe
    form.submit()
    await sleep(0) // Let the promise resolve
    expect(afterSubmitSucceeded).toHaveBeenCalled()
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(afterSubmitSucceeded.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // unsubscribe
    unsubscribe()

    // change values
    form.change('foo', 50)

    // submit again
    form.submit()
    await sleep(0) // Let the promise resolve
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('should handle non-promise submit result', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(() => {
      // Return a non-promise value
      return undefined
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()
    await sleep(0) // Let any potential promises resolve

    expect(afterSubmitSucceeded).toHaveBeenCalled()
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(afterSubmitSucceeded.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // failed never called
    expect(afterSubmitFailed).not.toHaveBeenCalled()
  })

  it('should handle thenable submit result', async () => {
    const afterSubmitSucceeded = jest.fn()
    const afterSubmitFailed = jest.fn()
    const onSubmit = jest.fn(() => {
      // Return a thenable object
      return {
        then: (callback: () => void) => {
          // Call the callback immediately to simulate a thenable
          callback()
        }
      }
    })
    const form = createForm({ onSubmit })
    form.registerField('foo', () => { }, {})
    form.registerField('bar', () => { }, {})

    const decorator = createDecorator({
      afterSubmitSucceeded,
      afterSubmitFailed
    })
    decorator(form)

    form.change('foo', 42)

    expect(afterSubmitSucceeded).not.toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()

    form.submit()

    expect(afterSubmitSucceeded).toHaveBeenCalled()
    expect(afterSubmitSucceeded).toHaveBeenCalledTimes(1)
    expect(afterSubmitSucceeded.mock.calls[0]?.[0]).toBeDefined()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    // failed never called
    expect(afterSubmitFailed).not.toHaveBeenCalled()
  })
}) 