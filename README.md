# RecipeAI 🍳

A cross-platform mobile and web application built with React Native and Expo that uses Google's Gemini AI to generate personalized recipe suggestions based on user search queries.

## ✨ Features

- **🤖 AI-Powered Recipe Generation**: Leverages Google's Gemini AI to create personalized recipes
- **🔍 Smart Search**: Intelligent recipe search with natural language queries
- **❤️ Favorites Management**: Save and organize your favorite recipes
- **📱 Cross-Platform**: Works on iOS, Android, and Web
- **💾 Offline Support**: Smart caching for previously searched recipes
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **AI**: Google Gemini AI
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **State Management**: Custom store implementation
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Google AI Studio account for Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Toda160/Recipe-AI.git
   cd Recipe-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Gemini API key to `.env`:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## 📱 Usage

1. **Search for Recipes**: Use natural language to describe what you want to cook
2. **View Details**: Tap on any recipe card to see full instructions and ingredients
3. **Save Favorites**: Heart icon to save recipes you love
4. **Browse History**: Access your previously searched recipes

## 📂 Project Structure

```
app/
├── _layout.tsx          # Root layout and navigation
├── index.tsx            # Home screen with search and favorites
├── recipe-details.tsx   # Detailed recipe view
└── search-results.tsx   # Search results display

components/
├── RecipeCard.tsx       # Recipe card component
└── SearchBar.tsx        # Search input component

services/
└── recipeService.ts     # Gemini AI integration

store/
├── favorites.ts         # Favorites management
├── searchQuery.ts       # Search state
├── searchResults.ts     # Results caching
└── selectedRecipe.ts    # Current recipe state

types/
└── Recipe.ts           # Recipe type definitions
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ Important**: Never commit your `.env` file to version control. The `.gitignore` file is configured to exclude it.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Made with ❤️ and powered by Google Gemini AI