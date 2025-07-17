import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Types
interface ChatRequest {
  question: string;
  docs: string;
}

interface ChatResponse {
  answer: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// Constants - Reduced for Groq's free tier limits
const MAX_TOKENS = 4000;  // Reduced from 10000
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_QUESTION_LENGTH = 500;  // Reduced from 1000
const MAX_DOCS_LENGTH = 15000; // Reduced from 50000 (~3k tokens)

// Initialize Groq client (OpenAI-compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Utility functions
function logRequest(question: string, ip?: string) {
  const timestamp = new Date().toISOString();
  const truncatedQuestion = question.length > 100 ? question.substring(0, 100) + '...' : question;
  console.log(`[${timestamp}] Chat request from ${ip || 'unknown'}: "${truncatedQuestion}"`);
}

function validateApiKey(req: NextApiRequest): boolean {
  const projectApiKey = process.env.API_KEY;
  if (!projectApiKey) return true; // Skip validation if no project API key is set
  
  const providedKey = req.headers['x-api-key'];
  return providedKey === projectApiKey;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Smart truncation - keep important sections
  const lines = text.split('\n');
  let result = '';
  let currentLength = 0;

  // Prioritize sections with headers (##, ###, etc.)
  const importantLines = lines.filter(line =>
    line.startsWith('#') ||
    line.includes('**') ||
    line.includes('Model') ||
    line.includes('Field') ||
    line.includes('Serializer') ||
    line.includes('View')
  );

  // Add important lines first
  for (const line of importantLines) {
    if (currentLength + line.length > maxLength * 0.8) break;
    result += line + '\n';
    currentLength += line.length + 1;
  }

  // Fill remaining space with other content
  for (const line of lines) {
    if (currentLength + line.length > maxLength) break;
    if (!importantLines.includes(line)) {
      result += line + '\n';
      currentLength += line.length + 1;
    }
  }

  return result + '\n\n[Content truncated to fit token limits...]';
}

function validateInput(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object' };
  }

  const { question, docs } = body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return { isValid: false, error: 'Question is required and must be a non-empty string' };
  }

  if (!docs || typeof docs !== 'string' || docs.trim().length === 0) {
    return { isValid: false, error: 'Documentation content is required and must be a non-empty string' };
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return { isValid: false, error: `Question too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed` };
  }

  return { isValid: true };
}

async function generateAnswer(question: string, docs: string): Promise<string> {
  // Truncate docs if too long
  const truncatedDocs = truncateText(docs, MAX_DOCS_LENGTH);

  const systemPrompt = `You are an AI assistant specialized in explaining Django REST API projects.
You have been provided with comprehensive documentation about a Django project including models, serializers, views, and relationships.

Your task is to answer questions about this specific Django project based ONLY on the provided documentation.

Guidelines:
- Be accurate and specific to the provided documentation
- If the documentation doesn't contain enough information to answer the question, say so clearly
- Use technical terms appropriately but explain complex concepts clearly
- Reference specific models, fields, or relationships when relevant
- If asked about code implementation, provide practical examples when possible
- Keep responses concise but comprehensive

The documentation includes:
- Django models with fields, relationships, and methods
- DRF serializers with field configurations
- Views and ViewSets with their functionality
- Database relationships and constraints`;

  const userPrompt = `Based on the following Django project documentation, please answer this question:

Question: ${question}

Documentation:
${truncatedDocs}`;

  try {
    // Use Llama 3.1 8B Instant (best for free tier - faster and lower token usage)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.5,  // Reduced temperature for more focused responses
    }, {
      timeout: REQUEST_TIMEOUT,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
  } catch (error: any) {
    console.warn('Llama 3.1 8B failed, falling back to Gemma:', error.message);

    try {
      // Fallback to Gemma 7B (even smaller model)
      const completion = await groq.chat.completions.create({
        model: 'gemma-7b-it',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.5,
      }, {
        timeout: REQUEST_TIMEOUT,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    } catch (fallbackError: any) {
      console.error('Both Groq models failed:', fallbackError);
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse>
) {
  // Set CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    // Validate Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY environment variable is not set');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Validate project API key if configured
    if (!validateApiKey(req)) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Validate input
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error! });
      return;
    }

    const { question, docs }: ChatRequest = req.body;
    
    // Log the request
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logRequest(question, Array.isArray(clientIp) ? clientIp[0] : clientIp);

    // Generate answer using OpenAI
    const answer = await generateAnswer(question, docs);

    // Return successful response
    res.status(200).json({ answer });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Return appropriate error response
    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
      res.status(504).json({
        error: 'Request timeout. Please try again with a shorter question or documentation.'
      });
    } else if (error.message.includes('rate limit') || error.code === 'rate_limit_exceeded') {
      res.status(429).json({
        error: 'Rate limit exceeded. Your documentation is too large for the free tier. Please try with a smaller Django project or upgrade your Groq plan.'
      });
    } else if (error.message.includes('Request too large') || error.message.includes('tokens per minute')) {
      res.status(413).json({
        error: 'Documentation too large. Please try with a smaller Django project or break your question into smaller parts.'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}
