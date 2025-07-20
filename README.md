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
- **OpenAI API** - Vector embeddings for recommendations

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


> Thank you for trying out SAVOUR, we appreciate any and all feedback!