/**
 * Curated email playbook for sales / sourcing staff.
 *
 * Each entry is a fully written template plus context: when to use, what to
 * tweak, common buyer signals that trigger it. Variables use the same
 * {{var}} syntax as the compose form — see app/admin/email/actions.ts for
 * the supported keys (first_name, full_name, company, product_name,
 * quantity, etc).
 */

export type EmailLibraryCategory =
  | "First contact"
  | "Spec & sample"
  | "Quotation"
  | "Negotiation"
  | "Follow-up"
  | "Operations"
  | "Post-sale"
  | "Sensitive";

export type EmailTemplateEntry = {
  id: string;
  category: EmailLibraryCategory;
  title: string;
  whenToUse: string;
  tips: string[];
  subject: string;
  body: string;
};

export const EMAIL_LIBRARY: EmailTemplateEntry[] = [
  // ─── First contact ──────────────────────────────────────────────────────
  {
    id: "rfq-acknowledgement",
    category: "First contact",
    title: "RFQ acknowledgement (within 1h)",
    whenToUse:
      "Buyer submits an RFQ on the website or sends a cold email. Send this within one business hour to set the relationship tone before competitors reply.",
    tips: [
      "Confirm receipt explicitly — buyers report 'no reply' as the #1 frustration.",
      "Repeat one specific detail from their request so they know you actually read it.",
      "Promise a concrete next deliverable + timeline, not just 'we'll be in touch'."
    ],
    subject: "Got your sourcing request — {{product_name}}",
    body: `Hi {{first_name}},

Thanks for reaching out about {{product_name}}. I've logged your request and will come back within one working day with:

  • Indicative price band
  • Realistic lead time from a vetted partner factory
  • Certification options matching your spec

In the meantime, if anything changes (target quantity, certifications, destination port), reply to this email so I can fold it into the first reply.

Best,
{{seller.signer_name}}
{{seller.legal_name}}
WhatsApp: +84 825 646 868`
  },
  {
    id: "cold-outbound-intro",
    category: "First contact",
    title: "Cold outbound — first touch",
    whenToUse:
      "You spotted a potential buyer at a trade show / LinkedIn / referral. No prior contact. Goal: get them to reply, not to sell.",
    tips: [
      "Lead with the buyer's situation, not your products.",
      "One specific reference proves you didn't blast it to a list.",
      "Make the ask tiny — a 15-min call, not a meeting."
    ],
    subject: "{{company}} — bamboo + biochar from Vietnam?",
    body: `Hi {{first_name}},

Noticed {{company}} sources [their current product line] from [their current region]. Most buyers in that segment are now diversifying 30–50% of volume to Vietnam under EVFTA / RCEP — both for duty savings and supply resilience.

We're 5B Trading, a curated Vietnam sourcing partner. We work with vetted bamboo, rattan, ceramic, silk, biochar, and specialty paper factories — full transparency, factory disclosed at LOI, FSC/BSCI/Sedex/EBC certs verified.

Worth a 15-min call to walk through what category fits your roadmap?

Best,
{{seller.signer_name}}`
  },

  // ─── Spec & sample ─────────────────────────────────────────────────────
  {
    id: "need-more-spec",
    category: "Spec & sample",
    title: "Asking for missing spec details",
    whenToUse:
      "RFQ is too vague to quote ('I need bamboo fence, please quote'). Don't refuse — guide them to send the right info.",
    tips: [
      "List 4–6 questions max, structured. Walls of questions kill replies.",
      "Provide a sane default ('most EU buyers go with…') so they can confirm rather than research.",
      "Offer to jump on a call if writing it out is heavy."
    ],
    subject: "Quick spec questions for {{product_name}}",
    body: `Hi {{first_name}},

Thanks again — to give you a sharp quote rather than a wide price band, I need a few quick confirms on {{product_name}}:

  1. Target quantity (most first orders are 1 × 40HQ ≈ 5 000 rolls)
  2. Required certifications (FSC / BSCI / Sedex / none)
  3. Finish: natural, oiled, carbonised, coated
  4. Packing: standard pallet vs retail-labelled
  5. Destination port + target ETA

If easier, happy to jump on a 15-min call instead — pick a time at [calendly-link].

Best,
{{seller.signer_name}}`
  },
  {
    id: "sample-shipment-ready",
    category: "Spec & sample",
    title: "Sample shipped — tracking",
    whenToUse:
      "Sample left our warehouse / partner factory; courier picked up. Provide tracking + set expectations for the buyer's next step.",
    tips: [
      "Tracking link + ETA up front.",
      "Mention the sample cost is credited against first order so it's salient.",
      "Pre-empt the typical question: 'how do I know it's representative of bulk?' — explain QC pass."
    ],
    subject: "Sample shipped — {{product_name}} ({{tracking_no}})",
    body: `Hi {{first_name}},

Your sample for {{product_name}} shipped today via {{courier}}, tracking {{tracking_no}}. ETA to {{destination}}: 4–7 business days.

The sample was pulled from our QC station — it represents standard bulk production within ±5% tolerance. If anything in the bulk needs to differ from what you receive, flag it before we lock the spec sheet.

Sample cost (USD {{sample_cost}}) is credited against your first order.

After you've handled the sample, the next decision is whether to proceed to a formal Letter of Intent. Reply with thumbs up / thumbs down + any spec adjustments and I'll prep the LOI.

Best,
{{seller.signer_name}}`
  },

  // ─── Quotation ─────────────────────────────────────────────────────────
  {
    id: "quotation-cover",
    category: "Quotation",
    title: "Formal quotation cover note",
    whenToUse:
      "Sending the formal quotation PDF. The PDF is the document — this email gives context and the next step.",
    tips: [
      "Restate the spec you quoted against in 1 line so any mismatch is caught now.",
      "State validity period clearly.",
      "Ask for a specific next decision, not 'let me know your thoughts'."
    ],
    subject: "Quotation {{quote_number}} — {{product_name}}",
    body: `Hi {{first_name}},

Please find the quotation for {{product_name}} ({{quantity}}) attached.

Key terms:
  • Incoterm: {{incoterm}}
  • Payment: {{payment_terms}}
  • Lead time: {{lead_time}} from confirmed order
  • Validity: 14 days from today

If the terms work, the next step is a Letter of Intent — non-binding, lets us reserve factory capacity while you finalise internally. If something needs to change (qty band, cert, packing), tell me what and I'll re-issue.

Best,
{{seller.signer_name}}`
  },

  // ─── Negotiation ───────────────────────────────────────────────────────
  {
    id: "price-pushback",
    category: "Negotiation",
    title: "Polite response to a low-ball offer",
    whenToUse:
      "Buyer counters with a price 15%+ below your quote. You can't go that low without changing scope. Don't say 'no' — reframe.",
    tips: [
      "Never say 'our price is final' — say what they'd need to do to reach their target.",
      "Offer 2–3 trade-offs (volume, packing, cert, payment terms) instead of just dropping price.",
      "Acknowledge their target as legitimate — many buyers test."
    ],
    subject: "Re: {{product_name}} — let me show what's possible at your target",
    body: `Hi {{first_name}},

Thanks for the candid number. To reach your target of USD {{target_price}}, here's what I can structure — pick whichever combination works:

  1. Move to {{higher_volume_band}} (gets you a 6–8% discount).
  2. Drop {{specific_feature}} (saves ~4%) — let me know if that's OK for your end use.
  3. Switch to {{alternate_packing}} packing (saves ~3%).
  4. Move to {{cheaper_incoterm}} instead of {{current_incoterm}} (saves shipping margin).

None of these change quality. Tell me which of (1)–(4) you can flex on and I'll re-quote against that.

If your target is genuinely fixed, I'd rather we walk away than ship something that hurts both sides — say so and I'll be straight about whether it's doable.

Best,
{{seller.signer_name}}`
  },
  {
    id: "moq-pushback",
    category: "Negotiation",
    title: "Can't accept below factory MOQ",
    whenToUse:
      "Buyer asks for a quantity below the partner factory's minimum. Don't lie that it's possible — offer consolidation or staged order.",
    tips: [
      "Be specific about why the MOQ exists (kiln load, machine setup, raw material lot).",
      "Offer a real path (consolidation with another buyer's order, staged shipments).",
      "Don't make the buyer feel stupid for asking — small orders are how most relationships start."
    ],
    subject: "MOQ options for {{product_name}}",
    body: `Hi {{first_name}},

I'd love to take your {{requested_qty}} order, but the partner factory's MOQ for this product is {{factory_moq}} because [reason — kiln load / one machine setup / raw material lot size].

A couple of ways forward:

  1. Mixed-supplier consolidation — we ship your {{requested_qty}} alongside another buyer's order from the same factory. Saves you full-MOQ commitment. Adds ~10 days to lead time. Available for our next consolidation window in {{next_window}}.

  2. Staged order — commit to the full MOQ but receive in 2 shipments. Helps your cashflow if your warehouse capacity is the constraint.

  3. Sample order at MOQ-light — a single pallet at premium pricing (USD {{sample_pallet_price}}) to validate quality and end-customer fit before you commit.

Which fits your situation best?

Best,
{{seller.signer_name}}`
  },

  // ─── Follow-up ─────────────────────────────────────────────────────────
  {
    id: "followup-3day",
    category: "Follow-up",
    title: "Follow-up 3 days after quote (no reply)",
    whenToUse:
      "Sent a quote 3 days ago, no response. Short and helpful — no pressure.",
    tips: [
      "Don't apologise for following up.",
      "Add value: an article, a price update, a buyer-friendly nudge.",
      "Concrete CTA — yes/no/maybe."
    ],
    subject: "Quick check on {{product_name}}",
    body: `Hi {{first_name}},

Just bumping the quote for {{product_name}} — I know inbox volume gets brutal.

Two quick options:

  • If you'd like to proceed → reply 'yes' and I'll send the LOI today.
  • If something doesn't fit (price, lead time, spec) → tell me what and I'll see if we can structure around it.
  • If timing's just off and you'll be back in [month] → no problem, I'll set a quiet reminder.

Best,
{{seller.signer_name}}`
  },
  {
    id: "followup-7day",
    category: "Follow-up",
    title: "Follow-up 7 days after quote (still no reply)",
    whenToUse:
      "Second follow-up. Acknowledge silence, give them a graceful exit ramp.",
    tips: [
      "Make 'no, drop me' easy — your reputation matters more than this one deal.",
      "Don't repeat the offer.",
      "Add 1 specific reason this opportunity is time-sensitive (raw material price, factory slot)."
    ],
    subject: "Re: {{product_name}} — should I park this?",
    body: `Hi {{first_name}},

Last check on the {{product_name}} quote — I don't want to clutter your inbox.

Two things:

  1. The factory slot we reserved for your order releases on {{slot_release_date}}. After that I'd need to re-quote with the new raw material price (typically 2–4% higher this quarter).

  2. Total ok if priorities shifted — just reply 'park it' and I'll close the file and reach back out next quarter.

Either is genuinely fine.

Best,
{{seller.signer_name}}`
  },
  {
    id: "reengagement-30day",
    category: "Follow-up",
    title: "Re-engaging a cold lead (30+ days)",
    whenToUse:
      "Old lead that went silent. New reason to talk — price update, new product, regulatory change.",
    tips: [
      "Don't pretend you forgot. Acknowledge the gap.",
      "The reason to reach out must be specifically relevant to their business.",
      "Tiny ask — share a doc, ask one question."
    ],
    subject: "FYI for {{company}} — {{relevance_hook}}",
    body: `Hi {{first_name}},

We talked back in {{previous_period}} about {{product_name}}; you parked the project at the time.

Two things changed that might be relevant for {{company}}:

  1. {{change_1}}
  2. {{change_2}}

If either is useful, happy to share the updated price band or a one-pager on {{relevant_article}}. If still not the right time, no worries — feel free to ignore.

Best,
{{seller.signer_name}}`
  },

  // ─── Operations ────────────────────────────────────────────────────────
  {
    id: "psi-scheduled",
    category: "Operations",
    title: "Pre-shipment inspection scheduled",
    whenToUse:
      "Third-party PSI booked. Buyer needs the date + inspector details + what they should review in the report.",
    tips: [
      "Send the AQL standard you specified so the buyer can verify the inspector applied it.",
      "Note the gating effect — balance payment held until PSI passes.",
      "Pre-empt 'what if it fails' — describe the remediation flow."
    ],
    subject: "PSI scheduled — {{contract_number}}",
    body: `Hi {{first_name}},

Pre-shipment inspection for {{contract_number}} is booked:

  • Inspector: {{inspection_company}} ({{inspector_name}})
  • Date: {{psi_date}}
  • Standard: ISO 2859-1 / MIL-STD-105E, General Inspection Level II, AQL 2.5 major / 4.0 minor
  • Report to: both your email + ours within 24h of inspection

Pass = we proceed to container loading. Fail = we either rework on-site or hold the shipment for your decision. Either way, the balance 70% payment stays in your bank until you've seen the report.

If you want to dial in or attend remotely, the inspector offers a video walk for an extra USD 80 — let me know.

Best,
{{seller.signer_name}}`
  },
  {
    id: "container-loaded",
    category: "Operations",
    title: "Container loaded & B/L issued",
    whenToUse:
      "Goods on the water. Buyer needs vessel + ETA + document set status.",
    tips: [
      "Vessel name + voyage + ETA up front.",
      "List which documents are attached vs which are pending.",
      "Set expectation for when remaining docs land."
    ],
    subject: "Loaded — {{contract_number}} on {{vessel}}",
    body: `Hi {{first_name}},

Container for {{contract_number}} is loaded and on the water.

  • Vessel: {{vessel}} {{voyage}}
  • Port of loading: {{pol}}
  • ETA {{pod}}: {{eta}}
  • Container no.: {{container_no}}

Documents attached:
  ✓ Commercial invoice
  ✓ Packing list
  ✓ B/L (copy — original courier'd to you, AWB to follow)
  ✓ Certificate of Origin ({{co_form}})

Pending — sent within 48h:
  ⏳ Phytosanitary certificate
  ⏳ {{any_other_cert}}

Balance 70% payment due against B/L copy per our terms. Send remittance advice and I'll release the originals.

Safe travels,
{{seller.signer_name}}`
  },

  // ─── Post-sale ─────────────────────────────────────────────────────────
  {
    id: "post-arrival-checkin",
    category: "Post-sale",
    title: "Post-arrival check-in (2 weeks after delivery)",
    whenToUse:
      "Container cleared customs and arrived buyer's warehouse 1–2 weeks ago. Time to surface issues early + plant the reorder seed.",
    tips: [
      "Ask one specific quality question.",
      "Offer to fix issues fast — buyer remembers how problems were handled, not whether problems happened.",
      "Don't pitch reorder yet — just open the door."
    ],
    subject: "Two weeks in — how's {{product_name}} performing?",
    body: `Hi {{first_name}},

Quick check — the {{product_name}} container from {{contract_number}} should have cleared and reached your warehouse by now.

Three questions:

  1. Did the count match the packing list exactly? (We aim for 0% short-shipment; if anything is off, I want to know.)
  2. Any quality issues that need addressing this round?
  3. Anything you'd want changed for the next production run (packing, marking, finish)?

When you're closer to your next reorder, ping me — I can hold factory capacity 2–3 weeks ahead of when you'd need to ship.

Best,
{{seller.signer_name}}`
  },
  {
    id: "reorder-prompt",
    category: "Post-sale",
    title: "Reorder prompt (based on inventory cycle)",
    whenToUse:
      "You estimated their inventory cycle from the previous order; time to nudge them on the next one before they shop around.",
    tips: [
      "Reference their last order specifics — proves you remember.",
      "Offer to reserve factory capacity (creates urgency without pressure).",
      "Make reorder one-click — repeat exact spec."
    ],
    subject: "Time to plan {{company}}'s next {{product_name}}?",
    body: `Hi {{first_name}},

You took {{prev_qty}} of {{product_name}} back in {{prev_month}}. Based on typical sell-through, you're probably 4–6 weeks from needing the next reorder.

A few notes:

  • Factory raw material cost is up {{raw_material_change}}% since last quarter. If we lock production now, I can hold last quarter's pricing.
  • Sea freight to {{pod}} is currently {{freight_trend}}. {{freight_note}}.
  • Same spec as last time? Or any changes for this round?

If you want to repeat exact spec/qty/incoterm, reply 'repeat' and I'll send the proforma today.

Best,
{{seller.signer_name}}`
  },

  // ─── Sensitive ─────────────────────────────────────────────────────────
  {
    id: "quality-complaint",
    category: "Sensitive",
    title: "Quality complaint — first response",
    whenToUse:
      "Buyer reports a quality issue from received goods. Speed and ownership matter more than perfect wording. Send within 4h.",
    tips: [
      "Apologise concretely — for the problem, not 'any inconvenience'.",
      "Ask for evidence (photos, sample weights, lot numbers) but don't make the buyer feel accused.",
      "Commit to a remediation timeline before you know the root cause.",
      "Loop in the partner factory contact in the next email, not this one."
    ],
    subject: "Re: {{product_name}} — taking this seriously",
    body: `Hi {{first_name}},

Thank you for flagging this. A quality issue on a delivered order is exactly the kind of thing where our response matters more than our excuse.

Here's what I'm doing right now:

  1. Confirming the lot from your batch number against the QC records and partner factory production log — back to you with that today.
  2. Asking the inspector who passed the PSI for the original report photos so we can see whether this slipped past or developed in transit.
  3. Drafting a remediation plan: reasonable options are replacement at our cost, credit against next order, or — if the volume affected is small — partial refund. I'll lay out which is feasible by tomorrow EOD.

Could you send me:
  • Photos of the affected units (close-up of defect)
  • Approximate count of affected pieces
  • Carton or pallet markings if visible

Whatever the root cause turns out to be, you shouldn't be the one carrying it.

Best,
{{seller.signer_name}}`
  },
  {
    id: "payment-overdue",
    category: "Sensitive",
    title: "Payment overdue reminder (gentle)",
    whenToUse:
      "Balance 70% payment is 5–10 days late. First nudge — assume oversight, not bad faith.",
    tips: [
      "Lead with operational consequences (B/L originals held), not threats.",
      "Offer to talk if there's a real cashflow issue.",
      "Don't copy collections / lawyers at this stage."
    ],
    subject: "Balance for {{contract_number}} — quick reminder",
    body: `Hi {{first_name}},

Hope all is well. The balance payment for {{contract_number}} ({{balance_amount}}) was due on {{due_date}}; I'm guessing it slipped through the cracks.

We're holding the original B/L + cert pack at our end until the payment lands so your shipment can clear customs without surprises. Once you've sent remittance, just forward me the advice and I'll courier the originals same day.

If there's any cashflow situation we should know about, tell me — we'd rather hear early than late and there's usually something we can structure.

Best,
{{seller.signer_name}}`
  },
  {
    id: "decline-out-of-scope",
    category: "Sensitive",
    title: "Declining politely — out of scope",
    whenToUse:
      "Buyer asks for something we genuinely don't do (wrong product category, market we don't serve, deal size too small to be viable). Don't fake it — say no well.",
    tips: [
      "Decline cleanly in the first paragraph.",
      "Offer a referral if you can — buyers remember helpful 'no's.",
      "Leave the door open for a different category."
    ],
    subject: "Re: {{product_name}} — not the right partner this time",
    body: `Hi {{first_name}},

Appreciate you reaching out. Honest answer first: {{product_name}} isn't a category we source well. We focus on bamboo, rattan, ceramic, silk, biochar, paper, and packaging materials from Vietnam — outside that, we'd be guessing on quality, and that's not a position I want to put your reorders in.

A couple of pointers that might still be useful:

  • For {{product_name}}, the buyers I respect tend to source from [region/specialist firm if I can name one credibly].
  • If you ever need any of the categories above, we'd be a strong fit — happy to send a one-pager when relevant.

Best of luck with the project,
{{seller.signer_name}}`
  }
];

export const EMAIL_LIBRARY_CATEGORIES: EmailLibraryCategory[] = [
  "First contact",
  "Spec & sample",
  "Quotation",
  "Negotiation",
  "Follow-up",
  "Operations",
  "Post-sale",
  "Sensitive"
];

export function findLibraryTemplate(id: string): EmailTemplateEntry | null {
  return EMAIL_LIBRARY.find((t) => t.id === id) ?? null;
}
