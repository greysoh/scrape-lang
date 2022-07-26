<h1 align="center" style="margin-top: 0px;">Scrape</h1>
<p align="center" >An alternative programming language for Scratch</p>

## Warning
This is an *unstable* programming language, and is not ready for production.  
  
Please report any bugs you find.
### Features
- Has syntax similar to JavaScript
```js
Sprite.new("Sprite1", function() {
  global var obamasLastName; 
  obamasLastName = prompt("What is Obama's last name?");
  
  Sprite.on("start", function() {
    while (true) {
      sleep(0.1);
    }
  })
})
```
- Is kinda easy to use
### Progress
- [x] Lexer ready for use 
- [ ] Converter ready for use
- [ ] Saving to a file ready for use
- [ ] Stress-tested to ensure no bugs