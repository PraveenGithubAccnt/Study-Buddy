const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🤖 GET AI EXPLANATION
const getAIExplanation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query, difficulty = 'beginner' } = req.body;
    const userId = req.user.userId; // From auth middleware

    console.log(`🤖 AI Explanation requested by user ${userId}: "${query}"`);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create prompt based on difficulty level
    let prompt;
    switch (difficulty) {
      case 'advanced':
        prompt = `Provide an advanced explanation of "${query}" including:
1. Technical concepts and terminology
2. Complex examples and applications
3. In-depth analysis or derivations
4. Advanced connections to other topics
5. 3 challenging practice questions
Limit to 500 words.`;
        break;
      
      case 'intermediate':
        prompt = `Explain "${query}" at an intermediate level:
1. Clear explanation with some technical details
2. Practical examples and applications
3. Step-by-step process if applicable
4. Key concepts and relationships
5. 3 moderate practice questions
Limit to 450 words.`;
        break;
      
      default: // beginner
        prompt = `Explain the topic "${query}" in this way:
1. Start with a very simple explanation as if teaching a beginner.
2. Give 1-2 real-world or subject-related examples.
3. Provide a step-by-step breakdown (if it's a process).
4. Summarize the key points in under 5 bullet notes.
5. End with 2 practice questions (without answers).
Limit total explanation to about 400 words.`;
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    // Log the successful request
    console.log(`✅ AI explanation generated successfully for: "${query}"`);

    res.status(200).json({
      success: true,
      message: 'AI explanation generated successfully',
      data: {
        query,
        difficulty,
        explanation,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI explanation error:', error);
    
    // Handle specific Google AI errors
    if (error.message.includes('API_KEY')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error'
      });
    }
    
    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI explanation'
    });
  }
};

// 💬 AI CHAT (for conversational learning)
const aiChat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, context = '', chatHistory = [] } = req.body;
    const userId = req.user.userId;

    console.log(`💬 AI Chat request from user ${userId}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build conversation context
    let conversationPrompt = `You are a helpful educational AI tutor. `;
    
    if (context) {
      conversationPrompt += `Current topic context: ${context}. `;
    }

    // Add chat history for context
    if (chatHistory.length > 0) {
      conversationPrompt += `Previous conversation:\n`;
      chatHistory.forEach((entry, index) => {
        conversationPrompt += `${entry.role}: ${entry.content}\n`;
      });
    }

    conversationPrompt += `\nStudent question: ${message}\n\nProvide a helpful, educational response that encourages learning. Keep responses concise but informative (under 300 words).`;

    const result = await model.generateContent(conversationPrompt);
    const response = result.response.text();

    console.log(`✅ AI chat response generated`);

    res.status(200).json({
      success: true,
      message: 'AI chat response generated',
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
};

// 📚 GENERATE STUDY NOTES
const generateStudyNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { topic, subject, noteType = 'summary' } = req.body;
    const userId = req.user.userId;

    console.log(`📚 Study notes requested: ${topic} (${noteType})`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt;
    switch (noteType) {
      case 'detailed':
        prompt = `Create detailed study notes for "${topic}" in ${subject}:
1. Comprehensive explanation with all key concepts
2. Important formulas or definitions
3. Multiple examples and applications
4. Common mistakes to avoid
5. Connection to other topics
Format as structured notes with clear headings.`;
        break;
      
      case 'flashcards':
        prompt = `Create flashcard-style study material for "${topic}" in ${subject}:
Generate 8-10 question-answer pairs covering key concepts.
Format as:
Q: [Question]
A: [Concise Answer]
Focus on important facts, definitions, and concepts.`;
        break;
      
      default: // summary
        prompt = `Create concise study notes for "${topic}" in ${subject}:
1. Key concepts and definitions
2. Important points to remember
3. Quick examples
4. Summary in bullet points
Keep it concise but comprehensive for quick review.`;
    }

    const result = await model.generateContent(prompt);
    const notes = result.response.text();

    console.log(`✅ Study notes generated for: ${topic}`);

    res.status(200).json({
      success: true,
      message: 'Study notes generated successfully',
      data: {
        topic,
        subject,
        noteType,
        notes,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Generate study notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate study notes'
    });
  }
};

module.exports = {
  getAIExplanation,
  aiChat,
  generateStudyNotes
};