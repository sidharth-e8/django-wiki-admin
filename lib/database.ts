import { createClient } from '@libsql/client';

// Database configuration - Using provided Turso credentials
const client = createClient({
  url: 'libsql://ai-wiki-sidhu.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTI4MTQ5MzgsImlkIjoiNjNhN2U5ZjItMzkzOS00OTM2LWEzZGEtYTIzYWNkNzJiOGU5IiwicmlkIjoiYTE0ODJhNmUtMmI3Yi00Njc1LThmYTktMDhlOTUwMzUzNjliIn0.zYc6CaCgNqfwsYtNTeqfwFUKTj8w8hcxUqcDjVyNTrREQBhAnFaIsM83_r8KI1UeJ0FRTzvOgdS5T0e8-LTACg',
});

// Database schema types
export interface Project {
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

export interface PromptUsage {
  id: string;
  project_id: string | null;
  question: string;
  response_length: number;
  model_used: string;
  tokens_used: number;
  created_at: string;
  ip_address: string | null;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create projects table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        settings_module TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        markdown_content TEXT,
        html_content TEXT,
        diagram_content TEXT,
        models_count INTEGER DEFAULT 0,
        serializers_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0
      )
    `);

    // Create prompt_usage table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS prompt_usage (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        question TEXT NOT NULL,
        response_length INTEGER DEFAULT 0,
        model_used TEXT NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `);

    // Create indexes for better performance
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_prompt_usage_created_at ON prompt_usage(created_at)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_prompt_usage_project_id ON prompt_usage(project_id)
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Project operations
export async function createOrUpdateProject(projectData: {
  name: string;
  path: string;
  settings_module: string;
  markdown_content: string;
  html_content: string;
  diagram_content: string;
  models_count: number;
  serializers_count: number;
  views_count: number;
}): Promise<Project> {
  const projectId = generateId();
  
  try {
    // Check if project exists by path
    const existingProject = await client.execute({
      sql: 'SELECT * FROM projects WHERE path = ?',
      args: [projectData.path]
    });

    if (existingProject.rows.length > 0) {
      // Update existing project
      await client.execute({
        sql: `
          UPDATE projects 
          SET name = ?, settings_module = ?, markdown_content = ?, 
              html_content = ?, diagram_content = ?, models_count = ?, 
              serializers_count = ?, views_count = ?, updated_at = CURRENT_TIMESTAMP
          WHERE path = ?
        `,
        args: [
          projectData.name,
          projectData.settings_module,
          projectData.markdown_content,
          projectData.html_content,
          projectData.diagram_content,
          projectData.models_count,
          projectData.serializers_count,
          projectData.views_count,
          projectData.path
        ]
      });

      // Return updated project
      const updatedProject = await client.execute({
        sql: 'SELECT * FROM projects WHERE path = ?',
        args: [projectData.path]
      });

      return updatedProject.rows[0] as any;
    } else {
      // Create new project
      await client.execute({
        sql: `
          INSERT INTO projects (
            id, name, path, settings_module, markdown_content, 
            html_content, diagram_content, models_count, 
            serializers_count, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          projectId,
          projectData.name,
          projectData.path,
          projectData.settings_module,
          projectData.markdown_content,
          projectData.html_content,
          projectData.diagram_content,
          projectData.models_count,
          projectData.serializers_count,
          projectData.views_count
        ]
      });

      // Return new project
      const newProject = await client.execute({
        sql: 'SELECT * FROM projects WHERE id = ?',
        args: [projectId]
      });

      return newProject.rows[0] as any;
    }
  } catch (error) {
    console.error('Error creating/updating project:', error);
    throw error;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const result = await client.execute('SELECT * FROM projects ORDER BY updated_at DESC');
    return result.rows as any[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [id]
    });
    return result.rows[0] as any || null;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

// Prompt usage operations
export async function recordPromptUsage(usageData: {
  project_id?: string;
  question: string;
  response_length: number;
  model_used: string;
  tokens_used: number;
  ip_address?: string;
}): Promise<void> {
  try {
    await client.execute({
      sql: `
        INSERT INTO prompt_usage (
          id, project_id, question, response_length, 
          model_used, tokens_used, ip_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        generateId(),
        usageData.project_id || null,
        usageData.question,
        usageData.response_length,
        usageData.model_used,
        usageData.tokens_used,
        usageData.ip_address || null
      ]
    });
  } catch (error) {
    console.error('Error recording prompt usage:', error);
    throw error;
  }
}

export async function getUsageStats(): Promise<{
  total_prompts: number;
  total_tokens: number;
  prompts_today: number;
  prompts_this_week: number;
  prompts_this_month: number;
  top_models: Array<{ model: string; count: number }>;
}> {
  try {
    // Total prompts and tokens
    const totalStats = await client.execute(`
      SELECT 
        COUNT(*) as total_prompts,
        SUM(tokens_used) as total_tokens
      FROM prompt_usage
    `);

    // Prompts today
    const todayStats = await client.execute(`
      SELECT COUNT(*) as prompts_today
      FROM prompt_usage 
      WHERE DATE(created_at) = DATE('now')
    `);

    // Prompts this week
    const weekStats = await client.execute(`
      SELECT COUNT(*) as prompts_this_week
      FROM prompt_usage 
      WHERE created_at >= DATE('now', '-7 days')
    `);

    // Prompts this month
    const monthStats = await client.execute(`
      SELECT COUNT(*) as prompts_this_month
      FROM prompt_usage 
      WHERE created_at >= DATE('now', 'start of month')
    `);

    // Top models
    const modelStats = await client.execute(`
      SELECT model_used as model, COUNT(*) as count
      FROM prompt_usage 
      GROUP BY model_used 
      ORDER BY count DESC 
      LIMIT 5
    `);

    return {
      total_prompts: Number(totalStats.rows[0]?.total_prompts || 0),
      total_tokens: Number(totalStats.rows[0]?.total_tokens || 0),
      prompts_today: Number(todayStats.rows[0]?.prompts_today || 0),
      prompts_this_week: Number(weekStats.rows[0]?.prompts_this_week || 0),
      prompts_this_month: Number(monthStats.rows[0]?.prompts_this_month || 0),
      top_models: modelStats.rows.map(row => ({
        model: String(row.model),
        count: Number(row.count)
      }))
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    throw error;
  }
}

// Utility function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export { client };
