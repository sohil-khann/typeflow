import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = 'AIzaSyA5tGZTnS1h4b3xE8Sg09ygZMAppHOlAgA';
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generate practice text based on user's level
 * @param {string} level - beginner, intermediate, or advanced
 * @param {number} wordCount - approximate number of words to generate
 * @returns {Promise<string>} - generated practice text
 */
export const generatePracticeText = async (level, wordCount = 50) => {
  try {
    console.log('generatePracticeText called with level:', level, 'wordCount:', wordCount);
    const prompt = `Generate a typing practice text that is approximately ${wordCount} words long.
    The text should be at ${level} level difficulty.
    For beginner: Use simple vocabulary and short sentences.
    For intermediate: Use moderate vocabulary and varied sentence structures.
    For advanced: Use complex vocabulary, technical terms, and challenging sentence structures.
    The text should be coherent and educational. Do not include any formatting, just plain text.`;

    console.log('Sending prompt to Gemini API:', prompt);
    const result = await model.generateContent(prompt);
    console.log('Received result from Gemini API:', result);
    const response = await result.response;
    const text = response.text();
    
    console.log('Generated text length:', text.length);
    return text.trim();
  } catch (error) {
    console.error('Detailed error in generatePracticeText:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

/**
 * Generate personalized feedback based on typing session results
 * @param {Object} sessionData - data from the typing session
 * @returns {Promise<Object>} - feedback object with analysis and suggestions
 */
export const generateSessionFeedback = async (sessionData) => {
  try {
    const {
      wpm,
      accuracy,
      errors,
      difficulty,
      mode,
      duration,
      textLength,
      charsTyped
    } = sessionData;

    // Create a detailed prompt for the AI
    const prompt = `Analyze this typing practice session and provide personalized feedback:
    - WPM (Words Per Minute): ${wpm}
    - Accuracy: ${accuracy}%
    - Difficulty level: ${difficulty}
    - Mode: ${mode}
    - Duration: ${duration / 1000} seconds
    - Characters typed: ${charsTyped} out of ${textLength}
    - Common errors: ${JSON.stringify(errors)}

    Please provide:
    1. A brief analysis of the performance
    2. Three specific suggestions for improvement
    3. Recommended exercises based on the error patterns
    4. An encouraging message

    Format the response as a JSON object with these keys: analysis, suggestions, recommendedExercises, encouragement`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, return a structured object with the raw text
      console.error('Error parsing AI feedback:', parseError);
      return {
        analysis: 'Analysis not available in structured format.',
        suggestions: ['Practice regularly', 'Focus on accuracy before speed', 'Take short breaks'],
        recommendedExercises: ['Basic finger positioning exercises', 'Common letter combinations practice'],
        encouragement: 'Keep practicing and you will see improvement!',
        rawResponse: text
      };
    }
  } catch (error) {
    console.error('Error generating session feedback:', error);
    throw error;
  }
};

/**
 * Generate AI-powered typing challenges based on user's history
 * @param {Array} sessionHistory - array of previous typing sessions
 * @returns {Promise<string>} - customized typing challenge
 */
export const generateCustomChallenge = async (sessionHistory) => {
  try {
    // Extract patterns from session history
    const commonErrors = sessionHistory.reduce((acc, session) => {
      session.errors.forEach(error => {
        if (!acc[error.character]) {
          acc[error.character] = 0;
        }
        acc[error.character]++;
      });
      return acc;
    }, {});
    
    // Find the most problematic characters
    const problematicChars = Object.entries(commonErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Calculate average WPM and accuracy
    const avgWpm = sessionHistory.reduce((sum, session) => sum + session.wpm, 0) / sessionHistory.length;
    const avgAccuracy = sessionHistory.reduce((sum, session) => sum + session.accuracy, 0) / sessionHistory.length;
    
    const prompt = `Create a custom typing challenge paragraph that focuses on improving these specific areas:
    - Problematic characters: ${problematicChars.join(', ')}
    - Current average WPM: ${avgWpm.toFixed(1)}
    - Current average accuracy: ${avgAccuracy.toFixed(1)}%
    
    The challenge should be approximately 100-150 characters long, be coherent and meaningful, and include a higher frequency of the problematic characters. Make it challenging but achievable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating custom challenge:', error);
    throw error;
  }
};