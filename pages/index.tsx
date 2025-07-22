import Head from 'next/head';
import { useState, useEffect } from 'react';

interface Stats {
  total_prompts: number;
  total_tokens: number;
  prompts_today: number;
  prompts_this_week: number;
  prompts_this_month: number;
  top_models: Array<{ model: string; count: number }>;
}

interface Project {
  id: string;
  name: string;
  path: string;
  settings_module: string;
  created_at: string;
  updated_at: string;
  models_count: number;
  serializers_count: number;
  views_count: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats and projects in parallel
      const [statsResponse, projectsResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/projects')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Django AI Wiki Dashboard</title>
        <meta name="description" content="Dashboard for Django AI Wiki usage and project management" />
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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
            🤖 Django AI Wiki Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Monitor usage statistics and manage your Django documentation projects
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Usage Statistics */}
            {stats && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                  📊 Usage Statistics
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.total_prompts.toLocaleString()}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Prompts</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.total_tokens.toLocaleString()}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Tokens</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.prompts_today}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Today</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.prompts_this_week}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>This Week</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    color: '#374151',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{stats.prompts_this_month}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>This Month</div>
                  </div>
                </div>

                {stats.top_models.length > 0 && (
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.2rem' }}>
                      🤖 Most Used AI Models
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {stats.top_models.map((model, index) => (
                        <div key={model.model} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f',
                              color: 'white',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>
                              {model.model}
                            </span>
                          </div>
                          <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            {model.count.toLocaleString()} uses
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Projects Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.8rem' }}>
                  📁 Django Projects ({projects.length})
                </h2>
                <button
                  onClick={loadDashboardData}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>

              {projects.length === 0 ? (
                <div style={{
                  background: 'white',
                  padding: '3rem',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No Projects Yet</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Run <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      aiwiki generate --target . --settings your.settings
                    </code> in your Django project to get started.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => window.location.href = `/project/${project.id}`}
                      style={{
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{project.name}</h3>
                        <span style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          Active
                        </span>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          📁 {project.path}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                          ⚙️ {project.settings_module}
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.5rem' }}>{project.models_count}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Models</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem' }}>{project.serializers_count}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Serializers</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.5rem' }}>{project.views_count}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Views</div>
                        </div>
                      </div>

                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        Updated: {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
