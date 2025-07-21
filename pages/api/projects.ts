import { NextApiRequest, NextApiResponse } from 'next';
import { getAllProjects, createOrUpdateProject, getProjectById, initializeDatabase } from '../../lib/database';

// Configure API to handle larger request bodies (up to 10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Initialize database on first request
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization error:', error);
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all projects or specific project
      const { id } = req.query;
      
      if (id && typeof id === 'string') {
        const project = await getProjectById(id);
        if (!project) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }
        res.status(200).json(project);
      } else {
        const projects = await getAllProjects();
        res.status(200).json(projects);
      }
    } else if (req.method === 'POST') {
      // Create or update project
      const {
        name,
        path,
        settings_module,
        markdown_content,
        html_content,
        diagram_content,
        models_count,
        serializers_count,
        views_count
      } = req.body;

      // Validate required fields
      if (!name || !path || !settings_module) {
        res.status(400).json({ 
          error: 'Missing required fields: name, path, settings_module' 
        });
        return;
      }

      const project = await createOrUpdateProject({
        name,
        path,
        settings_module,
        markdown_content: markdown_content || '',
        html_content: html_content || '',
        diagram_content: diagram_content || '',
        models_count: models_count || 0,
        serializers_count: serializers_count || 0,
        views_count: views_count || 0
      });

      res.status(200).json(project);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Projects API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
