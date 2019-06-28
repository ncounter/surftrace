# surftrace
Analyze and put together navigation traces of a [Uyuni](https://github.com/uyuni-project/uyuni) website based on the `rhn_web_frontend.log` file produced by the usage itself.

## Requirements
- `npm`

## analyze.js

### Requirements
```javascript
const Fs = require('fs');
const Readline = require('readline');
const Stream = require('stream');
```

### What it does
From
```
2019-02-13 13:48:33,284 [ajp-apr-127.0.0.1-8009-exec-5] INFO  com.suse.manager.webui.controllers.FrontendLogController - [10] - [Wed, 13 Feb 2019 20:50:25 GMT] - Loading `https://srv.tf.local/rhn/YourRhn.do`
```

To
```JSON
[
  {
    "userId": "10",
    "datetime": "Wed, 13 Feb 2019 20:50:25 GMT",
    "action": "Loading",
    "url": "https://srv.tf.local/rhn/YourRhn.do"
  }
]
```

and it produces a `rhn_web_frontend.log-normalized.json` file with the output in the format as described above.

Then it produces:
 - a new `JSON` file containing distinct loaded URLs and the requested count of each. The new file name will be *the_source_file_name* + `-url-count.json` suffix.
 - a new `JSON` file containing loaded URLs in a `from - to` pattern and the requested count of each pattern. The new file name will be *the_source_file_name* + `-pattern-count.json` suffix.

### How to use

```
node analyze.js data-sources/rhn_web_frontend.log-normalized.json
```
