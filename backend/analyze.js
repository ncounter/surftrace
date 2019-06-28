const Fs = require("fs");

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

/* core analysis logic */

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
function countUrlPatterns(data) {
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

/* end of core logic */


// parse the JSON file into an object
function parseData(inputFile) {
  const dataFromFile = JSON.parse(Fs.readFileSync(inputFile));

  const urlCount = countLoadingUrl(dataFromFile);
  // save the urlCount data
  Fs.writeFile(inputFile + '-url-count.json', JSON.stringify(urlCount, null, 2), 'utf8', () => {});

  const patternCount = countUrlPatterns(dataFromFile);
  // save the urlCount data
  Fs.writeFile(inputFile + '-pattern-count.json', JSON.stringify(patternCount, null, 2), 'utf8', () => {});
}
parseData(process.argv[2]);

