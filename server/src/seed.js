import initSqlJs from 'sql.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'jemla.db');

// High-quality isolated product images (white background, professional)
const IMG = 'https://images.unsplash.com/photo-';
const IMG_SUFFIX = '?w=400&h=400&fit=crop&auto=format&q=80';

// Realistic Moroccan wholesale products with seasonal pricing
const products = [
  // Winter vegetables (Nov-Mar)
  { name: 'Tomate', category: 'Légumes', price: 6, unit: 'kg', stock: 500, image_url: `${IMG}1592585484333-1c71e6b4d9f6${IMG_SUFFIX}`, barcode: '6111000000001', price_wholesale: 4.5, wholesale_min_qty: 20 },
  { name: 'Pomme de terre', category: 'Légumes', price: 4, unit: 'kg', stock: 800, image_url: `${IMG}1518929662106-fa8acf49bb4e${IMG_SUFFIX}`, barcode: '6111000000002', price_wholesale: 2.8, wholesale_min_qty: 25 },
  { name: 'Oignon', category: 'Légumes', price: 3.5, unit: 'kg', stock: 600, image_url: `${IMG}1618485175738-0db20e445b19${IMG_SUFFIX}`, barcode: '6111000000003', price_wholesale: 2.2, wholesale_min_qty: 30 },
  { name: 'Carotte', category: 'Légumes', price: 5, unit: 'kg', stock: 450, image_url: `${IMG}1598112446039-65cc0a4b1f68${IMG_SUFFIX}`, barcode: '6111000000004', price_wholesale: 3.5, wholesale_min_qty: 20 },
  { name: 'Courgette', category: 'Légumes', price: 7, unit: 'kg', stock: 350, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000005', price_wholesale: 5, wholesale_min_qty: 15 },
  { name: 'Aubergine', category: 'Légumes', price: 6.5, unit: 'kg', stock: 300, image_url: `${IMG}1615484315151-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000006', price_wholesale: 4.5, wholesale_min_qty: 15 },
  { name: 'Poivron vert', category: 'Légumes', price: 9, unit: 'kg', stock: 280, image_url: `${IMG}1563565313360-af4e38e3e2d2${IMG_SUFFIX}`, barcode: '6111000000007', price_wholesale: 6.5, wholesale_min_qty: 12 },
  { name: 'Poivron rouge', category: 'Légumes', price: 12, unit: 'kg', stock: 250, image_url: `${IMG}1563565313360-af4e38e3e2d2${IMG_SUFFIX}`, barcode: '6111000000008', price_wholesale: 8.5, wholesale_min_qty: 12 },
  { name: 'Chou vert', category: 'Légumes', price: 4, unit: 'kg', stock: 400, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000009', price_wholesale: 2.8, wholesale_min_qty: 20 },
  { name: 'Chou rouge', category: 'Légumes', price: 5, unit: 'kg', stock: 350, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000010', price_wholesale: 3.5, wholesale_min_qty: 20 },
  { name: 'Laitue', category: 'Légumes', price: 2.5, unit: 'kg', stock: 500, image_url: `${IMG}1622218722351-4c7e1b2e1b1e${IMG_SUFFIX}`, barcode: '6111000000011', price_wholesale: 1.8, wholesale_min_qty: 25 },
  { name: 'Épinard', category: 'Légumes', price: 5, unit: 'kg', stock: 250, image_url: `${IMG}1576045537719-39c0ae3e1e1e${IMG_SUFFIX}`, barcode: '6111000000012', price_wholesale: 3.5, wholesale_min_qty: 15 },
  { name: 'Brocoli', category: 'Légumes', price: 10, unit: 'kg', stock: 200, image_url: `${IMG}1459421614115-f443a7d3a132${IMG_SUFFIX}`, barcode: '6111000000013', price_wholesale: 7, wholesale_min_qty: 10 },
  { name: 'Chou-fleur', category: 'Légumes', price: 8, unit: 'kg', stock: 220, image_url: `${IMG}1568585121333-d4e3b5e1e1e1${IMG_SUFFIX}`, barcode: '6111000000014', price_wholesale: 5.5, wholesale_min_qty: 12 },
  { name: 'Navet', category: 'Légumes', price: 4, unit: 'kg', stock: 300, image_url: `${IMG}1591127454761-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000015', price_wholesale: 2.8, wholesale_min_qty: 20 },
  { name: 'Radis', category: 'Légumes', price: 3, unit: 'kg', stock: 350, image_url: `${IMG}1591127454761-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000016', price_wholesale: 2, wholesale_min_qty: 25 },
  { name: 'Céleri', category: 'Légumes', price: 6, unit: 'kg', stock: 180, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000017', price_wholesale: 4.2, wholesale_min_qty: 12 },
  { name: 'Persil', category: 'Légumes', price: 4, unit: 'kg', stock: 400, image_url: `${IMG}1576045537719-39c0ae3e1e1e${IMG_SUFFIX}`, barcode: '6111000000018', price_wholesale: 2.8, wholesale_min_qty: 20 },
  { name: 'Coriandre', category: 'Légumes', price: 5, unit: 'kg', stock: 350, image_url: `${IMG}1576045537719-39c0ae3e1e1e${IMG_SUFFIX}`, barcode: '6111000000019', price_wholesale: 3.5, wholesale_min_qty: 15 },
  { name: 'Menthe', category: 'Légumes', price: 6, unit: 'kg', stock: 300, image_url: `${IMG}1576045537719-39c0ae3e1e1e${IMG_SUFFIX}`, barcode: '6111000000020', price_wholesale: 4.2, wholesale_min_qty: 15 },
  
  // Root vegetables & aromatics
  { name: 'Ail', category: 'Légumes', price: 28, unit: 'kg', stock: 150, image_url: `${IMG}1615484315151-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000021', price_wholesale: 20, wholesale_min_qty: 5 },
  { name: 'Gingembre', category: 'Légumes', price: 35, unit: 'kg', stock: 100, image_url: `${IMG}1615484315151-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000022', price_wholesale: 25, wholesale_min_qty: 5 },
  { name: 'Patate douce', category: 'Légumes', price: 7, unit: 'kg', stock: 350, image_url: `${IMG}1598112446039-65cc0a4b1f68${IMG_SUFFIX}`, barcode: '6111000000023', price_wholesale: 5, wholesale_min_qty: 15 },
  { name: 'Betterave', category: 'Légumes', price: 5, unit: 'kg', stock: 280, image_url: `${IMG}1591127454761-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000024', price_wholesale: 3.5, wholesale_min_qty: 15 },
  
  // Summer vegetables (Apr-Sep)
  { name: 'Concombre', category: 'Légumes', price: 5, unit: 'kg', stock: 450, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000025', price_wholesale: 3.5, wholesale_min_qty: 20 },
  { name: 'Haricots verts', category: 'Légumes', price: 11, unit: 'kg', stock: 250, image_url: `${IMG}1567186470-a3c39c3e1e1e${IMG_SUFFIX}`, barcode: '6111000000026', price_wholesale: 8, wholesale_min_qty: 10 },
  { name: 'Petits pois', category: 'Légumes', price: 14, unit: 'kg', stock: 200, image_url: `${IMG}1567186470-a3c39c3e1e1e${IMG_SUFFIX}`, barcode: '6111000000027', price_wholesale: 10, wholesale_min_qty: 10 },
  { name: 'Fèves fraîches', category: 'Légumes', price: 8, unit: 'kg', stock: 220, image_url: `${IMG}1567186470-a3c39c3e1e1e${IMG_SUFFIX}`, barcode: '6111000000028', price_wholesale: 5.5, wholesale_min_qty: 12 },
  { name: 'Artichaut', category: 'Légumes', price: 9, unit: 'kg', stock: 180, image_url: `${IMG}1604371255477-b9b6dc3c3e0e${IMG_SUFFIX}`, barcode: '6111000000029', price_wholesale: 6.5, wholesale_min_qty: 10 },
  { name: 'Asperges', category: 'Légumes', price: 25, unit: 'kg', stock: 80, image_url: `${IMG}1567186470-a3c39c3e1e1e${IMG_SUFFIX}`, barcode: '6111000000030', price_wholesale: 18, wholesale_min_qty: 5 },
  
  // Citrus fruits (Winter)
  { name: 'Orange Navel', category: 'Fruits', price: 7, unit: 'kg', stock: 600, image_url: `${IMG}1611085637755-8b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000031', price_wholesale: 5, wholesale_min_qty: 25 },
  { name: 'Orange Sanguine', category: 'Fruits', price: 9, unit: 'kg', stock: 400, image_url: `${IMG}1611085637755-8b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000032', price_wholesale: 6.5, wholesale_min_qty: 20 },
  { name: 'Clémentine', category: 'Fruits', price: 10, unit: 'kg', stock: 500, image_url: `${IMG}1611085637755-8b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000033', price_wholesale: 7, wholesale_min_qty: 20 },
  { name: 'Mandarine', category: 'Fruits', price: 11, unit: 'kg', stock: 450, image_url: `${IMG}1611085637755-8b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000034', price_wholesale: 8, wholesale_min_qty: 20 },
  { name: 'Citron', category: 'Fruits', price: 9, unit: 'kg', stock: 550, image_url: `${IMG}1590520394219-6b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000035', price_wholesale: 6.5, wholesale_min_qty: 20 },
  { name: 'Pamplemousse', category: 'Fruits', price: 8, unit: 'kg', stock: 300, image_url: `${IMG}1590520394219-6b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000036', price_wholesale: 5.5, wholesale_min_qty: 15 },
  
  // Stone fruits & berries (Spring-Summer)
  { name: 'Fraise', category: 'Fruits', price: 22, unit: 'kg', stock: 200, image_url: `${IMG}1464966576223-4b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000037', price_wholesale: 16, wholesale_min_qty: 8 },
  { name: 'Cerise', category: 'Fruits', price: 35, unit: 'kg', stock: 120, image_url: `${IMG}1528824449531-e6a3e1e1e1e1${IMG_SUFFIX}`, barcode: '6111000000038', price_wholesale: 25, wholesale_min_qty: 5 },
  { name: 'Pêche', category: 'Fruits', price: 16, unit: 'kg', stock: 280, image_url: `${IMG}1595673756989-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000039', price_wholesale: 11, wholesale_min_qty: 10 },
  { name: 'Abricot', category: 'Fruits', price: 18, unit: 'kg', stock: 250, image_url: `${IMG}1595673756989-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000040', price_wholesale: 13, wholesale_min_qty: 10 },
  { name: 'Prune', category: 'Fruits', price: 14, unit: 'kg', stock: 300, image_url: `${IMG}1595673756989-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000041', price_wholesale: 10, wholesale_min_qty: 12 },
  { name: 'Nectarine', category: 'Fruits', price: 17, unit: 'kg', stock: 260, image_url: `${IMG}1595673756989-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000042', price_wholesale: 12, wholesale_min_qty: 10 },
  
  // Melons & watermelons (Summer)
  { name: 'Pastèque', category: 'Fruits', price: 3.5, unit: 'kg', stock: 800, image_url: `${IMG}1587046512015-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000043', price_wholesale: 2.5, wholesale_min_qty: 30 },
  { name: 'Melon Cantaloup', category: 'Fruits', price: 6, unit: 'kg', stock: 400, image_url: `${IMG}1571762691837-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000044', price_wholesale: 4.2, wholesale_min_qty: 15 },
  { name: 'Melon Vert', category: 'Fruits', price: 7, unit: 'kg', stock: 350, image_url: `${IMG}1571762691837-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000045', price_wholesale: 5, wholesale_min_qty: 15 },
  
  // Tropical fruits (Year-round)
  { name: 'Banane', category: 'Fruits', price: 11, unit: 'kg', stock: 700, image_url: `${IMG}1571762691837-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000046', price_wholesale: 8, wholesale_min_qty: 25 },
  { name: 'Ananas', category: 'Fruits', price: 15, unit: 'kg', stock: 250, image_url: `${IMG}1550258989718-c7b7bb7e1e1e${IMG_SUFFIX}`, barcode: '6111000000047', price_wholesale: 11, wholesale_min_qty: 10 },
  { name: 'Mangue', category: 'Fruits', price: 28, unit: 'kg', stock: 150, image_url: `${IMG}1553275042-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000048', price_wholesale: 20, wholesale_min_qty: 8 },
  { name: 'Avocat', category: 'Fruits', price: 18, unit: 'kg', stock: 300, image_url: `${IMG}1523049539099-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000049', price_wholesale: 13, wholesale_min_qty: 10 },
  { name: 'Kiwi', category: 'Fruits', price: 16, unit: 'kg', stock: 280, image_url: `${IMG}1585049357888-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000050', price_wholesale: 11, wholesale_min_qty: 10 },
  
  // Apples & pears (Fall-Winter)
  { name: 'Pomme Golden', category: 'Fruits', price: 12, unit: 'kg', stock: 500, image_url: `${IMG}1560806365298-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000051', price_wholesale: 8.5, wholesale_min_qty: 20 },
  { name: 'Pomme Gala', category: 'Fruits', price: 13, unit: 'kg', stock: 480, image_url: `${IMG}1560806365298-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000052', price_wholesale: 9, wholesale_min_qty: 20 },
  { name: 'Pomme Granny Smith', category: 'Fruits', price: 14, unit: 'kg', stock: 450, image_url: `${IMG}1560806365298-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000053', price_wholesale: 10, wholesale_min_qty: 20 },
  { name: 'Poire Williams', category: 'Fruits', price: 15, unit: 'kg', stock: 350, image_url: `${IMG}1631133755469-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000054', price_wholesale: 11, wholesale_min_qty: 15 },
  { name: 'Poire Conference', category: 'Fruits', price: 14, unit: 'kg', stock: 380, image_url: `${IMG}1631133755469-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000055', price_wholesale: 10, wholesale_min_qty: 15 },
  
  // Grapes (Late summer-Fall)
  { name: 'Raisin Noir', category: 'Fruits', price: 18, unit: 'kg', stock: 300, image_url: `${IMG}1537690015691-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000056', price_wholesale: 13, wholesale_min_qty: 10 },
  { name: 'Raisin Blanc', category: 'Fruits', price: 19, unit: 'kg', stock: 280, image_url: `${IMG}1537690015691-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000057', price_wholesale: 14, wholesale_min_qty: 10 },
  { name: 'Raisin Rouge', category: 'Fruits', price: 20, unit: 'kg', stock: 260, image_url: `${IMG}1537690015691-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000058', price_wholesale: 14.5, wholesale_min_qty: 10 },
  
  // Exotic & specialty
  { name: 'Grenade', category: 'Fruits', price: 12, unit: 'kg', stock: 350, image_url: `${IMG}1615484315151-9f6b9e1c7c0e${IMG_SUFFIX}`, barcode: '6111000000059', price_wholesale: 8.5, wholesale_min_qty: 15 },
  { name: 'Figues fraîches', category: 'Fruits', price: 32, unit: 'kg', stock: 100, image_url: `${IMG}1603569636537-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000060', price_wholesale: 23, wholesale_min_qty: 5 },
  { name: 'Dattes Deglet Nour', category: 'Fruits', price: 45, unit: 'kg', stock: 180, image_url: `${IMG}1596370626789-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000061', price_wholesale: 32, wholesale_min_qty: 5 },
  { name: 'Coing', category: 'Fruits', price: 10, unit: 'kg', stock: 200, image_url: `${IMG}1631133755469-7b7bb7e1e1e1${IMG_SUFFIX}`, barcode: '6111000000062', price_wholesale: 7, wholesale_min_qty: 10 },
];

const suppliers = [
  { name: 'Marché de Gros Casablanca', phone: '+212 5 22 30 10 20', email: 'contact@groscasa.ma', address: 'Boulevard Bir Anzarane, Casablanca' },
  { name: 'Coopérative Agricole Agadir', phone: '+212 5 28 21 33 44', email: 'coop@agadir-agricole.ma', address: 'Zone Agricole, Agadir' },
  { name: 'Producteurs Meknès', phone: '+212 5 35 53 22 11', email: 'producteurs@meknes.ma', address: 'Route Fès, Meknès' },
  { name: 'Import Export Tanger', phone: '+212 5 39 94 55 66', email: 'import@tanger-med.ma', address: 'Port Tanger Med, Tanger' },
  { name: 'Ferme Bio Marrakech', phone: '+212 5 24 44 77 88', email: 'bio@marrakech-ferme.ma', address: 'Route Ourika, Marrakech' },
  { name: 'Souk Hebdomadaire Beni Mellal', phone: '+212 5 23 48 99 00', email: 'souk@benimellal.ma', address: 'Souk El Had, Beni Mellal' },
  { name: 'Coopérative Berkane', phone: '+212 5 36 61 22 33', email: 'coop@berkane.ma', address: 'Centre Ville, Berkane' },
  { name: 'Producteurs Gharb', phone: '+212 5 37 25 44 55', email: 'gharb@producteurs.ma', address: 'Kenitra, Gharb' },
];

const customers = [
  { name: 'Épicerie Al Baraka', phone: '+212 6 61 23 45 67', email: 'albaraka@email.ma', address: 'Hay Mohammadi, Casablanca', debt: 8500 },
  { name: 'Primeur Fatima', phone: '+212 6 62 34 56 78', email: 'fatima.primeur@email.ma', address: 'Derb Sultan, Casablanca', debt: 0 },
  { name: 'Restaurant Dar Tajine', phone: '+212 6 63 45 67 89', email: 'contact@dartajine.ma', address: 'Medina, Marrakech', debt: 4200 },
  { name: 'Hôtel Riad Atlas', phone: '+212 6 64 56 78 90', email: 'riad.atlas@email.ma', address: 'Guéliz, Marrakech', debt: 12000 },
  { name: 'Supermarché Marjane', phone: '+212 6 65 67 89 01', email: 'marjane.local@email.ma', address: 'Maarif, Rabat', debt: 25000 },
  { name: 'Traiteur Le Gourmet', phone: '+212 6 66 78 90 12', email: 'legourmet@email.ma', address: 'Agdal, Rabat', debt: 3200 },
  { name: 'Épicerie Ibn Sina', phone: '+212 6 67 89 01 23', email: 'ibnsina@email.ma', address: 'Ville Nouvelle, Fès', debt: 1800 },
  { name: 'Primeur Hassan II', phone: '+212 6 68 90 12 34', email: 'hassan2.primeur@email.ma', address: 'Borough, Fès', debt: 5600 },
  { name: 'Restaurant La Marina', phone: '+212 6 69 01 23 45', email: 'lamarina@email.ma', address: 'Port, Agadir', debt: 0 },
  { name: 'Hôtel Sofitel', phone: '+212 6 70 12 34 56', email: 'sofitel.tanger@email.ma', address: 'Corniche, Tanger', debt: 18000 },
  { name: 'Épicerie Al Wifaq', phone: '+212 6 71 23 45 67', email: 'alwifaq@email.ma', address: 'Hay Salam, Meknès', debt: 2400 },
  { name: 'Primeur Najah', phone: '+212 6 72 34 56 78', email: 'najah.primeur@email.ma', address: 'Hamria, Meknès', debt: 0 },
  { name: 'Cantine Scolaire Lycée', phone: '+212 6 73 45 67 89', email: 'lycee.cantine@email.ma', address: 'Centre, Oujda', debt: 6800 },
  { name: 'Restaurant Al Mounia', phone: '+212 6 74 56 78 90', email: 'almounia@email.ma', address: 'Medina, Fès', debt: 0 },
  { name: 'Superette Carrefour', phone: '+212 6 75 67 89 01', email: 'carrefour.local@email.ma', address: 'Sidi Maarouf, Casablanca', debt: 32000 },
  { name: 'Traiteur Saveurs du Maroc', phone: '+212 6 76 78 90 12', email: 'saveurs@email.ma', address: 'Ocean, Rabat', debt: 4500 },
  { name: 'Épicerie Al Amal', phone: '+212 6 77 89 01 23', email: 'alamal@email.ma', address: 'Hay Nahda, Tétouan', debt: 1200 },
  { name: 'Primeur Boughaz', phone: '+212 6 78 90 12 34', email: 'boughaz@email.ma', address: 'Souani, Tétouan', debt: 0 },
  { name: 'Restaurant Dar Zaki', phone: '+212 6 79 01 23 45', email: 'darzaki@email.ma', address: 'Kasbah, Tanger', debt: 7200 },
  { name: 'Hôtel Kenzi Tower', phone: '+212 6 80 12 34 56', email: 'kenzi@email.ma', address: 'Twin Center, Casablanca', debt: 22000 },
];

let db = null;

// Helper function to get seasonal price multiplier
function getSeasonalMultiplier(month, productCategory) {
  // Moroccan seasonal patterns
  const winterMonths = [11, 0, 1]; // Dec-Feb (simplified for logic)
  const springMonths = [2, 3, 4]; // Mar-May
  const summerMonths = [5, 6, 7]; // Jun-Aug
  const fallMonths = [8, 9, 10]; // Sep-Nov
  
  if (productCategory === 'Fruits') {
    if (summerMonths.includes(month)) return 0.85; // Cheaper in summer
    if (winterMonths.includes(month)) return 1.25; // More expensive in winter
  }
  
  if (productCategory === 'Légumes') {
    if (springMonths.includes(month)) return 0.80; // Cheaper in spring
    if (winterMonths.includes(month)) return 1.15; // Slightly more expensive in winter
  }
  
  return 1.0;
}

// Generate realistic purchase dates throughout the year
function generatePurchaseDates(startDate, daysBack) {
  const dates = [];
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    
    // More purchases on weekdays, fewer on weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (Math.random() > 0.3) continue; // Skip 70% of weekend purchases
    }
    
    // Multiple deliveries per day for large distributor
    const numDeliveries = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numDeliveries; j++) {
      const deliveryDate = new Date(date);
      deliveryDate.setHours(5 + j * 3, Math.floor(Math.random() * 60), 0, 0);
      dates.push(deliveryDate);
    }
  }
  return dates.sort((a, b) => a - b);
}

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
  exec('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, unit TEXT NOT NULL, stock REAL NOT NULL DEFAULT 0, image_url TEXT, barcode TEXT, price_wholesale REAL, wholesale_min_qty REAL DEFAULT 0, created_at TEXT DEFAULT (datetime(\'now\')), updated_at TEXT DEFAULT (datetime(\'now\')))');
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
    exec('INSERT INTO products (name, category, price, unit, stock, image_url, barcode, price_wholesale, wholesale_min_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.name, p.category, p.price, p.unit, p.stock, p.image_url || null, p.barcode || null, p.price_wholesale ?? null, p.wholesale_min_qty ?? 0]);
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

  console.log('Generating 1 year of realistic purchase data...');
  
  // Generate purchases over 1 year (365 days)
  const now = new Date();
  const purchaseDates = generatePurchaseDates(now, 365);
  const allProducts = all('SELECT id, price, category FROM products');
  
  let purchaseCount = 0;
  for (const purchaseDate of purchaseDates) {
    const month = purchaseDate.getMonth();
    
    // Each delivery includes 5-15 products
    const numProducts = 5 + Math.floor(Math.random() * 11);
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numProducts);
    
    for (const product of selectedProducts) {
      const seasonalMultiplier = getSeasonalMultiplier(month, product.category);
      const basePrice = product.price * 0.6; // Wholesale is 60% of retail
      const unitPrice = Math.round(basePrice * seasonalMultiplier * 100) / 100;
      
      // Larger quantities for large distributor
      const qty = 50 + Math.floor(Math.random() * 200); // 50-250 kg per product
      
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      exec('INSERT INTO purchases (product_id, supplier, qty, unit_price, total, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [product.id, supplier.name, qty, unitPrice, Math.round(qty * unitPrice * 100) / 100,
         purchaseDate.toISOString().slice(0, 19).replace('T', ' ')]);
      
      purchaseCount++;
    }
  }
  
  console.log(`Generated ${purchaseCount} purchase records`);

  console.log('Generating 1 year of realistic sales data...');
  
  // Generate sales over 1 year
  let salesCount = 0;
  const reasons = ['Produit abîmé', 'Mauvaise qualité', 'Trop mûr', 'Erreur de commande', 'Client insatisfait', null, null, null, null, null];
  let returnCount = 0;
  
  for (let day = 365; day >= 0; day--) {
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - day);
    const month = saleDate.getMonth();
    const dayOfWeek = saleDate.getDay();
    
    // Determine number of sales based on day type and season
    let baseSales = 15; // Average daily sales
    
    // Weekend adjustments
    if (dayOfWeek === 5) baseSales = 25; // Friday busy
    if (dayOfWeek === 6 || dayOfWeek === 0) baseSales = 10; // Weekend slower
    
    // Seasonal adjustments
    if ([6, 7, 8].includes(month)) baseSales += 5; // Summer higher
    if ([11, 0].includes(month)) baseSales += 8; // Holiday season
    
    // Ramadan effect (approximate dates)
    // Ramadan 2024: ~March 11 - April 9
    // Ramadan 2025: ~Feb 28 - March 30
    const isRamadan2024 = (month === 2 && day >= 10) || (month === 3 && day <= 9);
    const isRamadan2025 = (month === 1 && day >= 27) || (month === 2 && day <= 29);
    if (isRamadan2024 || isRamadan2025) {
      baseSales = Math.floor(baseSales * 1.4); // 40% increase during Ramadan
    }
    
    const dailySales = baseSales + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < dailySales; i++) {
      // Sale time: 7 AM to 8 PM
      const hour = 7 + Math.floor(Math.random() * 13);
      const minute = Math.floor(Math.random() * 60);
      saleDate.setHours(hour, minute, 0, 0);
      const dateStr = saleDate.toISOString().slice(0, 19).replace('T', ' ');
      
      // 60% of sales have customers
      const customerId = Math.random() > 0.4 ? customerIds[Math.floor(Math.random() * customerIds.length)] : null;
      
      // Number of items per sale: 1-8 for wholesale
      const itemCount = 1 + Math.floor(Math.random() * 8);
      let total = 0;
      const items = [];
      
      for (let j = 0; j < itemCount; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        
        // Wholesale quantities: 5-50 kg typically
        const qty = 5 + Math.floor(Math.random() * 45) / 2; // 5-27.5 kg
        
        // Price variation based on season and negotiation
        const seasonalMultiplier = getSeasonalMultiplier(month, product.category);
        const priceVariation = 0.9 + Math.random() * 0.2; // ±10% variation
        const price = Math.round(product.price * seasonalMultiplier * priceVariation * 100) / 100;
        
        items.push({ product_id: product.id, price: Math.max(price, 1), qty: Math.round(qty * 10) / 10 });
        total += price * qty;
      }
      
      const finalTotal = Math.round(total * 100) / 100;
      const tax = Math.round(finalTotal * 0.05 * 100) / 100; // 5% tax
      
      exec('INSERT INTO sales (customer_id, user_id, total, tax, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, 1, finalTotal, tax, 'completed', dateStr]);
      const saleId = lastId();
      
      for (const item of items) {
        const productRow = one('SELECT name, unit FROM products WHERE id = ?', [item.product_id]);
        exec('INSERT INTO sale_items (sale_id, product_id, product_name, price, qty, unit) VALUES (?, ?, ?, ?, ?, ?)',
          [saleId, item.product_id, productRow.name, item.price, item.qty, productRow.unit]);
      }
      
      salesCount++;
      
      // Generate returns (about 2% of sales)
      if (Math.random() < 0.02 && items.length > 0) {
        const item = items[Math.floor(Math.random() * items.length)];
        const returnQty = Math.min(Math.max(1, item.qty * (0.1 + Math.random() * 0.3)), item.qty);
        const reason = reasons[Math.floor(Math.random() * reasons.length)];
        
        const returnDate = new Date(saleDate);
        returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 3));
        returnDate.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);
        const returnDateStr = returnDate.toISOString().slice(0, 19).replace('T', ' ');
        
        exec('INSERT INTO returns (sale_id, product_id, qty, reason, created_at) VALUES (?, ?, ?, ?, ?)',
          [saleId, item.product_id, Math.round(returnQty * 10) / 10, reason, returnDateStr]);
        
        exec('UPDATE products SET stock = stock + ? WHERE id = ?', [Math.round(returnQty * 10) / 10, item.product_id]);
        exec('INSERT INTO inventory_log (product_id, change_qty, reason) VALUES (?, ?, ?)',
          [item.product_id, Math.round(returnQty * 10) / 10, 'return']);
        
        returnCount++;
      }
    }
  }
  
  console.log(`Generated ${salesCount} sales records`);
  console.log(`Generated ${returnCount} return records`);

  // Save database
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));

  console.log('\n✅ Seed complete!');
  console.log(`  - 2 users (admin/admin123, cashier/cashier123)`);
  console.log(`  - ${products.length} products (${products.filter(p => p.category === 'Légumes').length} légumes, ${products.filter(p => p.category === 'Fruits').length} fruits)`);
  console.log(`  - ${customers.length} customers`);
  console.log(`  - ${suppliers.length} suppliers`);
  console.log(`  - ${all('SELECT COUNT(*) as c FROM purchases')[0].c} purchases (1 year)`);
  console.log(`  - ${all('SELECT COUNT(*) as c FROM sales')[0].c} sales (1 year)`);
  console.log(`  - ${all('SELECT COUNT(*) as c FROM returns')[0].c} returns`);
  console.log(`  - Date range: ${new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-MA')} to ${now.toLocaleDateString('fr-MA')}`);
}

seed().catch(console.error);
