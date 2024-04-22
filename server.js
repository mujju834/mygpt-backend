const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Store conversation history
let conversationHistory = [];

app.post('/chat', async (req, res) => {
  const { userInput } = req.body;

  // Append user input to the conversation history
  conversationHistory.push({ role: "user", content: userInput });

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: conversationHistory // Include the entire conversation history
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Append AI response to the conversation history
    const aiResponse = response.data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: aiResponse });

    res.json({ response: aiResponse });

    // Optionally, you can trim the conversation history if it gets too long
    // For example, keep only the last 10 exchanges
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
