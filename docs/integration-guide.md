# 📘 SIN-Webshop Integrations- & Entwicklerdokumentation
## Backend-Verknüpfung & Automatisierung

Dieses Dokument beschreibt detailliert die Architektur des neuen Full-Stack Webshops sowie die direkte Anbindung an Ihre Backend-Bundles und Drittanbieter-Schnittstellen. Der Webshop wurde von einer reinen Client-seitigen App (SPA) auf eine leistungsfähige **Full-Stack-Architektur (React + Vite + Express-Server)** umgestellt.

---

## 📐 1. Architektur & Datenfluss-Übersicht

```
   ┌──────────────────────────────────────────────┐
   │             React 19 Frontend UI             │
   └──────────────────────┬───────────────────────┘
                          │ (REST API-Calls & Checkout-Trigger)
                          ▼
   ┌──────────────────────────────────────────────┐
   │             Express.js Server                │
   │           (Einstieg: /server.ts)             │
   └──────┬────────────────┬───────────────┬──────┘
          │                │               │
          ▼                ▼               ▼
┌──────────────────┐ ┌───────────┐ ┌────────────────────────────────┐
│   Stripe Bundle  │ │ Supabase  │ │      CJ Dropshipping API       │
│ (Zahlungseingang)│ │    OCI    │ │   & TikTok Shop Sync Engine    │
└──────────────────┘ └───────────┘ └────────────────────────────────┘
```

### Server-Struktur (`/server.ts`):
* **Port Bindung:** Das Express-Backend läuft auf Port `3000` (Host `0.0.0.0`) und betreibt sowohl die REST-Endpunkte (`/api/*`) als auch das Vite-Asset-Serving.
* **Sicherheits-Vorteil:** Sensible API-Schlüssel wie `STRIPE_SECRET_KEY` oder `CJ_ACCESS_TOKEN` werden ausschließlich serverseitig geladen und niemals an den Browser übermittelt.

---

