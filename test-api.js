#!/usr/bin/env node

/**
 * Test script for Django AI Wiki API
 * Run with: node test-api.js
 */

const API_BASE = 'http://localhost:3000';

// Sample Django documentation for testing
const sampleDocs = `
# Django Project Documentation

## Models

### User Model
- **Fields**: username (CharField), email (EmailField), is_active (BooleanField)
- **Relationships**: One-to-many with Post model

### Post Model  
- **Fields**: title (CharField), content (TextField), created_at (DateTimeField)
- **Relationships**: Foreign key to User (author)

## Serializers

### UserSerializer
- **Fields**: username, email
- **Read-only**: id, created_at

### PostSerializer
- **Fields**: title, content, author
- **Read-only**: id, created_at

## Views

### PostViewSet
- **Type**: ModelViewSet
- **Methods**: list, create, retrieve, update, destroy
- **Permissions**: IsAuthenticated
`;

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    console.log('✅ Health check passed');
    console.log('📊 Status:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testChatEndpoint() {
  console.log('\\n💬 Testing chat endpoint...');
  
  const testCases = [
    {
      name: 'Valid question',
      question: 'What models are available in this Django project?',
      docs: sampleDocs,
      expectSuccess: true
    },
    {
      name: 'Empty question',
      question: '',
      docs: sampleDocs,
      expectSuccess: false
    },
    {
      name: 'Missing docs',
      question: 'What models are available?',
      docs: '',
      expectSuccess: false
    },
    {
      name: 'Complex question',
      question: 'Explain the relationship between User and Post models and how to create a new post via the API',
      docs: sampleDocs,
      expectSuccess: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`\\n🧪 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: testCase.question,
          docs: testCase.docs
        })
      });

      const data = await response.json();
      
      if (testCase.expectSuccess && response.ok) {
        console.log('✅ Test passed');
        console.log('📝 Answer preview:', data.answer?.substring(0, 100) + '...');
      } else if (!testCase.expectSuccess && !response.ok) {
        console.log('✅ Test passed (expected failure)');
        console.log('❌ Error:', data.error);
      } else {
        console.log('❌ Test failed - unexpected result');
        console.log('📊 Response:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      if (testCase.expectSuccess) {
        console.error('❌ Test failed:', error.message);
      } else {
        console.log('✅ Test passed (expected network error)');
      }
    }
  }
}

async function testInvalidMethods() {
  console.log('\\n🚫 Testing invalid HTTP methods...');
  
  const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
  
  for (const method of methods) {
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: method
      });
      
      if (response.status === 405) {
        console.log(`✅ ${method} correctly rejected (405)`);
      } else {
        console.log(`❌ ${method} should return 405, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${method} test failed:`, error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Django AI Wiki API Tests\\n');
  console.log('📍 API Base URL:', API_BASE);
  console.log('⚠️  Make sure the development server is running (npm run dev)\\n');
  
  // Test health endpoint
  const healthPassed = await testHealthEndpoint();
  
  if (!healthPassed) {
    console.log('\\n❌ Health check failed. Make sure the server is running and configured properly.');
    process.exit(1);
  }
  
  // Test chat endpoint
  await testChatEndpoint();
  
  // Test invalid methods
  await testInvalidMethods();
  
  console.log('\\n🎉 All tests completed!');
  console.log('\\n💡 Next steps:');
  console.log('1. Set up your .env file with OPENAI_API_KEY');
  console.log('2. Test with real OpenAI integration');
  console.log('3. Deploy to your preferred platform');
}

// Run tests
runTests().catch(console.error);
