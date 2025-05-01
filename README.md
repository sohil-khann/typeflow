# TypeFlow

![TypeFlow Logo](public/arrow-icon.svg)

TypeFlow is a modern typing practice application designed to help users improve their typing speed and accuracy through interactive exercises and real-time feedback.

## Live Demo

Access the live application at: [https://typeflow-ddhyv.web.app](https://typeflow-ddhyv.web.app)

## Features

- **Multiple Difficulty Levels**: Practice with beginner, intermediate, and advanced typing exercises
- **Real-time Feedback**: Get instant feedback on typing speed, accuracy, and errors
- **AI-Generated Content**: Practice with AI-generated text (powered by Google's Gemini API)
- **User Authentication**: Create an account to track your progress over time
- **Performance Analytics**: View detailed statistics about your typing performance
- **Responsive Design**: Enjoy a seamless experience across desktop and mobile devices
- **Dark Mode Support**: Choose between light and dark themes for comfortable typing

## Technologies Used

- **Frontend**: React 19, React Router, Chart.js
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI Integration**: Google Generative AI (Gemini)
- **Build Tool**: Vite

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for deployment)

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/sohil-khann/typeflow.git
   cd typeflow
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

1. Create a production build
   ```
   npm run build
   ```

2. Preview the production build locally
   ```
   npm run preview
   ```

### Deployment

The application is deployed using Firebase Hosting:

1. Install Firebase CLI (if not already installed)
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase
   ```
   firebase login
   ```

3. Initialize Firebase in your project
   ```
   firebase init hosting
   ```

4. Deploy to Firebase
   ```
   firebase deploy --only hosting
   ```

## Project Structure

```
typeflow/
├── public/               # Static assets
├── src/
│   ├── assets/           # Application assets
│   ├── components/       # React components
│   │   ├── analytics/    # Analytics components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── typing/       # Typing interface components
│   ├── firebase/         # Firebase configuration
│   ├── services/         # Service integrations
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── .firebase/            # Firebase cache
├── .github/              # GitHub workflows
├── firebase.json         # Firebase configuration
├── index.html            # HTML entry point
└── vite.config.js        # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Google Generative AI](https://ai.google.dev/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/)
