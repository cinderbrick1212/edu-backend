const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Tutor Endpoint (Proxy to Gemini)
exports.askTutor = async (req, res) => {
  try {
    const { question, context } = req.body; // context = "thermodynamics", "vectors", etc.

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `You are an AI tutor for BTech CSE students. 
    Context: ${context || 'General Engineering'}.
    Provide clear, concise explanations with examples suitable for a first-year student.
    Avoid overly complex jargon unless explained.
    
    Question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tutorResponse = response.text();

    res.status(200).json({
      success: true,
      answer: tutorResponse,
      question,
      context,
    });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    res.status(500).json({ success: false, error: 'AI service error' });
  }
};
