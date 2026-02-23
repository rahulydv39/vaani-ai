from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uuid

from pydantic import BaseModel
from llama_cpp import Llama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = Llama(
    model_path="/Users/rahulkumar/llama.cpp/models/Phi-3-mini-4k-instruct-q4.gguf",
    n_gpu_layers=100,
    n_ctx=4096,
    n_threads=8,
    n_batch=512,
    verbose=False,
)

chat_history = []

class Prompt(BaseModel):
    message: str

SYSTEM_PROMPT = """
You are a friendly spoken English tutor for Hindi speakers.

The user will speak in Hindi.

Your job:
1. Understand the Hindi sentence
2. Convert it into natural daily spoken English
3. Teach the user how to say it

Reply in this format:

English sentence:
<short spoken English>

Hindi explanation:
<very simple Hindi explanation>

Speak this:
<repeat the English sentence>

Next question:
<ask something simple to continue conversation>

Rules:
- Focus on speaking English
- Keep sentences short
- Use daily life examples
- Be encouraging
"""

@app.post("/voice-chat")
async def voice_chat(file: UploadFile = File(...)):

    input_path = f"/tmp/{uuid.uuid4()}.mp3"
    wav_path = input_path.replace(".mp3", ".wav")

    with open(input_path, "wb") as f:
        f.write(await file.read())

    # Convert to WAV
    subprocess.run([
        "ffmpeg", "-y", "-i", input_path,
        "-ar", "16000", "-ac", "1", wav_path
    ], check=True)

    # Speech → text
    result = subprocess.run([
        "/Users/rahulkumar/llama.cpp/on-device-language-tutor/whisper.cpp/build/bin/whisper-cli",
        "-m", "/Users/rahulkumar/llama.cpp/on-device-language-tutor/whisper.cpp/models/ggml-medium.bin",
        "-f", wav_path,
        "-l", "hi"
    ], capture_output=True, text=True, check=True)

    hindi_text = result.stdout.strip()

    # LLM response
    prompt = f"""
You are a spoken English teacher for a Hindi speaker.

User said in Hindi:
{hindi_text}

Your task:
1. Give a natural English sentence the user can speak.
2. Give its simple Hindi meaning.
3. Ask ONE short follow-up question in English for conversation practice.

Rules:
- Keep it short
- No explanations
- Output in this exact format

English:
Hindi:
Next:
"""

    output = llm(prompt, max_tokens=200)

    return {"response": output["choices"][0]["text"]}
 

 