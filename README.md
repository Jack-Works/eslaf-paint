# Eslaf-paint

## Usage
> eslaf-paint --text textfile [Style file (.css)] [Picture files (.*)]

* Only the first css file will be used, we will add import syntax for style file
* Textfile can be a json or a js that export a Object we need

## Textfile
- Output pattern
- - [Array: Text, Style Name(defined in css), Extra CSS (in JSON)]

> Example.json:

```JSON
{
    "$_new": ["Hello, world", "mystyle", {"x": "20px"}]
}
```

> Example.js

```JS
var calc = i => ({y: -40 * i + -200})
var texts = arr => arr.map((x, i) => [x, 'demo', calc(i)])
module.exports = {
    "./$-out/$-B": texts(
        ("因此，在这个世界显然无法长久的情况下，我毫不夸张地在你身上赌上了一切，" + 
        "没有如何拯救这个世界的预言，所以我找了那些在毁灭时有空子可钻的预言，能令这些预言实现的各种奇怪而复杂的前提，我都一一做完了")
        .split('，').reverse()
    )
}
```

With the command
> eslaf-paint --text Example.js styles.css test.png

it will out put the result to './test-out/test-B' ($ is replaced with 'test' in 'test.png')

# All properties of Style CSS file
- The first value of a property is the default value

```
text-overflow: break-line | zoom
min-font-size: 0 | <length>
max-width: Infinity | <length>
x: <pos-x>
y: <pos-y>
align: <align-x>-<align-y> | <short>

font-size,
font-family,
color
text-shadow: Same as CSS

font-weight: 0 | <length>

stroke-color: none | <color>
stroke-weight: 0 | <length>
line-height: document this property later
```
- \<length>: px only
- \<pos-x> and \<pos-y>: can be negative
- \<align-x>: left | right | center
- \<align-y>: top | bottom | center
- \<short>: short for \<align-x>-\<align-y>, map from keypad, Not recommended
- \<color>: CSS color