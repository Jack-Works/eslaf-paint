# Eslaf-part (Command Line Tool)
## Usage
``` eslaf-paint [textfile (.js|.json)] [Style file (.css)] [Picture files (.*)] ```
*More than 1 picture is okay(not as module way)*
## Output Pattern in the textfile
> Output dir, the `$` symbol will be replaced by the input file Name
```
'$/$-output' + 'input.png' => 'input/input-output.png'
```

# Eslaf-paint (JavaScript Module)
Only **first** textfile, image file and style file will be accepted
## Signature
eslafPaint: Arguments{_: Array} => Promise<{name: buffer}>

``` JS
require('eslaf-paint')({_: ['Example.js', 'style.css', 'test.png']})
```

# Textfile
## Promise support
You can Promise everything in the textfile!
## Format
```
Object {
    String name: Paint[] 
}
```

## Paint
An Object
> Contain the info about how to paint the picture

### General attrs:
- type: The type of the Paint: 'text' or 'img' 
- use: The css class this object will use
- styles: Extra styles(Object, not css string), like style="" in html


### type == img
#### Attrs
- src: Src of the picture
- src: Buffer of the picture

### type == text
#### Attrs
- text: Text will be painted
---------------------------------------
## Example
### JSON Type
> JSON style is not recommended now, but you can still use it
  And also, we will not remove the support for JSON type
  You can use the JSON type just like JS type, but many features are disabled (like Promise or Buffer)

### JS Function Type (example0.js)
> Arguments => Paint[]
> Arguments => Promise<Paint[]>
```JS
module.exports = CommandLineArguments => require('./example1.js')
```
or
```JS
module.exports = CommandLineArguments => require('./async.js')
```
### JS Object Type (example1.js)
```JS
const generate = i => ({
    type: "text",
    text: i == 0 ? Math.random().toString() : new Promise(
        resolve => setTimeout(() => resolve('wow'), 2000)
    ),
    use: "classText",
    styles: {x: 40 + i}
}, {
    type: "img",
    raw: fs.readFileSync('./x.png'),
    use: "pic"
})
module.exports = {
    [$_output_dir]: [generate(1), generate(2), generate(0)]
}
```
### Async JS Type (async.js)
```JS
module.exports = new Promise(
    resolve => setTimeout(
        () => resolve(require('./example1.js'))
    , 2000)
)
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

## img
```
x: <pos-x>
y: <pos-y>
width: <length>
height: <length>
```

## text
```
text-overflow: break-line | zoom | clip
min-font-size: 0 | <length>
max-width: Infinity | <length>
x: <pos-x>
y: <pos-y>
align: <align-x>-<align-y> | <short>

font-size,
font-family,
color
text-shadow

font-weight: 0 | <length>

stroke-color: none | <color>
stroke-weight: 0 | <length>
line-height: document this property later
```

### Valid value Type
- \<length>: px only
- \<pos-x> and \<pos-y>: can be negative
- \<align-x>: left | right | center
- \<align-y>: top | bottom | center
- \<short>: short for \<align-x>-\<align-y>, map from keypad, Not recommended
- \<color>: CSS color

## Change log
- Nov 7, 2016: 0.3.0 release