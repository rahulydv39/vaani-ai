from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import subprocess
import uuid
import os
import re
import asyncio

from pydantic import BaseModel
from llama_cpp import Llama
from piper.voice import PiperVoice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp", exist_ok=True)
os.makedirs("temp/audio", exist_ok=True)
app.mount("/audio", StaticFiles(directory="temp/audio"), name="audio")


tts_model_path = "/Users/rahulkumar/llama.cpp/on-device-language-tutor/backend/models/tts/en_US-lessac-medium.onnx"
print(f"Loading TTS model from {tts_model_path}...")
try:
    piper_voice = PiperVoice.load(tts_model_path)
except Exception as e:
    print(f"Failed to load TTS model: {e}")
    piper_voice = None

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

def clean_text_for_tts(text: str) -> str:
    # Remove markdown
    text = re.sub(r'[*_]', '', text)
    # Remove emojis and other special characters that Piper might struggle with
    text = re.sub(r'[^\w\s.,?!;:$\'\"-]', '', text)
    return text.strip()

class TTSRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str

@app.post("/tts")
async def generate_tts(request: TTSRequest):
    if not piper_voice:
        return {"error": "TTS model not loaded", "audio_url": None}
    
    clean_text = clean_text_for_tts(request.text)
    filename = f"{uuid.uuid4()}.wav"
    output_path = f"/tmp/audio/{filename}"
    
    try:
        piper_voice.synthesize(clean_text, output_path)
        return {"audio_url": f"http://127.0.0.1:8000/audio/{filename}"}
    except Exception as e:
        print(f"TTS Synthesis error: {e}")
        return {"error": str(e), "audio_url": None}

def generate_tutor_response(user_text: str) -> dict:
    prompt = f"""
You are a spoken English teacher for a Hindi speaker.

User said in Hindi:
{user_text}

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
    output_text = output["choices"][0]["text"].strip()
    
    audio_url = None
    if piper_voice:
        english_match = re.search(r"English:\s*(.*?)(?=\nHindi:|\Z)", output_text, re.IGNORECASE | re.DOTALL)
        next_match = re.search(r"Next:\s*(.*?)(?=\Z|\n)", output_text, re.IGNORECASE | re.DOTALL)
        
        text_to_speak = ""
        if english_match:
            text_to_speak += english_match.group(1).strip() + ". "
        if next_match:
            text_to_speak += next_match.group(1).strip()
            
        if not text_to_speak:
            text_to_speak = output_text
            
        clean_audio_text = clean_text_for_tts(text_to_speak)
        
        filename = f"{uuid.uuid4()}.wav"
        output_path = f"temp/audio/{filename}"
        
        try:
            piper_voice.synthesize(clean_audio_text, output_path)
            audio_url = f"http://127.0.0.1:8000/audio/{filename}"
        except Exception as e:
            print(f"TTS generation error: {e}")

    return {"response": output_text, "audio_url": audio_url}

@app.post("/voice-chat")
async def voice_chat(file: UploadFile = File(...)):
    print("STT request received")
    audio_bytes = await file.read()
    print(f"audio size: {len(audio_bytes)}")

    os.makedirs("temp", exist_ok=True)
    input_path = f"temp/input_{uuid.uuid4()}.webm"
    wav_path = f"temp/output_{uuid.uuid4()}.wav"

    with open(input_path, "wb") as f:
        f.write(audio_bytes)
        
    print(f"Saved file to {input_path}")

    try:
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-i", input_path,
            "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav_path
        ]
        subprocess.run(ffmpeg_cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True, timeout=10)
        print("FFmpeg conversion successful")

        whisper_cmd = [
            "/Users/rahulkumar/llama.cpp/on-device-language-tutor/whisper.cpp/build/bin/whisper-cli",
            "-m", "/Users/rahulkumar/llama.cpp/on-device-language-tutor/whisper.cpp/models/ggml-small.bin",
            "-f", wav_path,
            "-l", "auto",
            "-nt"
        ]
        print(f"Running whisper command: {' '.join(whisper_cmd)}")
        
        print("transcription started")
        result = subprocess.run(whisper_cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL, check=True, timeout=60)
        
        hindi_text = result.stdout.strip()
        print(f"Whisper output: {hindi_text}")

        if not hindi_text:
            return {"error": "I could not hear you clearly. Please speak again."}

        # Blocking Synchronous LLM Generation
        response_dict = generate_tutor_response(hindi_text)
        return response_dict

    except subprocess.TimeoutExpired as e:
        print(f"STT process timed out: {e}")
        return {"error": "Speech processing took too long. Please try again."}
    except subprocess.CalledProcessError as e:
        print(f"Subprocess error. stdout: {e.stdout}, stderr: {e.stderr}")
        return {"error": "Audio processing failed. Please try again."}
    except Exception as e:
        print(f"STT Exception: {e}")
        return {"error": f"STT Exception: {str(e)}"}
    finally:
        # Delete temp files after transcription
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except Exception as cleanup_err:
                print(f"Failed to delete {input_path}: {cleanup_err}")
        if os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception as cleanup_err:
                print(f"Failed to delete {wav_path}: {cleanup_err}")

@app.post("/chat")
async def chat(req: ChatRequest):
    return generate_tutor_response(req.message)