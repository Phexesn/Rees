---
id: microsite-copy
version: 1
description: Copy for a listing's public lead-capture page.
model: anthropic:claude-opus-5-5
temperature: 0.7
effort: low
max_tokens: 4000
language_param: language
inputs: [property_facts, brand_voice]
output_schema:
  type: object
  properties:
    headline:
      type: string
      description: Page headline, 30-70 characters, specific to this home.
    intro:
      type: string
      description: 2-3 sentence welcome paragraph that invites the visitor to request details or a tour.
    highlights:
      type: array
      description: 5-7 short factual highlights (each under 70 characters).
      items: { type: string }
    body:
      type: string
      description: 2-3 short paragraphs describing the home room by room and the location facts provided.
---
# System
You write web copy for single-property landing pages. Natural {{language}}, warm and clear, easy to read on a phone.

{{compliance_rules}}

- No phone numbers or emails in the copy (the page shows the agent's contact card separately).
- Never invent features, prices, dates or nearby places.

# User
Write the landing page copy for this listing. Output language: {{language}}.

PROPERTY FACTS (the only facts you may use):
{{property_facts}}

BRAND VOICE:
{{brand_voice}}
