import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ status: 'error', error: 'Failed to fetch health status' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Django AI Wiki API</title>
        <meta name="description" content="API server for Django AI Wiki chat functionality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ 
        padding: '2rem', 
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          🤖 Django AI Wiki API
        </h1>
        
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          This is the API server for Django AI Wiki chat functionality. 
          It provides secure endpoints for processing documentation questions using OpenAI.
        </p>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Available Endpoints</h2>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><code>POST /api/chat</code> - Process documentation questions</li>
            <li><code>GET /api/health</code> - Health check and configuration status</li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={checkHealth}
            disabled={loading}
            style={{
              background: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Checking...' : 'Check API Health'}
          </button>
        </div>

        {status && (
          <div style={{
            background: status.status === 'ok' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${status.status === 'ok' ? '#c3e6cb' : '#f5c6cb'}`,
            color: status.status === 'ok' ? '#155724' : '#721c24',
            padding: '1rem',
            borderRadius: '6px'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>API Status</h3>
            <pre style={{ 
              margin: 0, 
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ 
          marginTop: '3rem', 
          padding: '1.5rem',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>Setup Instructions</h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
            <li>Copy <code>.env.example</code> to <code>.env</code></li>
            <li>Add your OpenAI API key to <code>OPENAI_API_KEY</code></li>
            <li>Optionally set <code>API_KEY</code> for additional security</li>
            <li>Run <code>npm run dev</code> to start the development server</li>
          </ol>
        </div>
      </main>
    </>
  );
}
