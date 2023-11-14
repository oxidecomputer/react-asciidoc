const oList = `
// .basic
. Step 1
. Step 2
. Step 3

// .with-start
[start=6]
. Step 1
. Step 2
. Step 3

// .with-reversed
[%reversed]
. Step 1
. Step 2
. Step 3

// .with-numeration-styles
[decimal]
. level 1
[upperalpha]
.. level 2
[loweralpha]
... level 3
[lowerroman]
.... level 4
[lowergreek]
..... level 5

// .with-title
.Steps
. Step 1
. Step 2
. Step 3

// .with-id-and-role
[#steps.green]
. Step 1
. Step 2
. Step 3

// .max-nesting
. level 1
.. level 2
... level 3
.... level 4
..... level 5
.. level 2

// .complex-content
. Every list item has at least one paragraph of content,
  which may be wrapped, even using a hanging indent.
+
Additional paragraphs or blocks are adjoined by putting
a list continuation on a line adjacent to both blocks.
+
list continuation:: a plus sign (\`{plus}\`) on a line by itself

. A literal paragraph does not require a list continuation.

 $ gem install asciidoctor

//
== Process Requirements

[qanda]
Rotating the **root** role should be regularly exercised to ensure written procedure is up-to-date and there is sufficient knowledge of the process.::
* **Recommendation:** 12–18 month expiration of **root** role

The expiration of the **targets** and **snapshot** roles should be sufficiently long to not require re-approval of the same set of targets.::
* **Recommendation:** Assuming current release cadence of "roughly once per month", 3 month expiration of **targets** and **snapshot** roles

The expiration of the **timestamp** role should be sufficiently long to avoid outages, and also avoid a monitoring system needing to page people on nights/weekends to prevent outages.::
* **Recommendation:** 5–7 day expiration of **timestamp** role

An outage of a single AWS region should not prevent publishing new updates.::
* **Recommendation:** Keys and signing infrastructure are distributed across at least two AWS regions

Loss of control of a single key trusted to sign the **root** role should not result in a complete loss of trust.::
* **Recommendation:** The trust policy for the **root** role requires at least 2 valid signatures, and lists at least 3 keys

An inability to log into AWS accounts (e.g. SAML outage or misconfiguration) should not prevent the setup of a new PKI in the worst case scenario.::
* Does this requirement matter? Are there bigger problems if this occurs?
* Can we somehow use the root HSM from the RFD 369 CA as an emergency backup key trusted to sign the **root** role? (Probably not without upstream tough changes, as secp384r1 is not in the TUF spec)

Signing a list of targets should require the approval of Oxide employees, and not be automated.::
* Permission Slip should be used to manage signing of the **targets** and **snapshot** roles.
`

export default oList
