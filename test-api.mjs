import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('\n=== ✅ API Product Check ===\n');
      console.log(`Total products from API: ${products.length}\n`);
      
      if (products.length > 0) {
        console.log('First 15 products:');
        products.slice(0, 15).forEach((p, i) => {
          console.log(`  ${i+1}. ${p.name.padEnd(25)} | ${p.category.padEnd(8)} | ${p.price} DH`);
        });
        
        const categories = {};
        products.forEach(p => {
          categories[p.category] = (categories[p.category] || 0) + 1;
        });
        
        console.log('\nProducts by category:');
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count}`);
        });
        
        if (products.length === 62) {
          console.log('\n✅ SUCCESS! Database has been updated with all 62 products!');
        } else {
          console.log(`\n⚠️  Expected 62 products, got ${products.length}`);
          console.log('💡 The server might need to be restarted to load the new database.');
        }
      } else {
        console.log('❌ No products returned from API');
      }
      console.log('');
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error connecting to server:', err.message);
  console.log('\n💡 Server might not be running. Start it with:');
  console.log('   cd server && npm start\n');
});

req.end();
