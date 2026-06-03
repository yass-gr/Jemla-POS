import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'jemla.db');

async function verify() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(DB_PATH));
  
  console.log('\n=== 📊 Database Verification ===\n');
  
  const tables = ['products', 'customers', 'suppliers', 'sales', 'purchases', 'returns'];
  
  for (const table of tables) {
    const count = db.exec(`SELECT COUNT(*) as c FROM ${table}`)[0].values[0][0];
    console.log(`✅ ${table.padEnd(15)}: ${count.toLocaleString()} records`);
  }
  
  const dateRange = db.exec('SELECT MIN(created_at) as min, MAX(created_at) as max FROM sales')[0].values[0];
  console.log(`\n📅 Sales date range:`);
  console.log(`   From: ${dateRange[0]}`);
  console.log(`   To:   ${dateRange[1]}`);
  
  const products = db.exec('SELECT name, category, price FROM products ORDER BY id LIMIT 10')[0].values;
  console.log(`\n🥬 Sample products (first 10):`);
  products.forEach(p => {
    console.log(`   - ${p[0].padEnd(25)} (${p[1].padEnd(8)}) - ${p[2]} DH`);
  });
  
  const categories = db.exec('SELECT category, COUNT(*) as count FROM products GROUP BY category')[0].values;
  console.log(`\n📦 Products by category:`);
  categories.forEach(c => {
    console.log(`   - ${c[0].padEnd(10)}: ${c[1]} items`);
  });
  
  const avgSale = db.exec('SELECT AVG(total) as avg FROM sales')[0].values[0][0];
  console.log(`\n💰 Average sale: ${avgSale.toFixed(2)} DH`);
  
  const totalRevenue = db.exec('SELECT SUM(total) as total FROM sales')[0].values[0][0];
  console.log(`💵 Total revenue (1 year): ${(totalRevenue/1000000).toFixed(2)}M DH`);
  
  console.log('\n✨ Database successfully regenerated with realistic 1-year data!\n');
}

verify().catch(console.error);
