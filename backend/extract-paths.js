const Fs = require('fs');
const XmlParser = require('xml2json');

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

Fs.readFile(process.argv[2], function(err, data) {
  const xmlObj = XmlParser.toJson(data, {reversible: true, object: true});
  const actionMappings = xmlObj["struts-config"]["action-mappings"]["action"];
  let normalizedData = [];
  actionMappings.forEach(element => {
    const o = new Object();
    o["url"] = element.path;
    o["jsp"] = element.input;
    o["javaAction"] = element.type;

    // extract forwards
    if (element.forward) {
      o["jspForwards"] = [];
      switch (typeof(element.forward)) {
        case "string": o.jspForwards.push(element.forward); break;      
        case "object":
          if (element.forward.length > 1) {
            Object.values(element.forward).forEach(f => {
              // don't add duplicates
              if (!o.jspForwards.includes(f.path)) {
                o.jspForwards.push(f.path);
              }
            });
          }
          else {
            o.jspForwards.push(element.forward.path);
          }
        break;
        default: console.log("ERROR: forward pat not decoded for " + JSON.stringify(element));
      }
    }
    normalizedData.push(o);
  });
  normalizedData = normalizedData.sort((a,b) => a.url.localeCompare(b.url));

  Fs.writeFile(process.argv[2] + '-normalized.json', JSON.stringify(normalizedData, null, 2), 'utf8', () => {});
})
