const Fs = require("fs");

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

// core analysis logic
function countLoadingUrl(data) {
  const loadingUrl = data.filter(d => d.action == 'Loading').map(u => u.url);

  let uniqueUrl = [...new Set(loadingUrl)];

  // count how many times a URL has been 'loaded'
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

// parse the JSON file into an object
function parseData(inputFile) {
  const urlCount = countLoadingUrl(JSON.parse(Fs.readFileSync(inputFile)));
  // save the urlCount data
  Fs.writeFile(inputFile + '-url-count.json', JSON.stringify(urlCount, null, 2), 'utf8', () => {});
}
parseData(process.argv[2]);

