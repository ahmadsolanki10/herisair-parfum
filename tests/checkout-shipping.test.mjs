import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";

const originalRates = [
  "shr_1UCHNqKIWkWSAwgQ7Y5ixj6s",
  "shr_1UCHWRKIWkWSAwgQhPmHRrY5",
  "shr_1UCHXQKIWkWSAwgQqtRoEqsL"
];
const gccRate = "shr_1USolRKIWkWSAwgQBCDvsLiI";
const root = fileURLToPath(new URL("../", import.meta.url));
const mockStripe = `
  import { Server } from 'node:http';
  const listen = Server.prototype.listen;
  Server.prototype.listen = function (...args) {
    this.once('listening', () => console.log('SHIPPING_TEST_PORT=' + this.address().port));
    return listen.apply(this, args);
  };
  globalThis.fetch = async (url, options) => {
    if (url !== 'https://api.stripe.com/v1/checkout/sessions') throw new Error('Unexpected outbound request');
    if (options.headers.authorization !== 'Bearer sk_test_local_placeholder') throw new Error('Unexpected credential');
    return Response.json({url: 'https://checkout.stripe.com/test?request=' + encodeURIComponent(String(options.body))});
  };
`;

async function startServer(t, overrides = {}) {
  const child = spawn(process.execPath, [
    "--import", `data:text/javascript,${encodeURIComponent(mockStripe)}`, "server.mjs"
  ], {
    cwd: root,
    env: {
      ...process.env,
      PORT: "0",
      STRIPE_SECRET_KEY: "sk_test_local_placeholder",
      STRIPE_SHIPPING_STANDARD: originalRates[0],
      STRIPE_SHIPPING_FOUNDER_UAE: originalRates[1],
      STRIPE_SHIPPING_FOUNDER_GCC: originalRates[2],
      STRIPE_SHIPPING_GCC: "",
      ...overrides
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await once(child, "exit");
    }
  });
  const port = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error("Server startup timed out")), 10_000);
    child.on("error", error => { clearTimeout(timeout); reject(error); });
    child.on("exit", code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
    child.stdout.on("data", data => {
      output += data;
      const match = output.match(/SHIPPING_TEST_PORT=(\d+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  return async (shippingCountry, extra = {}) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/create-checkout-session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: [{ slug: "unity", qty: 2 }], shippingCountry, ...extra })
    });
    const result = await response.json();
    return {
      status: response.status,
      result,
      stripe: result.url ? new URLSearchParams(new URL(result.url).searchParams.get("request")) : null
    };
  };
}

function assertShipping(stripe, country, rates) {
  assert.deepEqual([...stripe].filter(([key]) => key.startsWith("shipping_address_collection")), [
    ["shipping_address_collection[allowed_countries][0]", country]
  ]);
  assert.deepEqual([...stripe].filter(([key]) => key.startsWith("shipping_options")).map(([, value]) => value), rates);
  assert.equal(stripe.get("line_items[0][quantity]"), "2");
  assert.equal(stripe.get("mode"), "payment");
}

test("UAE retains the original three rates; all other GCC countries also receive the new rate", async t => {
  const checkout = await startServer(t);
  for (const country of ["AE", "BH", "KW", "OM", "QA", "SA"]) {
    const { status, stripe } = await checkout(country);
    assert.equal(status, 200, country);
    assertShipping(stripe, country, country === "AE" ? originalRates : [...originalRates, gccRate]);
  }
});

test("Missing and unsupported destinations cannot create a checkout", async t => {
  const checkout = await startServer(t);
  for (const country of [undefined, null, "", "US", "GB", "AE,SA", {}, ["AE", "SA"]]) {
    const { status, stripe, result } = await checkout(country);
    assert.equal(status, 400);
    assert.equal(stripe, null);
    assert.match(result.error, /delivery country/);
  }
});

test("Country values normalize and browser-supplied rates cannot override server choices", async t => {
  const checkout = await startServer(t);
  const { status, stripe } = await checkout(" sa ", { shippingRates: ["shr_untrusted"], shipping_options: [] });
  assert.equal(status, 200);
  assertShipping(stripe, "SA", [...originalRates, gccRate]);
});

test("The additional rate supports a configuration override without duplicating existing rates", async t => {
  const checkout = await startServer(t, { STRIPE_SHIPPING_GCC: originalRates[2] });
  const { status, stripe } = await checkout("QA");
  assert.equal(status, 200);
  assertShipping(stripe, "QA", originalRates);
});
