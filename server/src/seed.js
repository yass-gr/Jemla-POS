import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'jemla.db');

const img = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop`;

const products = [
  {name:'Tomate',cat:'Légumes',price:6,unit:'kg',stock:500,barcode:'6111000000001',pw:4.5,wmq:20,img:img(29479888)},
  {name:'Pomme de terre',cat:'Légumes',price:4,unit:'kg',stock:800,barcode:'6111000000002',pw:2.8,wmq:25,img:img(36400786)},
  {name:'Oignon',cat:'Légumes',price:3.5,unit:'kg',stock:600,barcode:'6111000000003',pw:2.2,wmq:30,img:img(17140078)},
  {name:'Carotte',cat:'Légumes',price:5,unit:'kg',stock:450,barcode:'6111000000004',pw:3.5,wmq:20,img:img(38277655)},
  {name:'Courgette',cat:'Légumes',price:7,unit:'kg',stock:350,barcode:'6111000000005',pw:5,wmq:15,img:img(12955936)},
  {name:'Aubergine',cat:'Légumes',price:6.5,unit:'kg',stock:300,barcode:'6111000000006',pw:4.5,wmq:15,img:img(34096648)},
  {name:'Poivron vert',cat:'Légumes',price:9,unit:'kg',stock:280,barcode:'6111000000007',pw:6.5,wmq:12,img:img(18640811)},
  {name:'Poivron rouge',cat:'Légumes',price:12,unit:'kg',stock:250,barcode:'6111000000008',pw:8.5,wmq:12,img:img(18640811)},
  {name:'Chou vert',cat:'Légumes',price:4,unit:'kg',stock:400,barcode:'6111000000009',pw:2.8,wmq:20,img:img(6316537)},
  {name:'Chou rouge',cat:'Légumes',price:5,unit:'kg',stock:350,barcode:'6111000000010',pw:3.5,wmq:20,img:img(6316537)},
  {name:'Laitue',cat:'Légumes',price:2.5,unit:'kg',stock:500,barcode:'6111000000011',pw:1.8,wmq:25,img:img(28524414)},
  {name:'Épinard',cat:'Légumes',price:5,unit:'kg',stock:250,barcode:'6111000000012',pw:3.5,wmq:15,img:img(38571502)},
  {name:'Brocoli',cat:'Légumes',price:10,unit:'kg',stock:200,barcode:'6111000000013',pw:7,wmq:10,img:img(7676071)},
  {name:'Chou-fleur',cat:'Légumes',price:8,unit:'kg',stock:220,barcode:'6111000000014',pw:5.5,wmq:12,img:img(6631953)},
  {name:'Navet',cat:'Légumes',price:4,unit:'kg',stock:300,barcode:'6111000000015',pw:2.8,wmq:20,img:img(19689765)},
  {name:'Radis',cat:'Légumes',price:3,unit:'kg',stock:350,barcode:'6111000000016',pw:2,wmq:25,img:img(19689765)},
  {name:'Céleri',cat:'Légumes',price:6,unit:'kg',stock:180,barcode:'6111000000017',pw:4.2,wmq:12,img:img(8805230)},
  {name:'Persil',cat:'Légumes',price:4,unit:'kg',stock:400,barcode:'6111000000018',pw:2.8,wmq:20,img:img(6102658)},
  {name:'Coriandre',cat:'Légumes',price:5,unit:'kg',stock:350,barcode:'6111000000019',pw:3.5,wmq:15,img:img(6102658)},
  {name:'Menthe',cat:'Légumes',price:6,unit:'kg',stock:300,barcode:'6111000000020',pw:4.2,wmq:15,img:img(13632808)},
  {name:'Ail',cat:'Légumes',price:28,unit:'kg',stock:150,barcode:'6111000000021',pw:20,wmq:5,img:img(6576763)},
  {name:'Gingembre',cat:'Légumes',price:35,unit:'kg',stock:100,barcode:'6111000000022',pw:25,wmq:5,img:img(6576763)},
  {name:'Patate douce',cat:'Légumes',price:7,unit:'kg',stock:350,barcode:'6111000000023',pw:5,wmq:15,img:img(36400786)},
  {name:'Betterave',cat:'Légumes',price:5,unit:'kg',stock:280,barcode:'6111000000024',pw:3.5,wmq:15,img:img(33893317)},
  {name:'Concombre',cat:'Légumes',price:5,unit:'kg',stock:450,barcode:'6111000000025',pw:3.5,wmq:20,img:img(36727531)},
  {name:'Haricots verts',cat:'Légumes',price:11,unit:'kg',stock:250,barcode:'6111000000026',pw:8,wmq:10,img:img(35553036)},
  {name:'Petits pois',cat:'Légumes',price:14,unit:'kg',stock:200,barcode:'6111000000027',pw:10,wmq:10,img:img(35553036)},
  {name:'Fèves fraîches',cat:'Légumes',price:8,unit:'kg',stock:220,barcode:'6111000000028',pw:5.5,wmq:12,img:img(35553036)},
  {name:'Artichaut',cat:'Légumes',price:9,unit:'kg',stock:180,barcode:'6111000000029',pw:6.5,wmq:10,img:img(34096648)},
  {name:'Asperges',cat:'Légumes',price:25,unit:'kg',stock:80,barcode:'6111000000030',pw:18,wmq:5,img:img(8805230)},
  {name:'Orange Navel',cat:'Fruits',price:7,unit:'kg',stock:600,barcode:'6111000000031',pw:5,wmq:25,img:img(38322939)},
  {name:'Orange Sanguine',cat:'Fruits',price:9,unit:'kg',stock:400,barcode:'6111000000032',pw:6.5,wmq:20,img:img(38322939)},
  {name:'Clémentine',cat:'Fruits',price:10,unit:'kg',stock:500,barcode:'6111000000033',pw:7,wmq:20,img:img(38322939)},
  {name:'Mandarine',cat:'Fruits',price:11,unit:'kg',stock:450,barcode:'6111000000034',pw:8,wmq:20,img:img(38322939)},
  {name:'Citron',cat:'Fruits',price:9,unit:'kg',stock:550,barcode:'6111000000035',pw:6.5,wmq:20,img:img(11295023)},
  {name:'Pamplemousse',cat:'Fruits',price:8,unit:'kg',stock:300,barcode:'6111000000036',pw:5.5,wmq:15,img:img(38322939)},
  {name:'Fraise',cat:'Fruits',price:22,unit:'kg',stock:200,barcode:'6111000000037',pw:16,wmq:8,img:img(1998893)},
  {name:'Cerise',cat:'Fruits',price:35,unit:'kg',stock:120,barcode:'6111000000038',pw:25,wmq:5,img:img(30884397)},
  {name:'Pêche',cat:'Fruits',price:16,unit:'kg',stock:280,barcode:'6111000000039',pw:11,wmq:10,img:img(9306017)},
  {name:'Abricot',cat:'Fruits',price:18,unit:'kg',stock:250,barcode:'6111000000040',pw:13,wmq:10,img:img(38096496)},
  {name:'Prune',cat:'Fruits',price:14,unit:'kg',stock:300,barcode:'6111000000041',pw:10,wmq:12,img:img(9306017)},
  {name:'Nectarine',cat:'Fruits',price:17,unit:'kg',stock:260,barcode:'6111000000042',pw:12,wmq:10,img:img(9306017)},
  {name:'Pastèque',cat:'Fruits',price:3.5,unit:'kg',stock:800,barcode:'6111000000043',pw:2.5,wmq:30,img:img(1591183)},
  {name:'Melon Cantaloup',cat:'Fruits',price:6,unit:'kg',stock:400,barcode:'6111000000044',pw:4.2,wmq:15,img:img(7657263)},
  {name:'Melon Vert',cat:'Fruits',price:7,unit:'kg',stock:350,barcode:'6111000000045',pw:5,wmq:15,img:img(7657263)},
  {name:'Banane',cat:'Fruits',price:11,unit:'kg',stock:700,barcode:'6111000000046',pw:8,wmq:25,img:img(37182860)},
  {name:'Ananas',cat:'Fruits',price:15,unit:'kg',stock:250,barcode:'6111000000047',pw:11,wmq:10,img:img(37284807)},
  {name:'Mangue',cat:'Fruits',price:28,unit:'kg',stock:150,barcode:'6111000000048',pw:20,wmq:8,img:img(19087708)},
  {name:'Avocat',cat:'Fruits',price:18,unit:'kg',stock:300,barcode:'6111000000049',pw:13,wmq:10,img:img(27462724)},
  {name:'Kiwi',cat:'Fruits',price:16,unit:'kg',stock:280,barcode:'6111000000050',pw:11,wmq:10,img:img(7675953)},
  {name:'Pomme Golden',cat:'Fruits',price:12,unit:'kg',stock:500,barcode:'6111000000051',pw:8.5,wmq:20,img:img(28710026)},
  {name:'Pomme Gala',cat:'Fruits',price:13,unit:'kg',stock:480,barcode:'6111000000052',pw:9,wmq:20,img:img(28710026)},
  {name:'Pomme Granny Smith',cat:'Fruits',price:14,unit:'kg',stock:450,barcode:'6111000000053',pw:10,wmq:20,img:img(28710026)},
  {name:'Poire Williams',cat:'Fruits',price:15,unit:'kg',stock:350,barcode:'6111000000054',pw:11,wmq:15,img:img(31024470)},
  {name:'Poire Conference',cat:'Fruits',price:14,unit:'kg',stock:380,barcode:'6111000000055',pw:10,wmq:15,img:img(31024470)},
  {name:'Raisin Noir',cat:'Fruits',price:18,unit:'kg',stock:300,barcode:'6111000000056',pw:13,wmq:10,img:img(10922960)},
  {name:'Raisin Blanc',cat:'Fruits',price:19,unit:'kg',stock:280,barcode:'6111000000057',pw:14,wmq:10,img:img(10922960)},
  {name:'Raisin Rouge',cat:'Fruits',price:20,unit:'kg',stock:260,barcode:'6111000000058',pw:14.5,wmq:10,img:img(10922960)},
  {name:'Grenade',cat:'Fruits',price:12,unit:'kg',stock:350,barcode:'6111000000059',pw:8.5,wmq:15,img:img(12148143)},
  {name:'Figues fraîches',cat:'Fruits',price:32,unit:'kg',stock:100,barcode:'6111000000060',pw:23,wmq:5,img:img(28160702)},
  {name:'Dattes Deglet Nour',cat:'Fruits',price:45,unit:'kg',stock:180,barcode:'6111000000061',pw:32,wmq:5,img:img(17877978)},
  {name:'Coing',cat:'Fruits',price:10,unit:'kg',stock:200,barcode:'6111000000062',pw:7,wmq:10,img:img(28710026)},
];

const suppliers = [
  {name:'Marché de Gros Casablanca',phone:'+212 5 22 30 10 20',email:'contact@groscasa.ma',address:'Boulevard Bir Anzarane, Casablanca'},
  {name:'Coopérative Agricole Agadir',phone:'+212 5 28 21 33 44',email:'coop@agadir-agricole.ma',address:'Zone Agricole, Agadir'},
  {name:'Producteurs Meknès',phone:'+212 5 35 53 22 11',email:'producteurs@meknes.ma',address:'Route Fès, Meknès'},
  {name:'Import Export Tanger',phone:'+212 5 39 94 55 66',email:'import@tanger-med.ma',address:'Port Tanger Med, Tanger'},
  {name:'Ferme Bio Marrakech',phone:'+212 5 24 44 77 88',email:'bio@marrakech-ferme.ma',address:'Route Ourika, Marrakech'},
  {name:'Souk Hebdomadaire Beni Mellal',phone:'+212 5 23 48 99 00',email:'souk@benimellal.ma',address:'Souk El Had, Beni Mellal'},
  {name:'Coopérative Berkane',phone:'+212 5 36 61 22 33',email:'coop@berkane.ma',address:'Centre Ville, Berkane'},
  {name:'Producteurs Gharb',phone:'+212 5 37 25 44 55',email:'gharb@producteurs.ma',address:'Kenitra, Gharb'},
];

const customers = [
  {name:'Épicerie Al Baraka',phone:'+212 6 61 23 45 67',email:'albaraka@email.ma',address:'Hay Mohammadi, Casablanca'},
  {name:'Primeur Fatima',phone:'+212 6 62 34 56 78',email:'fatima.primeur@email.ma',address:'Derb Sultan, Casablanca'},
  {name:'Restaurant Dar Tajine',phone:'+212 6 63 45 67 89',email:'contact@dartajine.ma',address:'Medina, Marrakech'},
  {name:'Hôtel Riad Atlas',phone:'+212 6 64 56 78 90',email:'riad.atlas@email.ma',address:'Guéliz, Marrakech'},
  {name:'Supermarché Marjane',phone:'+212 6 65 67 89 01',email:'marjane.local@email.ma',address:'Maarif, Rabat'},
  {name:'Traiteur Le Gourmet',phone:'+212 6 66 78 90 12',email:'legourmet@email.ma',address:'Agdal, Rabat'},
  {name:'Épicerie Ibn Sina',phone:'+212 6 67 89 01 23',email:'ibnsina@email.ma',address:'Ville Nouvelle, Fès'},
  {name:'Primeur Hassan II',phone:'+212 6 68 90 12 34',email:'hassan2.primeur@email.ma',address:'Borough, Fès'},
  {name:'Restaurant La Marina',phone:'+212 6 69 01 23 45',email:'lamarina@email.ma',address:'Port, Agadir'},
  {name:'Hôtel Sofitel',phone:'+212 6 70 12 34 56',email:'sofitel.tanger@email.ma',address:'Corniche, Tanger'},
  {name:'Épicerie Al Wifaq',phone:'+212 6 71 23 45 67',email:'alwifaq@email.ma',address:'Hay Salam, Meknès'},
  {name:'Primeur Najah',phone:'+212 6 72 34 56 78',email:'najah.primeur@email.ma',address:'Hamria, Meknès'},
  {name:'Cantine Scolaire Lycée',phone:'+212 6 73 45 67 89',email:'lycee.cantine@email.ma',address:'Centre, Oujda'},
  {name:'Restaurant Al Mounia',phone:'+212 6 74 56 78 90',email:'almounia@email.ma',address:'Medina, Fès'},
  {name:'Superette Carrefour',phone:'+212 6 75 67 89 01',email:'carrefour.local@email.ma',address:'Sidi Maarouf, Casablanca'},
  {name:'Traiteur Saveurs du Maroc',phone:'+212 6 76 78 90 12',email:'saveurs@email.ma',address:'Ocean, Rabat'},
  {name:'Épicerie Al Amal',phone:'+212 6 77 89 01 23',email:'alamal@email.ma',address:'Hay Nahda, Tétouan'},
  {name:'Primeur Boughaz',phone:'+212 6 78 90 12 34',email:'boughaz@email.ma',address:'Souani, Tétouan'},
  {name:'Restaurant Dar Zaki',phone:'+212 6 79 01 23 45',email:'darzaki@email.ma',address:'Kasbah, Tanger'},
  {name:'Hôtel Kenzi Tower',phone:'+212 6 80 12 34 56',email:'kenzi@email.ma',address:'Twin Center, Casablanca'},
];

const paymentMethods = ['cash','card','transfer','credit','check'];
const reasons = ['Produit abîmé','Mauvaise qualité','Trop mûr','Erreur de commande','Client insatisfait'];

let db;

function exec(sql, params = []) { return db.run(sql, params); }
function all(sql, params = []) {
  if (params.length) {
    const s = db.prepare(sql); s.bind(params);
    const r = []; while (s.step()) r.push(s.getAsObject());
    s.free(); return r;
  }
  const res = db.exec(sql);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => { const o = {}; cols.forEach((c,i) => o[c] = row[i]); return o; });
}
function one(sql, params = []) { const r = all(sql, params); return r.length ? r[0] : null; }
function lastId() { return db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]; }
function fmtDate(d) { return d.toISOString().slice(0,19).replace('T',' '); }
function rand(a,b) { return Math.random()*(b-a)+a; }
function randInt(a,b) { return Math.floor(rand(a,b+1)); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function getSeasonalMultiplier(month, category) {
  const winter = [11,0,1]; const spring = [2,3,4]; const summer = [5,6,7];
  if (category === 'Fruits') {
    if (summer.includes(month)) return 0.85;
    if (winter.includes(month)) return 1.25;
  }
  if (category === 'Légumes') {
    if (spring.includes(month)) return 0.80;
    if (winter.includes(month)) return 1.15;
  }
  return 1.0;
}

function createTables() {
  exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT \'cashier\' CHECK(role IN (\'admin\', \'cashier\')), created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, unit TEXT NOT NULL, stock REAL NOT NULL DEFAULT 0, image_url TEXT, barcode TEXT, price_wholesale REAL, wholesale_min_qty REAL DEFAULT 0, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, delivery_address TEXT, debt_balance REAL NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS customer_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER NOT NULL REFERENCES customers(id), amount REAL NOT NULL, payment_method TEXT NOT NULL, note TEXT, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  exec('CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER REFERENCES customers(id), user_id INTEGER NOT NULL REFERENCES users(id), total REAL NOT NULL, tax REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT \'completed\' CHECK(status IN (\'completed\',\'held\',\'cancelled\')), payment_method TEXT DEFAULT \'cash\', payment_status TEXT DEFAULT \'paid\', amount_paid REAL DEFAULT 0, change_due REAL DEFAULT 0, discount_total REAL DEFAULT 0, discount_note TEXT, note TEXT, delivery_address TEXT, delivery_date TEXT, delivery_status TEXT DEFAULT \'none\', delivery_fee REAL DEFAULT 0, delivered_to TEXT, created_at TEXT DEFAULT (datetime(\'now\')))');
  exec('CREATE TABLE IF NOT EXISTS sale_items (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), product_name TEXT NOT NULL, price REAL NOT NULL, qty REAL NOT NULL, unit TEXT NOT NULL, discount REAL DEFAULT 0, discount_type TEXT DEFAULT \'fixed\', note TEXT, original_price REAL, tax_rate REAL DEFAULT 0.05, tax_exempt INTEGER DEFAULT 0)');
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
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  db = new SQL.Database();
  db.run('PRAGMA foreign_keys=ON');
  db.run('PRAGMA journal_mode=WAL');
  createTables();

  const hash = bcrypt.hashSync('admin123', 10);
  exec('INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)', ['admin', hash, 'Admin', 'admin']);
  const cashierHash = bcrypt.hashSync('cashier123', 10);
  exec('INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)', ['cashier', cashierHash, 'Cashier', 'cashier']);

  for (const p of products) {
    exec('INSERT INTO products (name,category,price,unit,stock,image_url,barcode,price_wholesale,wholesale_min_qty) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.name, p.cat, p.price, p.unit, p.stock, p.img || null, p.barcode, p.pw, p.wmq]);
  }

  const allProducts = all('SELECT id, name, category, price, unit FROM products');
  const customerIds = [];
  for (const c of customers) {
    exec('INSERT INTO customers (name,phone,email,address,debt_balance) VALUES (?,?,?,?,0)', [c.name, c.phone, c.email, c.address]);
    customerIds.push(lastId());
  }

  const supplierIds = [];
  for (const s of suppliers) {
    exec('INSERT INTO suppliers (name,phone,email,address) VALUES (?,?,?,?)', [s.name, s.phone, s.email, s.address]);
    supplierIds.push(lastId());
  }

  const defaultSettings = [
    ['language','fr'],['currency','MAD'],['tax_rate','5'],['stock_threshold','10'],
    ['receipt_width','48'],['receipt_show_logo','true'],['receipt_show_tax','true'],
    ['pos_default_payment','cash'],['pos_default_customer',''],
  ];
  for (const [k,v] of defaultSettings) {
    exec('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)', [k, v]);
  }

  const now = new Date();
  let purchaseCount = 0;
  const DAYS = 90;
  for (let day = DAYS; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { if (Math.random() > 0.3) continue; }
    const numDeliveries = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numDeliveries; j++) {
      const d = new Date(date);
      d.setHours(5 + j * 3, Math.floor(Math.random() * 60), 0, 0);
      const month = d.getMonth();
      const numProducts = 5 + Math.floor(Math.random() * 11);
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      for (const product of shuffled.slice(0, numProducts)) {
        const sm = getSeasonalMultiplier(month, product.category);
        const unitPrice = Math.round(product.price * 0.6 * sm * 100) / 100;
        const qty = 50 + Math.floor(Math.random() * 200);
        exec('INSERT INTO purchases (product_id, supplier, qty, unit_price, total, created_at) VALUES (?,?,?,?,?,?)',
          [product.id, pick(suppliers).name, qty, unitPrice, Math.round(qty * unitPrice * 100) / 100, fmtDate(d)]);
        purchaseCount++;
      }
    }
  }
  let salesCount = 0, returnCount = 0;
  for (let day = DAYS; day >= 0; day--) {
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - day);
    const month = saleDate.getMonth();
    const dayOfWeek = saleDate.getDay();
    let baseSales = 15;
    if (dayOfWeek === 5) baseSales = 25;
    if (dayOfWeek === 6 || dayOfWeek === 0) baseSales = 10;
    if ([6,7,8].includes(month)) baseSales += 5;
    if ([11,0].includes(month)) baseSales += 8;
    const dailySales = baseSales + Math.floor(Math.random() * 10);

    for (let i = 0; i < dailySales; i++) {
      const hour = 7 + Math.floor(Math.random() * 13);
      const minute = Math.floor(Math.random() * 60);
      const sd = new Date(saleDate);
      sd.setHours(hour, minute, 0, 0);
      const dateStr = fmtDate(sd);

      const customerId = Math.random() > 0.4 ? pick(customerIds) : null;
      const itemCount = 1 + Math.floor(Math.random() * 8);
      let total = 0;
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const product = pick(allProducts);
        const sm = getSeasonalMultiplier(month, product.category);
        const price = Math.round(Math.max(product.price * sm * (0.9 + Math.random() * 0.2), 1) * 100) / 100;
        const qty = Math.round((5 + Math.random() * 22.5) * 10) / 10;
        items.push({ product_id: product.id, price, qty, name: product.name, unit: product.unit });
        total += price * qty;
      }
      const finalTotal = Math.round(total * 100) / 100;
      const tax = Math.round(finalTotal * 0.05 * 100) / 100;
      const pm = pick(paymentMethods);
      const amountPaid = pm === 'credit' ? Math.round(finalTotal * 0.3 * 100) / 100 : finalTotal;
      const changeDue = pm !== 'credit' && amountPaid > finalTotal ? Math.round((amountPaid - finalTotal) * 100) / 100 : 0;
      const paymentStatus = pm === 'credit' ? 'unpaid' : 'paid';

      exec('INSERT INTO sales (customer_id, user_id, total, tax, status, payment_method, payment_status, amount_paid, change_due, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [customerId, 1, finalTotal, tax, 'completed', pm, paymentStatus, amountPaid, changeDue, dateStr]);
      const saleId = lastId();

      for (const item of items) {
        exec('INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit) VALUES (?,?,?,?,?,?)',
          [saleId, item.product_id, item.name, item.price, item.qty, item.unit]);
      }
      salesCount++;

      if (Math.random() < 0.02 && items.length > 0) {
        const item = pick(items);
        const returnQty = Math.min(Math.max(1, Math.round(item.qty * (0.1 + Math.random() * 0.3) * 10) / 10), item.qty);
        const reason = pick(reasons);
        const retDate = new Date(sd);
        retDate.setDate(retDate.getDate() + Math.floor(Math.random() * 3));
        retDate.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);
        exec('INSERT INTO returns (sale_id, product_id, qty, reason, created_at) VALUES (?,?,?,?,?)',
          [saleId, item.product_id, returnQty, reason || null, fmtDate(retDate)]);
        exec('UPDATE products SET stock = stock + ? WHERE id = ?', [returnQty, item.product_id]);
        exec('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?,?,?)',
          [item.product_id, returnQty, 'return']);
        returnCount++;
      }
    }
  }
  // Update debt_balance for customers with credit sales
  for (const cid of customerIds) {
    const debtTotal = one(`SELECT COALESCE(SUM(total - amount_paid), 0) as debt FROM sales WHERE customer_id = ? AND payment_status = 'unpaid'`, [cid]);
    if (debtTotal) {
      exec('UPDATE customers SET debt_balance = ? WHERE id = ?', [Math.round(debtTotal.debt * 100) / 100, cid]);
    }
  }

  // Held sales
  for (let h = 0; h < 3; h++) {
    const heldDate = new Date(now);
    heldDate.setDate(heldDate.getDate() - Math.floor(Math.random() * 7));
    heldDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    const heldCust = pick(customerIds);
    const heldItems = [];
    for (let j = 0; j < 3; j++) {
      const p = pick(allProducts);
      heldItems.push({ product_id: p.id, price: p.price, qty: Math.round((5 + Math.random() * 15) * 10) / 10, name: p.name, unit: p.unit });
    }
    const heldTotal = Math.round(heldItems.reduce((s, it) => s + it.price * it.qty, 0) * 100) / 100;
    exec('INSERT INTO sales (customer_id, user_id, total, tax, status, payment_status, created_at) VALUES (?,?,?,?,?,?,?)',
      [heldCust, 1, heldTotal, Math.round(heldTotal * 0.05 * 100) / 100, 'held', 'unpaid', fmtDate(heldDate)]);
    const heldId = lastId();
    for (const it of heldItems) {
      exec('INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit) VALUES (?,?,?,?,?,?)',
        [heldId, it.product_id, it.name, it.price, it.qty, it.unit]);
    }
  }

  // Canceled sales
  for (let c = 0; c < 5; c++) {
    const cancelDate = new Date(now);
    cancelDate.setDate(cancelDate.getDate() - Math.floor(Math.random() * 30));
    cancelDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    exec('INSERT INTO sales (customer_id, user_id, total, tax, status, payment_status, created_at) VALUES (?,?,?,?,?,?,?)',
      [pick(customerIds), 1, Math.round(rand(50, 500) * 100) / 100, 0, 'cancelled', 'unpaid', fmtDate(cancelDate)]);
  }

  // Fix stock levels
  for (const p of allProducts) {
    const sold = one(`SELECT COALESCE(SUM(si.qty), 0) as qty FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.product_id = ? AND s.status = 'completed'`, [p.id]);
    const returned = one(`SELECT COALESCE(SUM(qty), 0) as qty FROM returns WHERE product_id = ?`, [p.id]);
    const purchased = one(`SELECT COALESCE(SUM(qty), 0) as qty FROM purchases WHERE product_id = ?`, [p.id]);
    const netStock = Math.round((purchased.qty - sold.qty + returned.qty) * 100) / 100;
    exec('UPDATE products SET stock = ? WHERE id = ?', [Math.max(netStock, 0), p.id]);
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

}

seed().catch(console.error);
