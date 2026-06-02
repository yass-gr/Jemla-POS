import initSqlJs from 'sql.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'jemla.db');

const IMG = 'https://images.unsplash.com/photo-';
const IMG_SUFFIX = '?w=200&h=200&fit=crop&auto=format';

const products = [
  { name: 'Tomate', category: 'Légumes', price: 8, unit: 'kg', stock: 200, image_url: `${IMG}1531730802399-67fca7529b13${IMG_SUFFIX}` },
  { name: 'Pomme de terre', category: 'Légumes', price: 5, unit: 'kg', stock: 300, image_url: `${IMG}1760368104765-f0441f4f4d6c${IMG_SUFFIX}` },
  { name: 'Oignon', category: 'Légumes', price: 4, unit: 'kg', stock: 250, image_url: `${IMG}1755406050322-36c15e00c6d3${IMG_SUFFIX}` },
  { name: 'Carotte', category: 'Légumes', price: 6, unit: 'kg', stock: 180, image_url: `${IMG}1474440692490-2e83ae13ba29${IMG_SUFFIX}` },
  { name: 'Banane', category: 'Fruits', price: 12, unit: 'kg', stock: 150, image_url: `${IMG}1774983882471-abcf681085cc${IMG_SUFFIX}` },
  { name: 'Pomme', category: 'Fruits', price: 14, unit: 'kg', stock: 120, image_url: `${IMG}1693036530117-4b63e22ea9de${IMG_SUFFIX}` },
  { name: 'Orange', category: 'Fruits', price: 8, unit: 'kg', stock: 200, image_url: `${IMG}1757807196804-2c9b1a66f3a3${IMG_SUFFIX}` },
  { name: 'Fraise', category: 'Fruits', price: 25, unit: 'kg', stock: 40, image_url: `${IMG}1713715980823-7118c048c79c${IMG_SUFFIX}` },
  { name: 'Chou', category: 'Légumes', price: 5, unit: 'pièce', stock: 60, image_url: `${IMG}1779738192854-92a3daec9b45${IMG_SUFFIX}` },
  { name: 'Laitue', category: 'Légumes', price: 3, unit: 'pièce', stock: 80, image_url: `${IMG}1477434779629-a454c123dcd3${IMG_SUFFIX}` },
  { name: 'Poivron vert', category: 'Légumes', price: 10, unit: 'kg', stock: 90, image_url: `${IMG}1505692794401-b371fa865622${IMG_SUFFIX}` },
  { name: 'Courgette', category: 'Légumes', price: 8, unit: 'kg', stock: 100, image_url: `${IMG}1757332051150-a5b3c4510af8${IMG_SUFFIX}` },
  { name: 'Aubergine', category: 'Légumes', price: 7, unit: 'kg', stock: 70, image_url: `${IMG}1780331617758-304c32bc2006${IMG_SUFFIX}` },
  { name: 'Raisin', category: 'Fruits', price: 20, unit: 'kg', stock: 35, image_url: `${IMG}1769889670620-a73b64e38d33${IMG_SUFFIX}` },
  { name: 'Pastèque', category: 'Fruits', price: 4, unit: 'kg', stock: 50, image_url: `${IMG}1767747484833-8e9d4f88fe69${IMG_SUFFIX}` },
  { name: 'Melon', category: 'Fruits', price: 7, unit: 'kg', stock: 45, image_url: `${IMG}1775326715451-16ea5a3d59bf${IMG_SUFFIX}` },
  { name: 'Haricots verts', category: 'Légumes', price: 12, unit: 'kg', stock: 40, image_url: `${IMG}1768729341107-4ec2a7807a70${IMG_SUFFIX}` },
  { name: 'Petits pois', category: 'Légumes', price: 15, unit: 'kg', stock: 30, image_url: `${IMG}1741518359695-bc91a1fab4ae${IMG_SUFFIX}` },
  { name: 'Navet', category: 'Légumes', price: 5, unit: 'kg', stock: 65, image_url: `${IMG}1561270168-df3704f232c3${IMG_SUFFIX}` },
  { name: 'Ail', category: 'Légumes', price: 30, unit: 'kg', stock: 25, image_url: `${IMG}1776722203199-83cdae0092a0${IMG_SUFFIX}` },
  { name: 'Citron', category: 'Fruits', price: 10, unit: 'kg', stock: 85, image_url: `${IMG}1746981422898-28e48d7a905c${IMG_SUFFIX}` },
  { name: 'Dattes', category: 'Fruits', price: 40, unit: 'kg', stock: 20, image_url: `${IMG}1769255484739-3437edbb858e${IMG_SUFFIX}` },
  { name: 'Figues', category: 'Fruits', price: 35, unit: 'kg', stock: 15, image_url: `${IMG}1758614256427-580827e20f40${IMG_SUFFIX}` },
  { name: 'Avocat', category: 'Fruits', price: 20, unit: 'pièce', stock: 55, image_url: `${IMG}1702105705586-c951ddade811${IMG_SUFFIX}` },
  { name: 'Patate douce', category: 'Légumes', price: 8, unit: 'kg', stock: 60, image_url: `${IMG}1771340224790-9a8cc4a9a24a${IMG_SUFFIX}` },
];

