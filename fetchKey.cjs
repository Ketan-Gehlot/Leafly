const https = require('https');

https.get('https://leafly-gamma.vercel.app', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Extract JS files
    const jsFiles = [...data.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    
    jsFiles.forEach(file => {
      const url = file.startsWith('http') ? file : 'https://leafly-gamma.vercel.app' + file;
      https.get(url, (res2) => {
        let jsData = '';
        res2.on('data', chunk => jsData += chunk);
        res2.on('end', () => {
          const match = jsData.match(/pk_live_[A-Za-z0-9_-]+/);
          if (match) {
            console.log('FOUND KEY:', match[0]);
          }
        });
      });
    });
  });
});
