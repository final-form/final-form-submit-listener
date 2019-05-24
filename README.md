# 🏁 Final Form Submit Listener 🧐

[![NPM Version](https://img.shields.io/npm/v/final-form-submit-listener.svg?style=flat)](https://www.npmjs.com/package/final-form-submit-listener)
[![NPM Downloads](https://img.shields.io/npm/dm/final-form-submit-listener.svg?style=flat)](https://www.npmjs.com/package/final-form-submit-listener)
[![Build Status](https://travis-ci.org/final-form/final-form-submit-listener.svg?branch=master)](https://travis-ci.org/final-form/final-form-submit-listener)
[![codecov.io](https://codecov.io/gh/final-form/final-form-submit-listener/branch/master/graph/badge.svg)](https://codecov.io/gh/final-form/final-form-submit-listener)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Decorator for [🏁 Final Form](https://github.com/final-form/final-form) that
will call provided callbacks when submission is attempted, succeeds, or fails.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
npm install --save final-form final-form-submit-listener
```

or

```bash
yarn add final-form final-form-submit-listener
```

## Usage

### 🏁 Final Form Usage

```js
import { createForm } from 'final-form'
import createDecorator from 'final-form-submit-listener'

// Create Form
const form = createForm({ onSubmit })

// Create Decorator
const decorator = createDecorator()

// Decorate form
const undecorate = decorator(form)

// Use form as normal
```

### 🏁 React Final Form Usage

```js
import React from 'react'
import { Form, Field } from 'react-final-form'
import createDecorator from 'final-form-submit-listener'

const submitListener = createDecorator({
  beforeSubmit: formApi => { /* do something before */ },
  afterSubmitSucceeded: formApi => { /* do something on success */ },
  afterSubmitFailed: formApi => { /* do something on fail */ },
})
...
<Form
  onSubmit={submit}
  decorators={[ submitListener ]} // <--------- 😎
  validate={validate}
  render={({ handleSubmit }) =>
    <form onSubmit={handleSubmit}>

      ... inputs here ...

    </form>
  }
/>
```

## API

### `createDecorator: ({ beforeSubmit?: BeforeSubmit, afterSubmitSucceeded?: AfterSubmit, afterSubmitFailed?: AfterSubmit) => Decorator`

A function that takes optional callback functions and provides a 🏁 Final Form [`Decorator`](https://github.com/final-form/final-form#decorator-form-formapi--unsubscribe) that will listen for submission events and call the callbacks.

## Types

### `AfterSubmit: (form: FormApi) => void`

A callback that is given the 🏁Final Form instance ([`FormApi`](https://github.com/final-form/final-form#formapi)).

### `BeforeSubmit: (form: FormApi) => void | false`

A callback that is given the 🏁Final Form instance ([`FormApi`](https://github.com/final-form/final-form#formapi)). If it returns `false`, the submission will be aborted, and none of the "after submit" callbacks will fire.