## 💳 2. Stripe Payment Integration (Code & Webhook)
**Repository:** [SIN-Stripe-Bundle](https://github.com/SIN-Shop-Center/SIN-Stripe-Bundle)

Der Webshop nutzt den sicheren Stripe Checkout-Flow. Der Kunde beendet seine Bestellung im Warenkorb und initiiert den Kauf per POST-Request.

### API-Endpunkt: `POST /api/checkout/stripe`
Erstellt eine gehostete Zahlungs-Session bei Stripe. Unterstützt automatische Preis-Reduzierungen durch im Frontend aktivierte Aktionskupons (z. B. `WELCOME30` (-30%), `BLITZ80` (-80%) oder `FREESHIP15` (-15%)).

**Request-Payload (JSON):**
```json
{
  "items": [
    {
      "product": {
        "id": "premium-smartwatch-x1",
        "title": "SmartWatch Pro X1",
        "price": 129.99,
        "imageUrl": "https://img.images.com/watch.jpg"
      },
      "quantity": 1,
      "selectedColor": "#000000",
      "selectedSize": "Standard"
    }
  ],
  "customerEmail": "kunde@beispiel.de",
  "discountCode": "WELCOME30",
  "discountPercent": 30
}
```

**Verbindung zum Stripe-Bundle:**
* Der Server rechnet den rabattierten Produktpreis in Cents um (Stripe-Spezifikation) und übergibt die Metadaten.
* **Webhook (`POST /api/checkout/webhook`):** Sobald die Kreditkarte/PayPal/Giropay-Zahlung autorisiert wurde, sendet Stripe ein `checkout.session.completed` Webhook-Signal.
* **Entwickler-Aktion im Webhook:**
  1. Bestellung in die Datenbank (Supabase) als "Bezahlt" eintragen.
  2. Bestellung direkt zur Auftragsabwicklung an CJ Dropshipping senden (über den `/api/dropshipping/cj-order` Controller).

---

## 🗄️ 3. Cloud Database mit Supabase OCI
**Repository:** [SIN-Supabase-OCI-Bundle](https://github.com/SIN-Shop-Center/SIN-Supabase-OCI-Bundle)

Die Datenhaltung der Produkte sowie verifizierten Kundenbestellungen erfolgt in Supabase über dessen RESTful PostGREST Schnittstelle.

### API-Endpunkt A: `GET /api/supabase/products`
Ruft den aktuellen Live-Katalog und Lagerbestand aus Supabase ab.
* **Tabelle:** `products`
* **Vorteil:** Die App liest live, d.h. Produktpreise und Produktbilder können direkt in Supabase gepflegt werden.

### API-Endpunkt B: `POST /api/supabase/orders`
Eintragung erfolgreicher Verkäufe in die Datenbank.

**Erwartetes Tabellenschema in Supabase (`sin_orders`):**
```sql
CREATE TABLE sin_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  checkout_total DECIMAL(10, 2) NOT NULL,
  items_payload JSONB NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  purchase_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 4. Lieferantenanbindung & CJ Dropshipping-Automatisierung
**Repository:** [SIN-CJDropshipping-Bundle](https://github.com/SIN-Shop-Center/SIN-CJDropshipping-Bundle)  
**Dokumentation:** [CJ Dropshipping Developer API Docs](https://developers.cjdropshipping.cn/en/api/introduction.html)

Sobald eine Zahlung eintrifft, muss die Bestellung vollautomatisch an den Lieferanten CJ übergeben werden, damit das Produkt direkt an den Käufer gesendet wird.

### API-Endpunkt: `POST /api/dropshipping/cj-order`
Übersetzt die interne Bestellung in ein CJ-konformes Format und sendet diese an die offizielle CJ Bestell-Schnittstelle.

**CJ API Endpunkt:** `https://developers.cjdropshipping.cn/api/v2/shopping/order/createThirdOrder`

**Mapping-Struktur:**
* Jedem lokalen Produkt im Webshop entspricht die zugehörige **CJ SKU / ProduktId** (`item.product.id`).
* Die Lieferadresse des Käufers wird 1:1 auf die CJ Versandfelder (`shippingName`, `shippingAddress`, `shippingZip`) gemappt.
* Verwenden Sie Ihren `CJ_ACCESS_TOKEN` im HTTP-Header `"CJ-Access-Token"`.

---

## 📱 5. TikTok Shop Live Inventory Sync
**TikTok Info-Artikel:** [CJDropshipping TikTok Shop Inventory Sync](https://www.cjdropshipping.com/article-details/How-to-Set-Inventory-Sync-on-TikTok-Shop)

Um "Out of Stock"-Stornierungen auf TikTok Shop zu verhindern, müssen die Bestände des CJ-Warenhauses in Echtzeit mit Ihrem TikTok Seller Center synchronisiert werden.

```
┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
│     CJ Warehouse       │ ──────> │    Express Backend     │ ──────> │      TikTok Shop       │
│ (Abfrage /product/stock)│         │  (Get Stock Level)     │         │ (Update via OpenAPI)   │
└────────────────────────┘         └────────────────────────┘         └────────────────────────┘
```

### API Endpunkt: `POST /api/tiktok/sync-inventory`
Dieser Endpunkt führt den Abgleich durch:
1. **CJ Abfrage:** Ermittelt den echten globalen Lagerbestand für eine Liste von Produkt-SKUs über die CJ API:
   `GET https://developers.cjdropshipping.cn/api/v2/product/stock?sku={SKU}`
2. **TikTok Update:** Schiebt den frischen Lagerbestand direkt zu TikTok Shop Seller Central über das TikTok Open API Framework:
   `PUT https://open-api.tiktokshop.com/api/v2/products/stocks/update`

**Crontab Einrichtung auf Ihrem Server:**
Um den Sync einmal pro Stunde laufen zu lassen, richten Sie einen einfachen Cronjob auf Ihrem Server ein:
```bash
0 * * * * curl -X POST -H "Content-Type: application/json" -d '{"productSkus": ["SKU-001", "SKU-002"]}' http://localhost:3000/api/tiktok/sync-inventory
```

---

## 🛠️ 6. Einrichtung & Startanleitung für Entwickler

### 1) Umgebungsvariablen (`.env`):
Erstellen Sie eine `.env` Datei im Stammverzeichnis basierend auf `.env.example`:
```env
PORT=3000
NODE_ENV=production

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_URL=https://ujxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...

# CJDropshipping API
CJ_API_KEY=your_key
CJ_ACCESS_TOKEN=your_token

# TikTok Shop integration
TIKTOK_SHOP_ID=shop_112233
TIKTOK_ACCESS_TOKEN=ms_token_...
```

### 2) Lokaler Entwicklungsmodus (Fullstack):
In diesem Modus startet der Express-Server und integriert den Vite-Frontend-Server als Middleware.
```bash
npm run dev
```

### 3) Production Build & Deployment:
Kompiliert das React-Frontend in statische Assets im Ordner `/dist` und bündelt das Express-Backend über `esbuild` in ein performantes, einzelnes CommonJS-File (`/dist/server.cjs`).
```bash
npm run build
npm run start
```

---
*Dokumentation erstellt im Mai 2026 für die SIN Shop Center Entwickler. Bei Fragen kontaktieren Sie bitte den Systemadministrator.*
