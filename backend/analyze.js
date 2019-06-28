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
  const uniqueUsers = [...new Set(loadingData.map(d => d.userId))];
  let groupDataByUser = [];
  uniqueUsers.forEach(u => {
    var o = {};
    o[u] = loadingData.filter(d => d.userId == u);
    groupDataByUser.push(o);
  });
  return groupDataByUser;
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

