require('dotenv').config();
const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

(async () => {
  try {
    const res = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say exactly: Groq LLM is working perfectly!' }],
      max_tokens: 20
    });
    console.log('✅ SUCCESS:', res.choices[0].message.content);
  } catch (e) {
    console.error('❌ FAILED:', e.message);
  }
})();
