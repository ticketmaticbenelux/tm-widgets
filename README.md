# tm-widgets

## Installation

Example of dependency in `package.json`:

```javascript
  "dependencies": {
    "tm-widgets": "git+https://github.com/ticketmaticbenelux/tm-widgets.git"
  }
```

## Usage

Addtickets widget

```javascript
widgets.generateUrl(client, "addtickets", {event: 10001})
```

Checkout widget

```javascript
widgets.generateUrl(client, "checkout", {returnurl: "http://www.ticketmatic.com"})
```

Basket widget

```javascript
widgets.generateUrl(client, "basket", {returnurl: "http://www.ticketmatic.com"})
```

## Example

```javascript
"use strict"

var env = require('node-env-file')
env(__dirname + '/../.env')	

var widgets = require("tm-widgets")

const client = {
	shortname: process.env.SHORTNAME,
	key: process.env.TM_KEY,
	secret: process.env.TM_SECRET
}

let parameters = {event: 10001}
let url = widgets.generateUrl(client, "addtickets", parameters)

```
