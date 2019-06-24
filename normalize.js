const Fs = require('fs');
const Readline = require('readline');
const Stream = require('stream');

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

// construct a new Object
function LogLineObject(userId, datetime, action, url, queryString) {
  var o = new Object();
  o['userId'] = userId;
  o['datetime'] = datetime;
  o['action'] = action;
  o['url'] = url;
  o['queryString'] = queryString  || '';
  return o;
}

// reshape the log line extracting values which are the interested ones
// from `2019-02-13 13:48:33,284 [ajp-apr-127.0.0.1-8009-exec-5] INFO  com.suse.manager.webui.controllers.FrontendLogController - [10] - [Wed, 13 Feb 2019 20:50:25 GMT] - Loading 'https://srv.tf.local/rhn/users/UserDetails.do?uid=15'`
// to [{"userId": "10", "datetime": "Wed, 13 Feb 2019 20:50:25 GMT", "action": "Loading", "url": "https://srv.tf.local/rhn/users/UserDetails.do"}]
function normalize(line) {
  var valuesPatter = /.*FrontendLogController - \[(\d*\w*)*\] - \[(.*)\] - (\w*) `(.*)`/g;
  var normalizedObject = new LogLineObject(
    line.replace(valuesPatter, '$1'),
    line.replace(valuesPatter, '$2'),
    line.replace(valuesPatter, '$3'),
    line.replace(valuesPatter, '$4').split('?')[0], // drop the QueryString slice from the URL
    line.replace(valuesPatter, '$4').split('?')[1], // keep the QueryString slice only
  );
  return normalizedObject;
}

// process the log file passed through args
function processFile(inputFile) {
  var data = [];

  const instream = Fs.createReadStream(inputFile);
  const outstream = new (Stream)();
  const rl = Readline.createInterface(instream, outstream);

  rl.on('line', function (line) {
    if (line && line != null) {
      data.push(normalize(line));
    }
  });

  rl.on('close', function (line) {
    if (line && line != null) {
      data.push(normalize(line));
    }
    // save the normalized data
    Fs.writeFile(inputFile + '-normalized.json', JSON.stringify(data, null, 2), 'utf8', () => {});
  });
}
processFile(process.argv[2]);
