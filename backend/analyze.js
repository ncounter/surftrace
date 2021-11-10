const Fs = require('fs');
const Readline = require('readline');
const Stream = require('stream');

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

/*
 * core analysis logic
 */

/** URL COUNT LOGIC START */
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
/** URL COUNT LOGIC END */

/** PATTERN LOGIC START */
const PAIR_KEY_TEMPLATE = {
  from: '',
  to: '',
  count: 0,
  reloadCount: 0,
  averageDelay: 0,
  maxDelay: 0,
  minDelay: 0,
};

// count recurrent patterns
function countLoadingPatterns(data) {
  // order by date, consider only `Loading` entries
  const loadingData = data.filter(d => d.action == 'Loading').sort((a,b) => new Date(a.datetime) <= new Date(b.datetime) ? -1 : 1);

  // create a slice of logs for each user
  const uniqueUsers = [...new Set(loadingData.map(d => d.userId).sort((a,b) => a - b))];

  let pair = {};
  uniqueUsers.forEach(u => {
    const history = loadingData.filter(d => d.userId == u);

    let delays = [];
    // take a pair of requests and count how many times the pattern appears
    history.forEach((h, i) => {
      if (i < history.length -1) {
        const pairKey = h.url + ' - ' + history[i+1].url;
        // if it does not exist yet, initialize it
        if (!pair[pairKey]) {
          pair[pairKey] = {...PAIR_KEY_TEMPLATE};
          pair[pairKey].from = h.url;
          pair[pairKey].to = history[i+1].url;
          delays = [];
        }

        const currentDelay = (new Date(history[i+1].datetime) - new Date(h.datetime)) / 1000;
        delays.push(currentDelay); // keep the list of delays to compute values, but do not store the list values

        // increase the counter for this pattern
        pair[pairKey].count += 1;
        // if the URL is exactly the same, including the queryString, it counts as a page reload
        if (h.url == history[i+1].url && h.queryString == history[i+1].queryString) {
          pair[pairKey].reloadCount += 1;
        }
        pair[pairKey].averageDelay = Math.round(delays.reduce((a,b) => a+b) / delays.length, 0);
        pair[pairKey].maxDelay = Math.max.apply(Math, delays);
        pair[pairKey].minDelay = Math.min.apply(Math, delays);
      }
    });
  });

  // recreate the object after sorting them by count
  return Object.keys(pair)
    .sort((a,b) => pair[b].count - pair[a].count)
    .map(k => pair[k]);
}
/** PATTERN LOGIC START */

/*
 * end of core logic
 */

// parse the JSON data into an object
function analyzeData(inputFile, data) {
  const urlCount = countLoadingUrl(data);
  // save the urlCount data
  Fs.writeFile(inputFile + '-url-count.json', JSON.stringify(urlCount, null, 2), 'utf8', () => {});

  const patternCount = countLoadingPatterns(data);
  // save the patternCount data
  Fs.writeFile(inputFile + '-pattern-count.json', JSON.stringify(patternCount, null, 2), 'utf8', () => {});
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
function normalizeData(line) {
  var valuesPattern = /.*FrontendLogController - \[(\d*\w*)*\] - \[(.*)\] - (\w*) `(.*)`/g;
  if (line.match(valuesPattern)) {
    var normalizedObject = new LogLineObject(
      line.replace(valuesPattern, '$1'),
      line.replace(valuesPattern, '$2'),
      line.replace(valuesPattern, '$3'),
      line.replace(valuesPattern, '$4').split('?')[0] // drop the QueryString slice from the URL
        .replace(/https?:\/\/[^\/]*/g, ''), // drop the name of the server
      line.replace(valuesPattern, '$4').split('?')[1], // keep the QueryString slice only
    );
    return normalizedObject;
  }
  return null;
}

// process the log file passed through args
function processFile(inputFile) {
  var data = [];

  const instream = Fs.createReadStream(inputFile);
  const outstream = new (Stream)();
  const rl = Readline.createInterface(instream, outstream);

  rl.on('line', function (line) {
    if (line && line != null) {
      const normalizedLine = normalizeData(line);
      if (normalizedLine) {
        data.push(normalizedLine);
      }
    }
  });

  rl.on('close', function (line) {
    if (line && line != null) {
      const normalizedLine = normalizeData(line);
      if (normalizedLine) {
        data.push(normalizedLine);
      }
    }
    // save the normalized data
    Fs.writeFile(inputFile + '-normalized.json', JSON.stringify(data, null, 2), 'utf8', () => {});
    analyzeData(inputFile, data);
  });
}
processFile(process.argv[2]);
