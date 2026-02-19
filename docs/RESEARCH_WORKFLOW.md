# Research Workflow

## Overview

This document describes the complete lifecycle of a property research order — from customer submission to report delivery. It includes the order status flow, the researcher's checklist process, and the standardized report template.

## Order Lifecycle

```
Customer submits order
        |
        v
    SUBMITTED -----> CANCELLED (if cancelled before assignment; credit refunded)
        |
        | Admin assigns researcher
        v
    ASSIGNED
        |
        | Researcher starts work
        v
    IN_PROGRESS
        |
        | Researcher submits findings
        v
    IN_REVIEW
        |
        |--- Admin approves --------> COMPLETED (report delivered to customer)
        |
        |--- Admin requests revision
        v
    REVISION_REQUESTED
        |
        | Researcher makes corrections
        v
    IN_PROGRESS (cycle repeats)
```

## Order Statuses

| Status | Description | Changed By | Customer Visible | Notification |
|--------|-------------|------------|-----------------|--------------|
| `submitted` | Order placed, credit deducted, awaiting assignment | System | Yes | Order confirmation email |
| `assigned` | Researcher assigned to the order | Admin | Yes | — |
| `in_progress` | Researcher actively working on research | Researcher | Yes | — |
| `in_review` | Research complete, pending admin quality review | Researcher | Yes ("Under Review") | — |
| `completed` | Report approved and delivered | Admin | Yes | Report ready email |
| `revision_requested` | Admin returned to researcher for corrections | Admin | No (shows as "In Progress") | — |
| `cancelled` | Order cancelled before assignment, credit refunded | Admin/System | Yes | Cancellation email |

## Turnaround Times

| Priority | Target | Maximum | Cost |
|----------|--------|---------|------|
| Normal | 24 hours | 48 hours | 1 credit |
| Rush (Phase 2) | 4 hours | 8 hours | 2 credits |

## Customer Experience

### Submitting an Order

1. Customer navigates to **Dashboard > New Order**
2. Fills in the property research form:

| Field | Required | Description |
|-------|----------|-------------|
| Property Address | Yes | Street address of the property |
| City | Yes | City name |
| State | Yes | US state (dropdown) |
| ZIP Code | No | Postal code |
| County | Yes | County name (helps researchers find correct records) |
| Parcel ID / Folio Number | No | If known, speeds up research significantly |
| Auction Type | No | Tax deed, foreclosure, or other |
| Auction Date | No | If known, helps prioritize urgent orders |
| Notes | No | Any additional context (max 2000 characters) |

3. System verifies credit balance (>= 1 credit)
4. On submit: credit deducted, order created, confirmation displayed
5. Customer redirected to order detail page showing status: "Submitted"

### Tracking an Order

- **Dashboard > Orders** shows all orders with status badges
- Each order card shows: property address, status, submission date, estimated completion
- Order detail page shows a timeline of status changes
- Customer receives email when report is ready

### Viewing a Report

- When order status is `completed`, the "View Report" button appears
- Report page shows:
  - Executive summary
  - Risk level indicator (Low/Medium/High/Critical with color coding)
  - Detailed findings per category (expandable sections)
  - Researcher notes
  - "Download PDF" button (generates signed URL)

---

## Researcher Experience

### Receiving Assignments

1. Admin assigns order to researcher
2. Researcher sees new assignment in **Researcher > My Queue**
3. Queue shows: property address, submission date, priority, auction date (if provided)
4. Orders sorted by: priority (rush first), then auction date (soonest first), then submission date

### Research Workspace

When a researcher opens an assigned order, they see:

#### Property Information Header
- Property address, city, state, county
- Parcel ID (if provided)
- Auction type and date (if provided)
- Customer notes

#### Interactive Checklist

The checklist is pre-populated from the checklist templates. For each item:

```
[ ] Item Name
    Category: [category label]
    Status:   [Pending / Found / Clear / N/A] (dropdown)
    Notes:    [free text field]
    Source:   [URL field — where the info was found]
    Attach:   [file upload — supporting documents]
```

#### Checklist Categories and Items

