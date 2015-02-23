## Markdown-test

### This is a script that will watch your markdown file(s) for you and render them using GFM (github flavored markdown)

#### Installation

```
npm install -g markdown-test
```

#### Usage
```
mdtest <path-to-your-md-file.md>
```

#### Notes

You will be prompted for a github User-Agent on first use, this is just your github login name to utilize the github api (for markdown parsing).

To change this, run:

```
mdtest --clear-settings
```

and you will be prompted again on next use