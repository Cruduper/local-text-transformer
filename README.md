# Local Text Transformer

A small offline browser app for applying reusable text transformations to pasted text.

Includes:

- a dropdown for choosing a transformation
- help notes describing how to use each transformation (per-transform optional)
- some built-in transformations for fragrance note lists that I personally use as demos (feel free to remove these files, but they server as examples)
- support for adding and deleting custom transformations without adding new files or changing existing code
- custom transformations stored in the browser's `localStorage`

## Running the app

Open `index.html` in a browser.

The built-in JavaScript file is loaded by `index.html`. Custom transformations are saved only in the browser profile and origin where the page is opened. Clearing site data can remove them.

## Custom transformation format

A custom transformation must define one function named `transform`.

```js
function transform(text) {
  return text.toUpperCase();
}
```

The function:

1. receives the input field's contents as a string named `text`
2. performs any JavaScript transformation you choose
3. returns the finished output as a string

Another example:

```js
function transform(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");
}
```

A custom transform must return a string. Returning an array, object, number, or `undefined` produces an error.

Custom code is executed as JavaScript in the page. Only add code you wrote or trust.

## Adding another built-in transform file

Each built-in transform can live in its own JavaScript file.

A built-in file should register itself like this:

```js
(() => {
  function transform(text) {
    return text;
  }

  window.TextTransformer.registerBuiltIn({
    id: "unique-transform-id",
    name: "Visible Transform Name",
    transform
  });
})();
```

Add this to its own JavaScript file in the `transforms/` directory. Then add a script tag for that file in `index.html`, after the registry script and before the main application script:

```html
<script src=".transforms/my-new-transform.js"></script>
```
