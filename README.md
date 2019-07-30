# Pug CMS

## Run

```shell
npm run transpile
```

## Directory Structure

- `shortcodes`

  - contains a collection of `pug` and `scss` files
  - all `pug` files define short codes

- `pages`

  - a directory of text files (without extension)
  - every text file will be transpiled to an `html` file (the extension `html` is added to the name)
  - every file consists of a header and a body, separated by a line containing a sequence of the symbols `=`
  - the header contains meta information and is a list of name value-pairs separated by newlines
    - every name value-pair has the form `<name>: <value>`; the name is an identifier, the value either
      - is wrapped into `"` and contains no `"`; can contain new lines
      - does not start with `"`; then the value ends before the new line
    - possible meta information
    - `id` (require): a unique identifier of this page
    - `layout` (required): a reference to the layout
  - the body is a text as written in the wordpress editor with arbitrary usage of short codes

- `config`

  - `variables.json` (required): any freely defined configuration variables that can be used in the shortcodes
  - `options.json` (required), a JSON file with the required entries
    - `domain`: the initial part of the url of this website including the schema and host (and port)
    - `sitemap`: the sitemap name (e.g., `/sitemap.xml`)
    - `minify`: a Boolean value – determines whether the css code gets minified

- `assets` (required): any files that are to be copied to the website's `asset` directory

- `rootAssets` (required): a folder with assets that are to be copied to the website root directory (e.g., `favicon.ico`)

- `styles/main.scss` (required): the main scss file, will mainly contain import statements to the `scss` files in the `shortcodes` directory

- `layout`: a collection of `pug` files that contain a complete HTML file with header and body; the content of the page can be used as the variable `content`
