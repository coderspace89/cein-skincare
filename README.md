# Cein Skincare (Headless Shopify Storefront)

A high-performance, headless e-commerce storefront for **Cein Skincare**. This project splits the presentation and data layers to maximize speed, SEO efficiency, and administrative flexibility. 

## 🏗️ Architecture Overview

The system is constructed with a modern, modular headless stack:

```
                  ┌──────────────────────┐
                  │   Next.js Storefront │ (Vercel)
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐            ┌──────────────────────┐
│  Shopify Storefront  │            │      Strapi CMS      │ (Railway)
│   (Cart & Checkout)  │            └──────────┬───────────┘
└──────────────────────┘                       │
                                      ┌────────┴────────┐
                                      ▼                 ▼
                          ┌──────────────────────┐ ┌──────────┐
                          │    Neon PostgreSQL   │ │Cloudinary│
                          │      (Database)      │ │ (Assets) │
                          └──────────────────────┘ └──────────┘
```

*   **Frontend**: Next.js (App Router) deployed on **Vercel** for optimal global speed, static generation (ISR/SSR), and React Server Components.
*   **E-Commerce Engine**: **Shopify** (Storefront API) handles cart logic, product variants, inventory management, and secure checkout.
*   **Headless Content Management**: **Strapi (v4)** deployed on **Railway** handles marketing pages, articles, dynamic banners, and blog posts.
*   **Database**: **Neon Postgres** (serverless Postgres) hosts all content-related database tables with auto-scaling capabilities.
*   **Media Hosting**: **Cloudinary** manages, optimizes, and serves all image uploads and marketing banners dynamically.

---

## ⚡ Key Features

1.  **Server-Side Rendering & Incremental Static Regeneration (ISR)**: Fast initial load times combined with instantaneous content propagation when CMS data changes.
2.  **Hybrid Cart Resolution**: Integrates Shopify's backend cart creation with client-side state synchronization.
3.  **Seamless Checkout Return Redirect**: Customized routing in the Shopify online theme bypasses the development store password wall, returning customers safely back to Vercel with clean cart-clearing hooks.
4.  **Flexible Page Builder**: Allows administrative users to create custom landing pages in Strapi without redeploying the Next.js storefront.

---

## 🛠️ Project Structure

### 1. Frontend (`/`)
*   **Framework**: Next.js 14+ (App Router)
*   **Styling**: Tailwind CSS
*   **Cart Context**: React Context tracking client-side state, syncing with localStorage, and initiating checkout mutation requests on Shopify.

### 2. Backend (`/backend`)
*   **CMS**: Strapi CMS (Node.js)
*   **Storage**: Cloudinary Provider for media library uploads.
*   **Database**: Postgres (Neon) with auto-sleeping instances.

---

## 🚀 Environment Variables Config

### Next.js Storefront (`.env.local` / Vercel variables)
```env
# Shopify Configurations
SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_api_token

# Application URLs
NEXT_PUBLIC_SITE_URL=https://cein-skincare.vercel.app
NEXT_PUBLIC_STRAPI_URL=https://cein-skincare-production.up.railway.app
```

### Strapi CMS (`.env` / Railway variables)
```env
# Server
HOST=0.0.0.0
PORT=1337
APP_KEYS=generate_secure_app_keys
API_TOKEN_SALT=generate_salt
ADMIN_JWT_SECRET=generate_secret
TRANSFER_TOKEN_SALT=generate_salt
JWT_SECRET=generate_secret

# Database (Neon PostgreSQL)
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://user:password@ep-lively-hill-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Media Provider (Cloudinary)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

---

## 🔄 Deployment & Hosting Operations

### Frontend (Vercel)
The storefront triggers continuous deployments on push to your primary repository. Ensure that standard dynamic paths are cached with appropriate caching headers or Next.js `revalidate` intervals.

### Backend CMS (Railway)
The backend container runs under optimized parameters to protect memory consumption on micro-instances:
*   **Memory Optimization**: The `start` script enforces node space constraints:
    `node --max-old-space-size=400 node_modules/.bin/strapi start`
*   **Build command**: `npm run build`
*   **Start command**: `npm run start`

### Shopify Theme Redirect Sync
To maintain an elegant customer experience across checkout domains, the default liquid layout (`theme.liquid` / `password.liquid`) uses high-priority header routing to resolve post-checkout state cleanups:

```html
<script type="text/javascript">
  var HEADLESS_STORE_URL = "https://cein-skincare.vercel.app";
  var urlParams = new URLSearchParams(window.location.search);
  var cartId = urlParams.get('cart_id') || "";

  if (window.location.hostname.indexOf("myshopify.com") !== -1) {
    window.location.replace(HEADLESS_STORE_URL + "/?cart_id=" + cartId);
  }
</script>
```

---

## 💻 Local Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Local CMS Execution**: Ensure your local database client fallback is configured in `database.js` if not pointing directly to the Neon development branch.
