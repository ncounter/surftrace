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

/*
 * core analysis logic
 */

// count how many times an URL has been 'loaded'
function countLoadingUrl(data) {
  const loadingUrl = data.filter(d => d.action == 'Loading').map(u => u.url);
  let uniqueUrl = [...new Set(loadingUrl)];

  let urlCount = [];
  uniqueUrl.forEach(url => {
    var o = {};
    o['url'] = url;
    o['count'] = loadingUrl.filter(l => l == url).length;
    urlCount.push(o);
  });

  // sort by count
  return urlCount.sort((a, b) => b.count - a.count);
}

// count recurrent patterns
function countLoadingPatterns(data) {
  // order by date
  const loadingData = data.filter(d => d.action == 'Loading').sort((a,b) => new Date(a.datetime) <= new Date(b.datetime) ? -1 : 1);

  // create a slice of logs for each user
  const uniqueUsers = [...new Set(loadingData.map(d => d.userId).sort((a,b) => a - b))];

  let pairOfRequests = {};
  uniqueUsers.forEach(u => {
    const history = loadingData.filter(d => d.userId == u);

    // take a pair of requests and count how many times the pattern appears
    history.forEach((h, i) => {
      if (i < history.length -1) {
        const patternKey = h.url + ' - ' + history[i+1].url;
        const currentDelay = (new Date(history[i+1].datetime) - new Date(h.datetime)) / 1000;
        if (pairOfRequests[patternKey]) {
          pairOfRequests[patternKey].count += 1;
          if (h.url == history[i+1].url && h.queryString == history[i+1].queryString) {
            pairOfRequests[patternKey].reloadCount += 1;
          }
          pairOfRequests[patternKey].delay.push(currentDelay);
        }
        else {
          var o = {};
          o['from'] = h.url;
          o['to'] = history[i+1].url;
          o['count'] = 1;
          o['reloadCount'] = h.url == history[i+1].url && h.queryString == history[i+1].queryString ? 1 : 0;
          o['delay'] = [currentDelay];
          pairOfRequests[patternKey] = o;
        }
      }
    });
  });

  // recreate the object after sorting them by count
  return Object.keys(pairOfRequests)
    .sort((a,b) => pairOfRequests[b].count - pairOfRequests[a].count)
    .map(k => pairOfRequests[k]);
}
/*
 * end of core logic
 */

// parse the JSON data into an object
function analyzeData(inputFile, data) {
  const urlCount = countLoadingUrl(data);
  // save the urlCount data
  Fs.writeFile(inputFile + '-url-count.json', JSON.stringify(urlCount, null, 2), 'utf8', () => {});

  const patternCount = countLoadingPatterns(data);
  // save the urlCount data
  Fs.writeFile(inputFile + '-pattern-count.json', JSON.stringify(patternCount, null, 2), 'utf8', () => {});
}

// reshape the log line extracting values which are the interested ones
// from `2019-02-13 13:48:33,284 [ajp-apr-127.0.0.1-8009-exec-5] INFO  com.suse.manager.webui.controllers.FrontendLogController - [10] - [Wed, 13 Feb 2019 20:50:25 GMT] - Loading 'https://srv.tf.local/rhn/users/UserDetails.do?uid=15'`
// to [{"userId": "10", "datetime": "Wed, 13 Feb 2019 20:50:25 GMT", "action": "Loading", "url": "https://srv.tf.local/rhn/users/UserDetails.do"}]
function normalizeData(line) {
  var valuesPatter = /.*FrontendLogController - \[(\d*\w*)*\] - \[(.*)\] - (\w*) `(.*)`/g;
  var normalizedObject = new LogLineObject(
    line.replace(valuesPatter, '$1'),
    line.replace(valuesPatter, '$2'),
    line.replace(valuesPatter, '$3'),
    line.replace(valuesPatter, '$4').split('?')[0] // drop the QueryString slice from the URL
      .replace(/https?:\/\/(\w*\.*)*/g, ''), // drop the name of the server
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
      data.push(normalizeData(line));
    }
  });

  rl.on('close', function (line) {
    if (line && line != null) {
      data.push(normalizeData(line));
    }
    // save the normalized data
    Fs.writeFile(inputFile + '-normalized.json', JSON.stringify(data, null, 2), 'utf8', () => {});
    analyzeData(inputFile, data);
  });
}
processFile(process.argv[2]);
