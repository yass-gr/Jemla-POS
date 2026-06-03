const http = require('http');

http.get('http://localhost:3001/api/products', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const products = JSON.parse(data);
    console.log('\n=== API Product Check ===\n');
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
      }
    } else {
      console.log('❌ No products returned from API');
    }
    console.log('');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  console.log('\n⚠️  Server might not be running. Start it with: cd server && npm start');
});
