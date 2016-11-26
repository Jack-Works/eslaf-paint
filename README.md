# Eslaf-paint (Command Line Tool)
## Usage
``` eslaf-paint [textfile (.js|.json)] [Style file (.css)] [Picture files (.*)] ```

*More than 1 picture is okay(not as module way)*
## Output Pattern in the textfile
> Output dir, the `$` symbol will be replaced by the input file Name
```
'$/$-output' + 'input.png' => 'input/input-output.png'
```

# Eslaf-paint (JavaScript Module)
Only **first** type-of argument required will be accepted
## Signature
```typescript
type CSSArg = string | {type: 'css', data: string} | undefined
type ImageArg = string | {type: 'image', data: Buffer} | undefined
function EslafPaint(
    argv: {
        _: [ProfileArg, CSSArg, ImageArg], // in any order is okay
        [anyArg: string]: any
    },
    stepCallback?: (name: string, image: Buffer) => void
): Promise<{
    [name: string]: Buffer
}>{}
```
> if `CSSArg` is not provided,
eslaf-paint will use `{type: 'css', data: 'canvas {}'}` as default value

> if `ImageArg` is not provided,
eslaf-paint will use the width and height property in the `canvas` Selector
to create a new canvas,
like `canvas {width: 400, height: 300}`

## Notice
We assume string ends with `.js` or `.json` is a ProfileArg and `.css` is a CSSArg

Any other type of strings is ImageArg

# Profile
> To TypeScript user: `module-function.d.ts` is provided 
## Format
```typescript
type ProfileArg =
    string | 
    {type: 'profile', data: Profile} |
    {type: 'profile', data: Promise<Profile>} |
    {type: 'profile', data: (args: any) => Profile} |
    {type: 'profile', data: (args: any) => Promise<Profile>}
// string is path to profile

type Paint = PaintText | PaintImage
type Profile = {
    [name: string]: Paint[] | Promise<Paint[]>
}
```

## Paint Types
> `use` means the CSS class to use

### Text

```typescript
type PaintText = {
    type: 'text',
    text: string | Promise<string>,
    use?: string | Promise<string>,
    styles?: CSSObject | Promise<CSSObject>
}
```

### Image
```typescript
type ImageSrc = string | Buffer
type PaintImage = {
    type: 'img',
    src: ImageSrc | Promise<ImageSrc>,
    use?: string | Promise<string>,
    styles?: CSSObject | Promise<CSSObject>
}
// string is path to the image
```

# Style file, the CSS-like part
## Supported Selector
- `*`
- `.[Name]`
- `[Selector], [Selector]` 

## Css of Types
The first value of a property is the default value

Each type listed in Paint support **some of** the attrs

*If the valid value is not listed, it is same with CSS* 

## canvas
```CSS
canvas {
    x: <int>
    y: <int>
}
```

## img
```CSS
.className {
    x: <pos-x>
    y: <pos-y>
    width: <length>
    height: <length>
}
```

## text
```CSS
.className {
    text-overflow: break-line | clip
    x: <pos-x>
    y: <pos-y>

    font-size
    font-family
    font-weight
    font-style
    line-height: <px>; use in text-overflow: break-line
    color
    text-shadow

    stroke-color: none | <color>
    stroke-weight: 0 | <length>
}
```

### Notice
> `<pos-x>` and `<pos-y>`: can be negative

# Plugin System
*Document later*
## Load a plugin
```js
// module way
require('eslaf-paint').lib.loadPlugin(plugin)
// config file way
module.exports = argvs => {
    argvs.lib.loadPlugin(plugin)
}
```
## Write a plugin
```js
module.exports = Plugins => {
    // Inject your function here
}
```

# Change log
- Nov 26, 2016: Plugin now can apply on the image type
- Nov 18, 2016: Support Plugin and font-style
- Nov 11, 2016: 0.4.0 release
- Nov 7, 2016: 0.3.0 release