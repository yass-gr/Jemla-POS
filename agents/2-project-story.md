Jemla Tracker — Project Story
What Is It?
Jemla Tracker is a single-PC, offline-first web application purpose-built for a Moroccan wholesale fruit and vegetable distributor (a “jemla”).
It replaces the chaotic paper-and-memory chaos that has been bleeding money for years: no written proof of what was delivered, no record of agreed prices, no idea who owes what, and no clue how much stock is left in the depot.

Built with React, Express, and SQLite, the system runs entirely on one computer—no internet, no servers, no complex setup. Two people use it: the owner (admin) and his depot worker. They log in with a simple PIN, create delivery orders with a few clicks, print a professional delivery note that serves as legal proof, track every customer’s debt in real time, record payments, and finally manage inventory (purchases, losses, returns) so the owner knows exactly what he has and what he’s earning.

Everything is local. The database is a single file. Backup is a one-click copy. The interface speaks the language of the Moroccan market—French today, Arabic tomorrow.

The Problem
Hassan runs a wholesale fruit and vegetable business. Every morning at 4 a.m. his phone rings. A grocer wants 200 kg of tomatoes, 100 kg of onions, 10 crates of bananas—prices haggled over voice notes on WhatsApp. He loads his van, delivers the goods, and maybe scribbles something on a scrap of paper. Sometimes the buyer signs it, sometimes not. The buyer promises to pay “next Friday”. Friday comes, and Hassan can’t remember if the agreed price was 8 dirhams or 8.50, or if the last delivery was even paid. He has no proof. Customers deny the amounts. Money disappears.

Meanwhile, Hassan buys stock from the wholesale market every day—pallet of potatoes, sacks of carrots—but he never records the purchase cost or what’s left in the depot. Half a ton of onions rots in the corner because no one knew they were there. He can’t tell which products make him a profit and which lose him money. His business runs on instinct and memory, and instinct doesn’t scale.

The core pains:

No transaction proof: No delivery note means no legal standing when a buyer disputes a debt.

No debt visibility: He doesn’t know who owes how much, for how long, or who is past due.

No inventory control: Stock is bought, sold, spoiled, and returned—but never tracked.

No business insight: Total sales? Profit per product? Total outstanding debt? Unknown.

No user roles: If his worker makes a mistake (or worse), there’s no audit trail.

Why It Was Built
Hassan looked for software. He found:

Retail POS systems (like Square, Shopify) – built for scanning barcodes in a boutique, not for selling 50 kg of onions on credit. No debt tracking, no delivery notes.

Complex ERP systems (Odoo, Sage) – require internet, servers, consultants, and monthly fees. Overkill for a depot with one computer and a dusty printer.

Generic accounting tools – they don’t understand “crate of tomatoes” and “customer balance” as living, breathing entities in daily operations.

Language barrier – foreign software speaks English or formal French, not the bilingual reality of a Moroccan warehouse (French + Darija).

None of them solved the simple, brutal need: record a sale, print a bon de livraison, track the debt, and know your stock. So we built Jemla Tracker—from the ground up—for this exact business.

Key Design Decisions & Their Rationale

1. Single-machine SQLite database
   The depot has one PC. No server, no IT guy. SQLite (via better-sqlite3) runs inside the Express process. The database is a single file. Backup means copying that file. If the power cuts, WAL mode protects the data. No installation, no configuration.

2. Express + React (monolithic SPA)
   The Express server serves both the REST API and the compiled React frontend. One command starts everything (node index.js). No build step on the target machine. No complicated deployment.

3. PIN-based authentication, no JWT
   Two users—admin and worker—log in with a 4-digit PIN. No OAuth, no tokens. A simple session cookie holds the user ID and role. Perfect for a single-machine environment.

4. Local state, no complex state management
   With ~10 screens, React Context for the logged-in user and local useState everywhere else keeps the codebase minimal and readable. The most complex state is the new order cart, and it lives cleanly inside one component.

5. Print via browser (CSS @media print)
   No need for a dedicated printer driver. The delivery note is an HTML component styled for print. The user clicks “Save & Print”, a new window opens, and window.print() does the rest. Works with any thermal or A4 printer installed on the PC.

6. Bilingual-first (French + Arabic RTL ready)
   All interface strings are ready for translation. The design uses CSS logical properties so the layout mirrors automatically for Arabic. For now, French is the interface language.

7. Denormalized product name in order items
   When an order is created, the product name at that moment is stored alongside the product ID. This protects historical delivery notes even if the product is later renamed or deleted.

8. No internet required
   Everything is local. The app doesn’t call home. It works in the dusty depot with the same reliability as a calculator.

Who Uses It
Owner (Admin): The sole person who can see reports, manage products, adjust inventory, record purchases, and view the full debt ledger. He logs in once a day to check the dashboard and see who owes money.

Worker (Depot): Uses the app to create delivery orders, print the bon de livraison, and record cash payments when a buyer pays on the spot. He cannot delete orders, adjust stock, or access sensitive reports.

No IT staff. No training required.

What Makes It Different for a Moroccan Jemla
Feature Why It Matters
Delivery note (Bon de Livraison) Finally, proof of every transaction—signed by the buyer, printed on the spot.
Customer debt ledger Every order adds to the balance, every payment reduces it. See exactly who owes what, and for how long.
Flexible pricing per order Prices are never fixed. The price is negotiated every time, and the system remembers the last price given to that customer as a suggestion.
Inventory tracking (purchases, sales, spoilage, returns) Stock goes up when you buy, down when you sell. Know your stock value and avoid losses.
Offline single-PC Works without internet, in the real conditions of a Moroccan depot.
French/Arabic ready The app speaks the user’s language, with RTL layout for Arabic.
Simple user roles The worker does the daily job; the owner controls the money and the data.
One-click database backup Copy the pos.db file to a USB stick and sleep in peace.
The Evolution
The project started as a conversation about a single pain: “I don’t know who owes me money.” From there, it grew step by step, driven only by real needs:

Phase 1 – Basic order creation with customer and product selection, printing a bon de livraison, and viewing customer balances.

Phase 2 – Payment recording, customer statement (full order/payment history), and a simple admin dashboard.

Phase 3 – Inventory management: receiving stock from the market, manual adjustments for spoilage, customer returns with automatic balance correction.

Phase 4 – Stock reports, low-stock alerts, and profit visibility (cost of goods sold vs. selling price).

Every line of code exists because Hassan, the jemla distributor, ran into a wall and needed a door.
