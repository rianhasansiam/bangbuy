# Reviewing a public tracking context

`npm run tracking:review-context -- --url <public URL>` prepares a candidate for human review. It does not approve a page, write a policy manifest, grant consent or send an event. Keep the business, data source and delivery switches denied until their independent reviews are complete.

## Prepare a candidate

Set `STOREFRONT_ORIGIN` and `COMMERCE_ORIGIN` to the intended distinct origins, then run the tool against a clean public page. The following hosts are synthetic placeholders, not deployment instructions:

```sh
STOREFRONT_ORIGIN=https://catalog.example.test \
COMMERCE_ORIGIN=https://commerce.example.test \
npm run tracking:review-context -- --url https://catalog.example.test/en/products/example
```

The tool uses the installed Chrome channel by default. `PLAYWRIGHT_CHANNEL` or `PLAYWRIGHT_EXECUTABLE_PATH` can select the same browser used by the local browser tests. Isolated loopback development origins are accepted outside production. The tool does not load environment files automatically; use the reviewed process environment.

Every run creates a fresh anonymous browser context without account cookies, order credentials, carts or browser storage. It blocks Meta and tag-manager network destinations and all HTTP write requests. Navigation to a private or unconfigured origin is blocked. Queries, fragments, credentials and private routes are rejected rather than stripped from the URL.

The page must finish preparing its public content and provide a stable context. Mutable pages, sensitive controls or unavailable public context produce a failure, leaving the page unapproved. The fingerprint uses the same actual document collector as the public adapter, including title, metadata, structured data, rendered catalog content, links, images, product markers and public serialized snapshots.

## Review the output

The output includes the actual final URL, referrer, content IDs and SHA256 fingerprint. Classification remains `unknown`, approval remains `false` and the approval reference is empty. The request count reports intercepted marketing or write attempts, not successful external delivery.

A reviewer must inspect the actual document and every displayed product, banner, category and other public content before supplying a classification, review reference and expiry. Review the URL, referrer and metadata as well as the event parameters. Unknown, sensitive or restricted content stays denied. A public route is not automatically eligible, and a candidate hash is not business or Meta data-source approval.

After the relevant approvals exist, an operator can enter the exact reviewed route, content IDs and fingerprint in a separately controlled manifest that follows `config/meta-policy.example.json` and `lib/analytics/policy.ts`. Event and field approvals remain independent. The tool never fills them in. A changed document, route, product set, policy version or expired approval requires a new review; do not keep an old fingerprint by concealing the change.

This tool reviews only anonymous public browser context. It cannot approve private checkout context or guest conversion reporting. Private conversion consent, matching restrictions and the transactional worker have their own [server delivery contract](marketing-conversion-worker.md). Complete the [origin migration](meta-origin-isolation.md) before considering tracking on a previously private origin. No tool output proves Events Manager receipt, account eligibility or live tracking verification.

## Consent scope

Catalog analytics and private checkout reporting use independent host-scoped preferences. Withdrawing catalog consent does not silently alter a different origin's grant. The catalog controls link to the checkout reporting controls and vice versa so customers can withdraw both choices explicitly. Tabs on the same origin synchronize their privacy preference and revalidate server state. No consent token or matching identifier crosses origins through these links.

Guest commerce context and matching capture are prohibited by the existing guest privacy contract even when generic marketing consent is granted. Guest purchases create only the internal order record. Private pages never load Meta Pixel.
