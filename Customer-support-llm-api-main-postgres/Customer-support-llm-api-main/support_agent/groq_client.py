import os
from groq import Groq

# Set GROQ_API_KEY in your environment before running:
# export GROQ_API_KEY="..."
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
