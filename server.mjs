import { createHmac, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);
const canonicalSiteUrl = (process.env.CANONICAL_SITE_URL || "https://herisair.com").replace(/\/+$/, "");
const canonicalHost = new URL(canonicalSiteUrl).host;

const cleanRoutes = new Map([
  ["/", "index.html"],
  ["/house", "our-house.html"],
  ["/collection", "collection.html"],
  ["/discover", "quiz.html"],
  ["/discover/unity", "unity.html"],
  ["/discover/ascent", "ascent.html"],
  ["/discover/eminence", "eminence.html"],
  ["/store", "store.html"],
  ["/client-care", "contact.html"],
  ["/faq", "faq.html"],
  ["/shipping", "shipping.html"],
  ["/returns", "returns.html"],
  ["/privacy", "privacy.html"],
  ["/terms", "terms.html"],
  ["/cookies", "cookies.html"],
  ["/order-confirmation", "checkout-success.html"],
  ["/preview/mobile", "mobile-preview.html"],
  ["/preview/house", "house-mobile-preview.html"]
]);

const canonicalRouteByFile = new Map(
  [...cleanRoutes].map(([route, file]) => [file.toLowerCase(), route])
);

const stripeCatalog = {
  unity: process.env.STRIPE_PRICE_UNITY || "price_1UCHCIKIWkWSAwgQP2hBgFyd",
  ascent: process.env.STRIPE_PRICE_ASCENT || "price_1UCHEhKIWkWSAwgQaFxosM9o",
  eminence: process.env.STRIPE_PRICE_EMINENCE || "price_1UCHFrKIWkWSAwgQNF6baBDd"
};

const stripeTaxRate = process.env.STRIPE_TAX_RATE_UAE || "txr_1UCHZPKIWkWSAwgQt6ghQaLw";
const stripeShippingRates = [
  process.env.STRIPE_SHIPPING_STANDARD || "shr_1UCHNqKIWkWSAwgQ7Y5ixj6s",
  process.env.STRIPE_SHIPPING_FOUNDER_UAE || "shr_1UCHWRKIWkWSAwgQhPmHRrY5",
  process.env.STRIPE_SHIPPING_FOUNDER_GCC || "shr_1UCHXQKIWkWSAwgQqtRoEqsL"
].filter(Boolean);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request, maximumBytes = 16_384) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on("data", chunk => {
      size += chunk.length;
      if (size > maximumBytes) {
        reject(new Error("Request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function siteUrlFor(request) {
  const host = request.headers.host || "";
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host) ? `http://${host}` : canonicalSiteUrl;
}

function sendRedirect(response, location, status = 308) {
  response.writeHead(status, {
    location,
    "cache-control": "no-store"
  });
  response.end();
}

function normalisePublicPath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.replace(/\/+$/, "");
  return pathname;
}

function canonicalPathFor(pathname) {
  const normalisedPath = normalisePublicPath(pathname);
  const fileName = normalisedPath.split("/").pop()?.toLowerCase() || "";
  return canonicalRouteByFile.get(fileName) || normalisedPath;
}

function normaliseCart(items) {
  if (!Array.isArray(items)) return [];

  const quantities = new Map();
  for (const item of items) {
    const slug = String(item?.slug || "").toLowerCase();
    const quantity = Number(item?.qty);
    if (!stripeCatalog[slug] || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) continue;
    quantities.set(slug, Math.min(20, (quantities.get(slug) || 0) + quantity));
  }

  return [...quantities].map(([slug, quantity]) => ({ slug, quantity }));
}

async function createCheckoutSession(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    sendJson(response, 503, { error: "Secure checkout is not yet available" });
    return;
  }

  try {
    const rawBody = await readRequestBody(request);
    const cart = normaliseCart(JSON.parse(rawBody.toString("utf8"))?.items);
    if (!cart.length) {
      sendJson(response, 400, { error: "Your selection is empty" });
      return;
    }

    const siteUrl = siteUrlFor(request);
    const form = new URLSearchParams({
      mode: "payment",
      success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/store?checkout=cancelled`,
      customer_creation: "always",
      billing_address_collection: "required",
      "phone_number_collection[enabled]": "true",
      submit_type: "pay",
      locale: "en",
      "metadata[order_source]": "herisair_website",
      "payment_intent_data[metadata][order_source]": "herisair_website"
    });

    ["AE", "BH", "KW", "OM", "QA", "SA"].forEach((country, index) => {
      form.set(`shipping_address_collection[allowed_countries][${index}]`, country);
    });

    cart.forEach((item, index) => {
      form.set(`line_items[${index}][price]`, stripeCatalog[item.slug]);
      form.set(`line_items[${index}][quantity]`, String(item.quantity));
      form.set(`line_items[${index}][tax_rates][0]`, stripeTaxRate);
    });

    stripeShippingRates.forEach((shippingRate, index) => {
      form.set(`shipping_options[${index}][shipping_rate]`, shippingRate);
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${stripeSecretKey}`,
        "content-type": "application/x-www-form-urlencoded"
      },
      body: form
    });
    const session = await stripeResponse.json();

    if (!stripeResponse.ok || !session.url) {
      console.error("Stripe Checkout session could not be created", session?.error?.type || stripeResponse.status);
      sendJson(response, 502, { error: "Secure checkout could not be opened. Please try again" });
      return;
    }

    sendJson(response, 200, { url: session.url });
  } catch (error) {
    console.error("Checkout request failed", error instanceof Error ? error.message : "Unknown error");
    sendJson(response, 400, { error: "We could not prepare checkout. Please try again" });
  }
}

