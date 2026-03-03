from .groq_client import client

def classify_complaint(text):
    prompt = f"""
You are a complaint classifier.

Classify the complaint into one of:
- food_spoiled
- food_tampered
- late_delivery
- wrong_item

Return JSON only in this format:
{{
  "category": "",
  "confidence": 0.0
}}

Complaint:
{text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a strict JSON-only classifier."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content


def generate_response(user_text, policy_content):

    prompt = f"""
You are an automated customer support agent.

You MUST strictly follow the policy below.
Do NOT invent rules or compensation outside this policy.
If the complaint requires escalation according to the policy, set escalate to true.

Policy:
{policy_content}

Customer Complaint:
{user_text}

Return JSON only:
{{
  "response_text": "",
  "action_taken": "",
  "escalate": false
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You output strict JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content
