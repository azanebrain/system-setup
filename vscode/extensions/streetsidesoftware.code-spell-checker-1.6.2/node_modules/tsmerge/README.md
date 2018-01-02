# tsmerge
A shallow merge function that works nicely with typescript.

In the spirit of making things immutable, it is important to be able to merge objects together in an easy fashion.

In the ideal world, we could have a spread `...` operator in typescript like the one supported by JSX:
```javascript
const options = {...defaults, ...customizations};
```
which would copy all the fields in `defaults` and override with any custom fields from `customizations`.

The new ES6 Object.assign, does what we want, but has a strange syntax.
```javascript
const options = Object.assign({}, defaults, customizations);
```

tsmerge is just a friendlier way of doing Object.assign.

Example:
```javascript
import {merge} from 'tsmerge';
...

const options = merge(defaults, customizations);
```

Install:
```
npm install tsmerge --save
```

Usage:
```javascript
import {merge} from 'tsmerge';

const defaults = { timeout: 30000, retries: 3 };
const customizations = { retries: 10 };
const options = merge(defaults, customizations);
console.log(options);  // output: { timeout: 30000, retries: 10 }
```