const suppliers = [
  { name: 'Marché de Gros Casablanca', phone: '+212 5 22 30 10 20', email: 'gros.casa@email.ma', address: 'Marché de Gros, Casablanca' },
  { name: 'Ferme Agadir Bio', phone: '+212 5 28 21 33 44', email: 'contact@agadirbio.ma', address: 'Route de Taroudant, Agadir' },
  { name: 'Coopérative Meknès', phone: '+212 5 35 53 22 11', email: 'coop.meknes@email.ma', address: 'Avenue des FAR, Meknès' },
  { name: 'Import Fruits Tanger', phone: '+212 5 39 94 55 66', email: 'import.tanger@email.ma', address: 'Port de Tanger Med' },
  { name: 'Producteur Local Marrakech', phone: '+212 5 24 44 77 88', email: 'local.marrakech@email.ma', address: 'Route de l\'Ourika, Marrakech' },
];

const customers = [
  { name: 'Hamid El Fassi', phone: '+212 6 61 23 45 67', email: 'hamid.elfassi@email.ma', address: '12 Rue de la Liberté, Casablanca', debt: 4500 },
  { name: 'Fatima Benali', phone: '+212 6 62 34 56 78', email: 'fatima.benali@email.ma', address: '45 Avenue Hassan II, Rabat', debt: 0 },
  { name: 'Mohamed Ouazzani', phone: '+212 6 63 45 67 89', email: 'm.ouazzani@email.ma', address: '8 Rue Mohammed V, Marrakech', debt: 2200 },
  { name: 'Aicha Lahlou', phone: '+212 6 64 56 78 90', email: 'aicha.lahlou@email.ma', address: '22 Boulevard Zerktouni, Fès', debt: 780 },
  { name: 'Hassan Tazi', phone: '+212 6 65 67 89 01', email: 'hassan.tazi@email.ma', address: '3 Rue Al Qods, Tanger', debt: 3200 },
  { name: 'Karima Idrissi', phone: '+212 6 66 78 90 12', email: 'karima.idrissi@email.ma', address: '17 Rue Oued Eddahab, Agadir', debt: 0 },
  { name: 'Youssef Belmahi', phone: '+212 6 67 89 01 23', email: 'youssef.belmahi@email.ma', address: '55 Rue Atlas, Meknès', debt: 1500 },
  { name: 'Nadia El Amrani', phone: '+212 6 68 90 12 34', email: 'nadia.elamrani@email.ma', address: '9 Rue Yacoub El Mansour, Oujda', debt: 600 },
  { name: 'Rachid Bennani', phone: '+212 6 69 01 23 45', email: 'rachid.bennani@email.ma', address: '31 Rue Ibn Sina, Tétouan', debt: 8900 },
  { name: 'Salma Benjelloun', phone: '+212 6 70 12 34 56', email: 'salma.benjelloun@email.ma', address: '14 Rue Al Andalous, El Jadida', debt: 0 },
];

let db = null;

function exec(sql, params = []) { return db.run(sql, params); }
function all(sql, params = []) {
  if (params.length) { const s = db.prepare(sql); s.bind(params); const r = []; while (s.step()) r.push(s.getAsObject()); s.free(); return r; }
  const result = db.exec(sql);
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => { const o = {}; cols.forEach((c, i) => o[c] = row[i]); return o; });
}
function one(sql, params = []) { const r = all(sql, params); return r.length ? r[0] : null; }
function lastId() { return db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]; }

