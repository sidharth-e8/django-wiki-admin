import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Project {
  id: string;
  name: string;
  path: string;
  settings_module: string;
  created_at: string;
  updated_at: string;
  markdown_content: string;
  html_content: string;
  diagram_content: string;
  models_count: number;
  serializers_count: number;
  views_count: number;
}

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'markdown' | 'html' | 'diagram' | 'chat'>('overview');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects?id=${id}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      } else {
        console.error('Failed to load project');
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !project) return;

    setChatLoading(true);
    setChatResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: chatQuestion,
          docs: `${project.markdown_content}\n\n${project.diagram_content}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatResponse(data.answer);
      } else {
        setChatResponse('Sorry, there was an error processing your question.');
      }
    } catch (error) {
      setChatResponse('Sorry, there was an error connecting to the AI service.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: '#64748b' }}>Loading project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <div style={{ color: '#64748b' }}>Project not found</div>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: '1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.name} - Django AI Wiki</title>
        <meta name="description" content={`Documentation for ${project.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#f8fafc',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
            📁 {project.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Django project documentation
          </p>
          
          {/* Project Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {project.models_count}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Models</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {project.serializers_count}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Serializers</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {project.views_count}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Views</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {new Date(project.updated_at).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Last Updated</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {[
              { key: 'overview', label: '📋 Overview', icon: '📋' },
              { key: 'markdown', label: '📝 Markdown', icon: '📝' },
              { key: 'html', label: '🎨 HTML', icon: '🎨' },
              { key: 'diagram', label: '📊 Diagram', icon: '📊' },
              { key: 'chat', label: '💬 AI Chat', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  background: activeTab === tab.key ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Project Information</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#374151' }}>Path:</strong>
                    <div style={{ 
                      background: '#f3f4f6', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      fontFamily: 'monospace',
                      marginTop: '0.25rem'
                    }}>
                      {project.path}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Settings Module:</strong>
                    <div style={{ 
                      background: '#f3f4f6', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      fontFamily: 'monospace',
                      marginTop: '0.25rem'
                    }}>
                      {project.settings_module}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Created:</strong>
                    <div style={{ marginTop: '0.25rem', color: '#64748b' }}>
                      {new Date(project.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'markdown' && (
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Markdown Documentation</h3>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  maxHeight: '600px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {project.markdown_content || 'No markdown content available'}
                </div>
              </div>
            )}

            {activeTab === 'html' && (
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>HTML Documentation</h3>
                {project.html_content ? (
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <iframe
                      srcDoc={project.html_content}
                      style={{
                        width: '100%',
                        height: '600px',
                        border: 'none'
                      }}
                      title="HTML Documentation"
                    />
                  </div>
                ) : (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    No HTML content available
                  </div>
                )}
              </div>
            )}

            {activeTab === 'diagram' && (
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Entity Relationship Diagram</h3>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  maxHeight: '600px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {project.diagram_content || 'No diagram content available'}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>AI Chat Assistant</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Ask questions about this Django project's documentation
                </p>
                
                <form onSubmit={handleChatSubmit} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      placeholder="Ask about models, views, serializers..."
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatQuestion.trim()}
                      style={{
                        background: chatLoading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: chatLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      {chatLoading ? '⏳' : '💬'} Ask
                    </button>
                  </div>
                </form>

                {chatResponse && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}>
                    <h4 style={{ color: '#0369a1', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
                      🤖 AI Response:
                    </h4>
                    <div style={{ color: '#374151' }}>
                      {chatResponse}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
