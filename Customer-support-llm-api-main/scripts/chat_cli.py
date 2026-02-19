from support_agent.agent import handle_complaint

# Prompt Testing
while True:
    text = input("Customer: ")
    if text.lower() in ["exit", "quit"]:
        break
    result = handle_complaint(text)
    print("System:", result)
