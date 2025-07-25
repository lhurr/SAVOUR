# SAVOUR 🍽️

> Find your next go-to grub with SAVOUR by BiteDunce

---

![SAVOUR Logo](./assets/SAVOUR_LOGO.jpeg)

## Table of Contents

- [SAVOUR 🍽️](#savour-️)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Features](#features)
  - [Demo](#demo)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend (AI Agent)](#backend-ai-agent)
    - [Database \& Infrastructure](#database--infrastructure)
  - [Local Setup](#local-setup)
  - [Unit Testing](#unit-testing)
    - [Frontend Testing](#frontend-testing)
    - [Test Configuration](#test-configuration)

---

## About
Tired of visiting the same restaurants and cafes? Struggling to decide what and where to eat next?

SAVOUR is here to fix that with a mobile application that utilises a powerful recommendation engine to take the guesswork out of choosing where to eat. Whether you're hunting for a hidden gem, the latest foodie hotspot, or an Insta-worthy café, SAVOUR effortlessly discovers and recommends your next favorite spot based on your budget, dietary needs, and location.

---

## Features

- **Personalized Restaurant Recommendation**  
  Get recommended restaurants based on your proximity and preferences with matching and analysis algorithms

- **Unravel Top Rated & Trendy Spots**  
  Quickly unearth the highest-rated restaurants and the trendiest new openings in town.

- **Comprehensive Filters**  
  Narrow down options by vegan, vegetarian, gluten-free, or any custom dietary restriction, and stay within your budget.

---

## Demo
TBC

---

## Tech Stack

### Frontend
- **React Native** with **Expo** - Mobile development
- **Expo Router** - File-based routing for React Native
- **NativeWind** - Tailwind CSS for React Native
- **React Native Maps** - Map integration with OpenStreetMap

### Backend (AI Agent)
- **LangGraph** - Agent orchestration framework
- **Google Gemini** - Advanced language model
- **FastAPI** - High-performance web framework
- **Redis** - Caching and session management
- **Supabase Edge Functions + OpenAI API** - For vector embeddings under recsys

### Database & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Real-time)
- **PostgreSQL** - Primary database with Row Level Security (RLS)
- **Supabase Auth** - Authentication and user management



---

## Local Setup

Follow these steps to set up SAVOUR on your local machine:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lhurr/SAVOUR.git
   cd SAVOUR      
   ```

2. **Fetch API Keys**
   Get the following API keys:
   - Supabase credentials
   - GEMINI_API_KEY (Gemini API key)

3. **Set Up Environment Variables**
   - Copy the `.env.example` file to create a new `.env` file
   ```bash
   cp .env.example .env
   ```
   - Open the `.env` file and fill in the Supabase API keys 

4. **To Run (ensure Docker is installed)**
   ```bash
   docker-compose up
   ```

5. **Requirements**
   - Node
   - Python 3.11

6. **Start the Development Server**
   This will open the Expo development server where you can:
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Scan the QR code with your phone (requires Expo Go app)
   - Press `w` to open in web browser

---

## Unit Testing

The backend uses **pytest** with comprehensive mocking for external dependencies.

```bash
# Navigate to backend directory
cd backend

# Install test dependencies
pip install -e ".[dev]"

# Set environment variable 
export GEMINI_API_KEY="your-api-key-here"

# Run all tests
python -m pytest tests/ -v

# Run with coverage report
python -m pytest tests/ -v --cov=src --cov-report=html --cov-report=term
```

**Backend Test Coverage:**
- FastAPI endpoints (`test_app.py`)
- Utility functions (`test_utils.py`)
- State management (`test_state.py`)
- Integration tests (`test_integration.py`)

### Frontend Testing

The frontend uses **Jest** with **React Native Testing Library** for component and hook testing.

```bash
# Navigate to mobile app directory
cd mobile-app

# Install test dependencies
npm install

# Run all tests
npm test
```

**Frontend Test Coverage:**
- React Native components
- Custom hooks (location, API calls)
- Database operations
- API service functions
- Screen navigation


### Test Configuration

**Backend Configuration:**
- `pytest.ini` - Test discovery and markers
- `conftest.py` - Shared fixtures and mocks
- `.env.test` - Test environment variables

**Frontend Configuration:**
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup and mocks


---

> Thank you for trying out SAVOUR, we appreciate any and all feedback!