**1. Property Verification**
- [ ] Confirm property address and legal description
- [ ] Verify current owner name
- [ ] Confirm parcel/folio number

**2. Mortgage Search**
- [ ] Search county recorder for recorded mortgages
- [ ] Check for satisfaction/release documents
- [ ] Note open mortgages with lender and approximate balance

**3. Tax Lien Search**
- [ ] Search for IRS federal tax liens
- [ ] Search for state tax liens
- [ ] Check property tax collector for outstanding taxes

**4. HOA Lien Search**
- [ ] Identify HOA/COA association (if applicable)
- [ ] Check for recorded HOA liens
- [ ] Note outstanding HOA assessments

**5. Mechanic's Lien Search**
- [ ] Search county recorder for mechanic's liens
- [ ] Check for construction permits indicating work done
- [ ] Verify lien validity per state time limits

**6. Judgment Search**
- [ ] Search county court for judgments against owner
- [ ] Search federal court (PACER) for judgments
- [ ] Check for child support liens

**7. Lis Pendens Search**
- [ ] Search county recorder for lis pendens filings
- [ ] Identify pending litigation affecting the property

**8. Code Violation Search**
- [ ] Check municipal code enforcement records
- [ ] Look for open building permits
- [ ] Check for demolition orders or condemnation notices

**9. Additional Encumbrances**
- [ ] Check for easements
- [ ] Check for deed restrictions
- [ ] Note other recorded documents affecting title

### Completing Research

1. Researcher works through checklist, marking each item as:
   - **Found**: Lien/encumbrance discovered — notes and source URL required
   - **Clear**: Researched and no issues found — source URL recommended
   - **N/A**: Does not apply (e.g., no HOA for a rural property)
   - **Pending**: Not yet researched

2. After completing all checklist items, researcher fills in:
   - **Executive Summary**: 1-3 paragraph overview of findings
   - **Risk Level**: Low / Medium / High / Critical
   - **Researcher Notes**: Any additional observations

3. Researcher clicks **"Submit for Review"**
4. Order status changes to `in_review`

### Risk Level Guidelines

| Level | Criteria | Color |
|-------|----------|-------|
| **Low** | No liens or encumbrances found. Title appears clear. | Green |
| **Medium** | Minor items found (e.g., small HOA balance, recorded easement). Manageable with buyer awareness. | Yellow |
| **High** | Significant liens found (e.g., open mortgage, judgment, tax debt). Buyer should exercise caution and consult an attorney. | Orange |
| **Critical** | Multiple serious liens, active litigation (lis pendens), IRS liens, or code violations with fines. Strong recommendation against purchase without legal counsel. | Red |

---

## Admin Experience

### Order Management

1. **Admin > Orders** shows all orders across all customers
2. Filterable by: status, date range, researcher, customer, priority
3. **Pending assignment** orders are highlighted

### Assignment Workflow

1. Admin reviews new `submitted` orders
2. Considers: researcher workload, expertise, property state/county
3. Assigns researcher from dropdown
4. Order status changes to `assigned`

### Quality Review

1. When researcher submits order (`in_review`), admin is notified
2. Admin reviews:
   - Completeness: All checklist items addressed
   - Accuracy: Source URLs are valid, notes are detailed
   - Risk level: Appropriate for the findings
   - Executive summary: Clear and accurate
3. Admin either:
   - **Approves**: Status → `completed`, customer notified
   - **Requests revision**: Status → `revision_requested`, adds notes for researcher

---

## Report Template

### Structure

The final report delivered to customers follows this standardized format:

