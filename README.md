# Eslaf-paint

## Recent changes
- Oct 24, The whole config can be a Promise now
- Oct 23, Now some of the input type support async Promise
- Oct 23, Now you can give type pic a Buffer instead
- Oct 22, Now can set the width and height of the img type
- Oct 21, Now can import as a module
- Oct 16, **BREAKING CHANGES** on command arguments and config file, and Support paint Picture now
- Oct 15, Support CSS Selector * now, (but notice, **all selector have the same importance**)
- Oct 15, Fix globally install on Windows
- Oct 7, 2016 text-overflow: clip; now is available

# Usage
``` eslaf-paint [textfile (.js|.json)] [Style file (.css)] [Picture files (.*)] ```

Only **first** textfile and style file will be accepted

## As command
```
eslaf-paint Example.js styles.css test.png
```

## As module
``` JS
require('eslaf-paint')('Example.js', 'style.css', 'test.png')
```


# Textfile
## Format
```
Object {
    String outputPattern: Paint[] 
}
```

## outputPattern
A String
> Output dir, the `$` symbol will be replaced by the input file Name
```
'$/$-output' + 'input.png' => 'input/input-output.png'
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
- src: Buffer of the picture `.js input only`
- src: Promise => Buffer of the picture `.js input only`

### type == text
#### Attrs
- text: Text will be painted
- text: Promise => String `.js input only`
---------------------------------------
## Example
### JSON Type
Since we start to use the new config, the old array style is still supported
```JSON
{
    "$_output": [
        {
            "type": "text",
            "text": "Hello, world",
            "use": "classText",
            "styles": {"x": "20px"}
        },
        {
            "type": "img",
            "src": "./background.png",
            "use": "",
            "styles": {"x": "-20px"}
        }
    ]
}
```

### JS Type (example1.js)
```JS
const generate = i => ({
    type: "text",
    text: i == 0 ? Math.random().toString() : new Promise(
        resolve => setTimeout(() => resolve('wow'), 2000)
    ),
    use: "classText",
    styles: {x: 40 + i}
})
module.exports = {
    [$_output_dir]: [generate(1), generate(2), generate(0)]
}
```
### Async JS Type
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