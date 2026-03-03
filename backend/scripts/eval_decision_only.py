from support_agent.decision import decision_layer

def evaluate_decision_only(test_cases):
    correct_retrieval = 0
    total_retrieval = 0
    correct_escalation = 0
    false_escalations = 0
    total = len(test_cases)

    for case in test_cases:
        decision = decision_layer(case["text"])

        predicted_escalation = decision["escalate"]
        expected_escalate = case["should_escalate"]

        if predicted_escalation == expected_escalate:
            correct_escalation += 1
        if predicted_escalation and not expected_escalate:
            false_escalations += 1

        if not predicted_escalation:
            total_retrieval += 1
            predicted_policy = decision["policy"]["policy_id"]
            if predicted_policy == case["expected_policy"]:
                correct_retrieval += 1

    print("Retrieval Accuracy (non-escalated):", correct_retrieval / total_retrieval if total_retrieval else 0)
    print("Coverage:", total_retrieval / total)
    print("Escalation Accuracy:", correct_escalation / total)
    print("False Escalation Rate:", false_escalations / total)

def evaluate_decision_only_multi(test_cases):
    correct_retrieval = 0
    total_retrieval = 0
    correct_escalation = 0
    false_escalations = 0
    total = len(test_cases)

    for case in test_cases:
        decision = decision_layer(case["text"])

        predicted_escalation = decision["escalate"]
        expected_escalate = case["should_escalate"]

        if predicted_escalation == expected_escalate:
            correct_escalation += 1
        if predicted_escalation and not expected_escalate:
            false_escalations += 1

        if not predicted_escalation:
            total_retrieval += 1
            predicted_policy = decision["policy"]["policy_id"]
            expected_policies = case.get("expected_policies", [])
            if predicted_policy in expected_policies:
                correct_retrieval += 1

    print("Multi Retrieval Accuracy (non-escalated):", correct_retrieval / total_retrieval if total_retrieval else 0)
    print("Multi Coverage:", total_retrieval / total)
    print("Multi Escalation Accuracy:", correct_escalation / total)
    print("Multi False Escalation Rate:", false_escalations / total)
