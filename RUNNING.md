## Notes on Getting Mathbox Running

- I've got this...

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
nvm install node
```

## Editing in Spacemacs

```
npm install -g eslint
```

That is sort of annoying.

When you get prompted for `lsp`, do `json-ls`.

### Spacemacs Layers

- `gpu`

### Safari

- Develop, Experimental Features, WebGL 2.0

### Random

Make sure to delete:

```sh
rm -rf node_modules/gulp-eslint/node_modules/eslint
```

to get eslint working. This dependency keeps an old eslint on the classpath.
