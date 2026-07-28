---
title: "Broken Access Control: The Bug Class Scanners Still Can't Find"
date: 2026-07-28
author: Heckcure Team
tags: [Web Application Security, Penetration Testing]
---

Broken access control has sat at or near the top of OWASP's list for years, and it isn't because developers don't know it exists. It's because the class of bug is structurally invisible to anything that doesn't understand what "your data" means inside a specific application — and that's a judgment call, not a signature.

Authentication answers "who are you." Authorization answers "what are you allowed to touch." Most apps get the first one right and quietly fail the second, because the server ends up trusting an identifier the client handed it — an order ID, a project ID, a document token — instead of re-deriving what that user is actually permitted to access from their own session.

## Where it actually breaks

The pattern repeats far more often than teams expect:

- An endpoint checks that you're authenticated and own *a* resource in the right category, but never checks that the *specific* ID you passed in the URL or request body belongs to you. Change one digit, read someone else's record.
- A low-privilege, easy-to-guess identifier on one endpoint quietly unlocks a second, high-privilege identifier on another — the first request wasn't sensitive by itself, so nobody thought to lock it down, but it's the key to the request that is.
- Authorization is enforced in the UI (a hidden button, a greyed-out menu item) and nowhere else. The moment you skip the frontend and talk to the API directly, the check simply isn't there.
- Write actions get less scrutiny than reads. Teams remember to check "can this user *see* this?" and forget to ask the identical question for "can this user *change* this?"

None of that shows up as a 200-vs-403 pattern a scanner can flag on its own — it requires knowing the app's data model well enough to tell a legitimate response from a stolen one.

## How we actually test for it

We run every meaningful flow through two independent, low-privilege test accounts and deliberately cross the streams: swap IDs, tokens, and session context between them across every endpoint that touches user data — not just the ones with a visible UI for it. We test state-changing requests as hard as read requests, because an attacker who can silently edit or delete something they don't own rarely cares that they couldn't also view it first. And we test from the API layer directly, because that's the layer an attacker actually talks to.

This is slow, deliberate work, and it's exactly the kind of finding a scan report will never contain — not because the tool is bad, but because the question it would need to answer isn't "does this look wrong," it's "should this specific user be allowed to do this specific thing." That's still a human question.
