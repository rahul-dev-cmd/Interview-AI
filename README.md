# InterviewAI 🤖

> AI-powered adaptive interview practice platform that simulates real tech interviews, coaches you in real time, and generates detailed performance reports.

---

## 🎯 What Is InterviewAI?

InterviewAI helps software engineers and students **practice technical interviews** in a realistic, pressure-free environment. You configure your interview (role, difficulty, topic), chat with an AI interviewer, and receive an instant coaching report — all in your browser.

**Why it's useful:**
- 🧠 Adaptive questions that follow your answers, just like a real interview
- ⚡ Instant feedback after every response — no waiting days for results
- 📊 End-of-session performance report covering communication, accuracy, and confidence
- 🔁 Unlimited practice — same tech, different questions every time

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend    | FastAPI (Python)                                |
| AI / LLM   | OpenRouter API → Gemini 2.0 Flash               |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- An [OpenRouter](https://openrouter.ai/) API key (free to create)

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/rahul-dev-cmd/interviewai.git
cd interviewai
```

---

### Step 2 — Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Start the backend server:

```bash
python main.py
```

✅ Backend runs at `http://localhost:8000`

---

### Step 3 — Frontend Setup (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs at `http://localhost:3000`

---

### Step 4 — Get Your API Key

1. Go to [openrouter.ai](https://openrouter.ai/) and sign up (free)
2. Navigate to **API Keys** and create a new key
3. Paste it into `backend/.env` as shown above

---

## 📁 Project Structure

```
interviewai/
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── setup/
│       │   │   └── page.tsx    # Interview configuration (role, difficulty, topic)
│       │   ├── interview/
│       │   │   └── page.tsx    # Live interview chat interface
│       │   └── report/
│       │       └── page.tsx    # Post-interview performance report
│       └── components/
│           └── Navbar.tsx      # Shared navigation bar
│
├── backend/                    # FastAPI server
│   ├── main.py                 # API routes and LLM integration
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # API keys (never commit this)
│
└── README.md
```

---

## 🗺️ App Flow

```
Landing Page → Interview Setup → Live Interview Chat → Performance Report
    (/)           (/setup)           (/interview)          (/report)
```

---

## ⚙️ Environment Variables

| Variable             | Location        | Description                        |
|----------------------|-----------------|------------------------------------|
| `OPENROUTER_API_KEY` | `backend/.env`  | Your OpenRouter API key            |

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

---

## 🛣️ Roadmap

- [ ] Voice input support
- [ ] Resume-based question generation
- [ ] Multi-round interview sessions
- [ ] Leaderboard & progress tracking

---

## 👤 Author

Built with ❤️ by **Rahul Dev**
[GitHub](https://github.com/rahul-dev-cmd) · [LinkedIn](https://linkedin.com/in/rahul-s-dev)