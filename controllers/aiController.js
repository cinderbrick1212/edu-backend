const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Tutor Endpoint (Proxy to Gemini)
exports.askTutor = async (req, res) => {
  const { question, context } = req.body; // context = "thermodynamics", "vectors", etc.

  if (!question) {
    return res.status(400).json({ success: false, error: 'Question required' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are "Professor CollegeBase", an expert AI tutor for BTech students, specifically helping those in Delhi. 
    Context: ${context || 'General Studies'}.
    
    Student asks: "${question}"
    
    Provide a structured, encouraging response. If the question is about engineering, use simple analogies.
    If context is provided, tailor your response to that subject.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const tutorResponse = response.text();

  res.json({
    answer: tutorResponse,
    question,
    context,
  });
};
