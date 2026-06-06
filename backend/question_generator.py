from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_questions(game_name: str, amount: int = 10):
    prompt = f"""Generate {amount} multiple choice trivia questions about the video game "{game_name}".
    
Return ONLY a JSON array with no extra text. Each question must follow this exact format:
[
  {{
    "text": "question here",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_index": 0
  }}
]

correct_index is the index (0-3) of the correct answer in the options array."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    questions = json.loads(content)
    return questions