```
╔══════════════════════════════════════════════════════════════╗
║                     TITLESEARCH PRO                         ║
║              PROPERTY TITLE SEARCH REPORT                   ║
╚══════════════════════════════════════════════════════════════╝

PROPERTY INFORMATION
━━━━━━━━━━━━━━━━━━━
Address:        123 Main Street, Orlando, FL 32801
County:         Orange County, Florida
Parcel ID:      12-34-56-7890-00-000
Current Owner:  John A. Smith
Report Date:    February 19, 2026
Report ID:      TSP-2026-00147

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━
Our research identified [X] items of note for this property.
[1-3 paragraph summary of key findings and recommendation]

RISK LEVEL: [LOW / MEDIUM / HIGH / CRITICAL]
         ████████░░ [visual indicator]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILED FINDINGS
━━━━━━━━━━━━━━━━━

1. EXISTING MORTGAGES
   Status: ⚠ FOUND
   ─────────────────
   • First Mortgage — Bank of America
     Amount: $185,000 (original)
     Recorded: March 15, 2019
     Document #: 2019-0045678
     No satisfaction of mortgage found on record.

   • Second Mortgage — NONE FOUND

2. IRS / FEDERAL TAX LIENS
   Status: ✓ CLEAR
   ─────────────────
   No federal or state tax liens found against the
   property or the current owner.

3. HOA LIENS
   Status: ⚠ FOUND
   ─────────────────
   • Sun Valley HOA
     Outstanding balance: $2,340 (assessments)
     Last payment: August 2025
     Lien recorded: January 10, 2026
     Document #: 2026-0001234

4. PROPERTY TAX DEBT
   Status: ✓ CLEAR
   ─────────────────
   Property taxes current through 2025.
   No delinquent taxes or tax certificates found.

5. MECHANIC'S LIENS
   Status: ✓ CLEAR
   ─────────────────
   No mechanic's liens or contractor liens found.

6. CODE VIOLATIONS
   Status: ✓ CLEAR
   ─────────────────
   No open code violations found.
   No open building permits.

7. JUDGMENTS AGAINST OWNER
   Status: ✓ CLEAR
   ─────────────────
   No civil judgments found against John A. Smith
   in Orange County court records.

8. LIS PENDENS (PENDING LAWSUITS)
   Status: ✓ CLEAR
   ─────────────────
   No lis pendens filings found affecting this property.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESEARCHER NOTES
━━━━━━━━━━━━━━━━
[Any additional observations, recommendations, or context
that doesn't fit into the categories above]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DISCLAIMER
━━━━━━━━━━
This report is for informational purposes only and does not
constitute legal advice. It is based on publicly available
records at the time of research and may not include all
liens or encumbrances (such as unrecorded liens, pending
assessments, or items in systems not accessible to our
researchers).

This report is NOT a substitute for title insurance.
TitleSearch Pro strongly recommends:
  1. Consulting with a qualified real estate attorney
  2. Obtaining title insurance before completing any
     real estate purchase

TitleSearch Pro is not liable for any decisions made based
on the information contained in this report.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2026 TitleSearch Pro. All rights reserved.
Report generated: February 19, 2026 at 3:45 PM EST
```

---

## Researcher Onboarding

### Requirements
- Familiarity with US county public records systems
- Understanding of lien types and priority
- Ability to navigate county clerk, tax collector, and court websites
- Consistent internet access
- Detail-oriented and thorough

### Training
1. Watch training video (internal): "How to Complete a TitleSearch Pro Report"
2. Complete 2 practice orders with supervision
3. First 5 real orders reviewed by admin before delivery
4. Ongoing quality spot-checks (10% of orders randomly reviewed)

### Performance Metrics
| Metric | Target |
|--------|--------|
| Average completion time | < 2 hours per order |
| Revision rate | < 10% of orders |
| Customer satisfaction | > 4.5/5 rating |
| Checklist completeness | 100% of items addressed |

---

## Data Sources by State

Researchers should check the following sources per state. This list will grow as we expand:

### Florida (Launch State)

| Data Type | Source | URL Pattern |
|-----------|--------|-------------|
| Official Records | County Clerk of Courts | `[county]clerk.com` or `myorangeclerk.com` |
| Court Cases | County Clerk Civil Search | Same as above, "Court Records" section |
| Property Tax | County Tax Collector | `[county]tax.com` or `tax[county].com` |
| Property Details | County Property Appraiser | `[county]pa.org` or similar |
| HOA | Recorded liens + direct contact | Check Official Records + HOA website |
| Code Violations | City Code Enforcement | `[city].gov/code-enforcement` |
| Federal Tax Liens | County Official Records | Filed in county where property is located |
| Bankruptcy | PACER | `pacer.uscourts.gov` |