function createTables() {
  exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT \'cashier\' CHECK(role IN (\'admin\', \'cashier\')), created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, unit TEXT NOT NULL, stock REAL NOT NULL DEFAULT 0, image_url TEXT, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, debt_balance REAL NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER REFERENCES customers(id), user_id INTEGER NOT NULL REFERENCES users(id), total REAL NOT NULL, tax REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT \'completed\' CHECK(status IN (\'completed\', \'held\', \'cancelled\')), created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS sale_items (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), product_name TEXT NOT NULL, price REAL NOT NULL, qty REAL NOT NULL, unit TEXT NOT NULL)');
  exec('CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id), supplier TEXT, qty REAL NOT NULL, unit_price REAL NOT NULL, total REAL NOT NULL, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS returns (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER REFERENCES sales(id), product_id INTEGER NOT NULL REFERENCES products(id), qty REAL NOT NULL, reason TEXT, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS inventory_log (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id), change_qty REAL NOT NULL, reason TEXT NOT NULL, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, amount REAL NOT NULL, category TEXT, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS product_favorites (user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id), PRIMARY KEY (user_id, product_id))');
}

async function seed() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs();
  db = new SQL.Database();
  db.run('PRAGMA foreign_keys=ON');
  createTables();

  const hash = bcrypt.hashSync('admin123', 10);
  exec('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', ['admin', hash, 'Admin', 'admin']);
  const cashierHash = bcrypt.hashSync('cashier123', 10);
  exec('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', ['cashier', cashierHash, 'Cashier', 'cashier']);

  for (const p of products) {
    exec('INSERT INTO products (name, category, price, unit, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [p.name, p.category, p.price, p.unit, p.stock, p.image_url || null]);
  }

  const customerIds = [];
  for (const c of customers) {
    exec('INSERT INTO customers (name, phone, email, address, debt_balance) VALUES (?, ?, ?, ?, ?)',
      [c.name, c.phone, c.email, c.address, c.debt]);
    customerIds.push(lastId());
  }

  const supplierIds = [];
  for (const s of suppliers) {
    exec('INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [s.name, s.phone, s.email, s.address]);
    supplierIds.push(lastId());
  }

  const nowPurch = new Date();
  for (const p of all('SELECT id, price, stock FROM products')) {
    const purchaseQty = p.stock + Math.floor(Math.random() * 50);
    const unitPrice = Math.round(p.price * 0.6 * 100) / 100;
    const purchDate = new Date(nowPurch);
    purchDate.setDate(purchDate.getDate() - 20 - Math.floor(Math.random() * 10));
    purchDate.setHours(6, 0, 0, 0);
    exec('INSERT INTO purchases (product_id, supplier, qty, unit_price, total, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [p.id, suppliers[Math.floor(Math.random() * suppliers.length)].name,
       purchaseQty, unitPrice, Math.round(purchaseQty * unitPrice * 100) / 100,
       purchDate.toISOString().slice(0, 19).replace('T', ' ')]);
  }

  const allProducts = all('SELECT id, price FROM products');
  const now = new Date();

  for (let day = 14; day >= 0; day--) {
    const salesCount = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < salesCount; i++) {
      const customerId = Math.random() > 0.3 ? customerIds[Math.floor(Math.random() * customerIds.length)] : null;
      const saleDate = new Date(now);
      saleDate.setDate(saleDate.getDate() - day);
      saleDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
      const dateStr = saleDate.toISOString().slice(0, 19).replace('T', ' ');

      const itemCount = 1 + Math.floor(Math.random() * 4);
      let total = 0;
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        const qty = 0.5 + Math.floor(Math.random() * 10) / 2;
        const price = product.price + (Math.random() > 0.5 ? 2 : -2);
        items.push({ product_id: product.id, price: Math.max(price, 1), qty });
        total += price * qty;
      }

      exec('INSERT INTO sales (customer_id, user_id, total, tax, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, 1, Math.round(total * 100) / 100, Math.round(total * 0.05 * 100) / 100, 'completed', dateStr]);
      const saleId = lastId();

      for (const item of items) {
        const productRow = one('SELECT name, unit FROM products WHERE id = ?', [item.product_id]);
        exec('INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit) VALUES (?, ?, ?, ?, ?, ?)',
          [saleId, item.product_id, productRow.name, item.price, item.qty, productRow.unit]);
      }
    }
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  console.log('Seed complete!');
  console.log(`  - 2 users (admin/admin123, cashier/cashier123)`);
  console.log(`  - ${products.length} products`);
  console.log(`  - ${customers.length} customers`);
  console.log(`  - ${suppliers.length} suppliers`);
  console.log(`  - ${all('SELECT COUNT(*) as c FROM purchases')[0].c} purchases`);
  console.log(`  - ~70 sales over 15 days`);
}

seed().catch(console.error);