async function getCheckoutSession(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const requestUrl = new URL(request.url, "http://localhost");
  const sessionId = requestUrl.searchParams.get("session_id") || "";
  if (!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId) || sessionId.length > 255) {
    sendJson(response, 400, { error: "A valid checkout reference is required" });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    sendJson(response, 503, { error: "Order confirmation is not yet available" });
    return;
  }

  try {
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { authorization: `Bearer ${stripeSecretKey}` }
    });
    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe Checkout session could not be retrieved", session?.error?.type || stripeResponse.status);
      sendJson(response, 404, { error: "This order confirmation could not be found" });
      return;
    }

    const isComplete = session.status === "complete";
    const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (!isComplete || !isPaid) {
      sendJson(response, 409, { error: "Payment confirmation is still being processed" });
      return;
    }

    const paymentIntent = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

    sendJson(response, 200, {
      transactionId: paymentIntent || session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status
    });
  } catch (error) {
    console.error("Order confirmation request failed", error instanceof Error ? error.message : "Unknown error");
    sendJson(response, 502, { error: "Order confirmation is temporarily unavailable" });
  }
}

function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const values = signatureHeader.split(",").map(value => value.trim().split("="));
  const timestamp = values.find(([key]) => key === "t")?.[1];
  const signatures = values.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some(signature => {
    const suppliedBuffer = Buffer.from(signature, "hex");
    return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
  });
}

async function handleStripeWebhook(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readRequestBody(request, 1_048_576);
    const payload = body.toString("utf8");
    if (!verifyStripeSignature(payload, request.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)) {
      sendJson(response, 400, { error: "Invalid webhook signature" });
      return;
    }

    const event = JSON.parse(payload);
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      console.log(`Paid Stripe order received: ${event.data?.object?.id || event.id}`);
    }
    sendJson(response, 200, { received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error instanceof Error ? error.message : "Unknown error");
    sendJson(response, 400, { error: "Webhook could not be processed" });
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  const pathname = decodeURIComponent(requestUrl.pathname);

  if (pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  const requestedHost = String(request.headers["x-forwarded-host"] || request.headers.host || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const canonicalPath = canonicalPathFor(pathname);
  const isRailwayAddress = requestedHost.endsWith(".up.railway.app");
  const isLocalAddress = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestedHost);
  const hasLegacyOrNonCanonicalPath = canonicalPath !== pathname;

  if ((request.method === "GET" || request.method === "HEAD") && (isRailwayAddress || hasLegacyOrNonCanonicalPath)) {
    const destinationHost = isRailwayAddress ? canonicalHost : requestedHost;
    const destinationProtocol = isRailwayAddress
      ? new URL(canonicalSiteUrl).protocol
      : isLocalAddress
        ? "http:"
        : "https:";
    sendRedirect(response, `${destinationProtocol}//${destinationHost}${canonicalPath}${requestUrl.search}`);
    return;
  }

  if (pathname === "/api/create-checkout-session") {
    await createCheckoutSession(request, response);
    return;
  }
  if (pathname === "/api/checkout-session") {
    await getCheckoutSession(request, response);
    return;
  }
  if (pathname === "/api/stripe-webhook") {
    await handleStripeWebhook(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }

  let relativePath = cleanRoutes.get(pathname) || pathname.replace(/^\/+/, "");
  const nestedAssetIndex = relativePath.indexOf("assets/");
  if (nestedAssetIndex > 0) relativePath = relativePath.slice(nestedAssetIndex);
  const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, safePath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    response.end("<h1>Page not found</h1>");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "cache-control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=604800"
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Hérisair is running on port ${port}`);
});
