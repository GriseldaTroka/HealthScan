// src/services/aiService.js

// Vendos çelësin këtu (placeholder) – mos e commit me vlerë reale.
// Preferohet variabla e ambientit EXPO_PUBLIC_OPENAI_API_KEY nese eshte e vendosur.
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'vendos celsin ketu';

// Analyze ingredients from scanned product
export const analyzeIngredients = async (imageBase64, healthConditions) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'vendos celsin ketu') {
    throw new Error('OpenAI API key mungon. Vendos çelësin te aiService.js ose përdor variabla ambienti.');
  }

  try {
    const conditionsList = healthConditions?.map(c => c.name).join(', ') || 'None specified';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are a food ingredient analyzer. Analyze the image showing product ingredients and return a valid JSON response with this exact structure:

{
  "productName": "name of the product if visible, otherwise 'Unknown Product'",
  "ingredients": [
    { "name": "ingredient name", "safe": true or false }
  ],
  "overallSafe": true or false,
  "warnings": ["warning message 1", "warning message 2"]
}

IMPORTANT RULES:
1. Extract ALL ingredients visible in the image
2. The user has these health conditions: ${conditionsList}
3. Mark ingredient "safe": false if it conflicts with user's conditions:
   - "Gluten Free" condition -> wheat, gluten, barley, rye, oats, flour (unless gluten-free) = UNSAFE
   - "Lactose Free" condition -> milk, lactose, dairy, cheese, cream, butter, whey = UNSAFE
   - "Nut Allergy" condition -> peanuts, almonds, walnuts, cashews, hazelnuts, pistachios, any tree nuts = UNSAFE
   - "Low Sodium" condition -> if salt/sodium is high in ingredients = UNSAFE
   - "Diabetic" condition -> sugar, glucose, fructose, corn syrup, high fructose corn syrup = UNSAFE
   - "Vegan" condition -> meat, fish, eggs, dairy, honey, gelatin, animal products = UNSAFE

4. Set "overallSafe": false if ANY ingredient is unsafe
5. Add specific warnings explaining why certain ingredients are unsafe
6. You must respond in valid JSON format`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read and analyze all ingredients shown in this image. Check each ingredient against my health conditions and tell me if this product is safe for me to consume.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 402) {
        throw new Error('OpenAI account has no credits. Please add payment method at platform.openai.com/account/billing');
      } else {
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API returned an error');
    }

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response received from AI');
    }

    console.log('[AI Response]', content); // Debug log

    // Parse JSON from response - with response_format json_object, it should be pure JSON
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // Fallback: try to extract JSON from markdown or text
      let jsonString = content;
      
      if (content.includes('```json')) {
        jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.includes('```')) {
        jsonString = content.replace(/```\n?/g, '');
      }
      
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('[Parse Error] Raw content:', content);
        throw new Error('Could not find valid JSON in AI response');
      }

      result = JSON.parse(jsonMatch[0]);
    }

    if (!result.ingredients || !Array.isArray(result.ingredients)) {
      throw new Error('Invalid response format - missing ingredients array');
    }

    return {
      productName: result.productName || 'Unknown Product',
      ingredients: result.ingredients,
      overallSafe: result.overallSafe ?? result.ingredients.every(i => i.safe),
      warnings: result.warnings || [],
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try scanning again.');
    }
    throw error;
  }
};

// Generate recipes based on shelf products
export const generateRecipes = async (shelfProducts, healthConditions) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'vendos celsin ketu') {
    throw new Error('OpenAI API key mungon. Vendos çelësin te aiService.js ose përdor variabla ambienti.');
  }

  try {
    const productNames = shelfProducts.map(p => p.productName).join(', ');
    const conditionsList = healthConditions?.map(c => c.name).join(', ') || 'None';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a creative chef and recipe generator. Based on the products the user has, generate creative recipes IN ALBANIAN.

The user has these health conditions: ${conditionsList}

IMPORTANT: Generate recipes that are SAFE for these conditions. Return ONLY valid JSON with this structure:

{
  "recipes": [
    {
      "name": "Emri i Recetes",
      "description": "Përshkrim i shkurtër në shqip",
      "time": "30 min",
      "difficulty": "E Lehtë/E Mesme/E Vështirë",
      "servings": 4,
      "ingredients": ["përbërës 1", "përbërës 2"],
      "steps": ["hapi 1", "hapi 2"],
      "healthTags": ["Pa Gluten", "Pak Kripë"],
      "imagePrompt": "përshkrim detajuar për gjenerimin e imazhit"
    }
  ]
}

Rules:
1. Generate 3-5 creative recipes IN ALBANIAN
2. Use ingredients from: ${productNames}
3. Add common ingredients that complement the products
4. Make sure ALL recipes are safe for: ${conditionsList}
5. Include detailed imagePrompt for each recipe (describe the final dish appearance)
6. Return ONLY the JSON, no markdown or explanations
7. ALL TEXT MUST BE IN ALBANIAN LANGUAGE`
          },
          {
            role: 'user',
            content: `Gjenero recetat krijuese dhe të sigurta duke përdorur këto produkte: ${productNames} (të gjitha në shqip)`
          }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to generate recipes');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response received from AI');
    }

    // Parse JSON
    let jsonString = content;
    if (content.includes('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.includes('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }
    
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find valid JSON in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.recipes || !Array.isArray(result.recipes)) {
      throw new Error('Invalid response format - missing recipes array');
    }

    return result.recipes;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse recipe response. Please try again.');
    }
    throw error;
  }
};

// Generate image for a recipe using DALL-E
export const generateRecipeImage = async (imagePrompt, recipeName) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'vendos celsin ketu') {
    throw new Error('OpenAI API key mungon. Vendos çelësin te aiService.js ose përdor variabla ambienti.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional food photography of ${recipeName}: ${imagePrompt}. High quality, appetizing, well-lit, realistic, on a clean white plate.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Image generation error:', errorData);
      // Return null instead of throwing - we can show recipe without image
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;

  } catch (error) {
    console.log('Failed to generate image:', error);
    return null; // Return null if image generation fails
  }
};