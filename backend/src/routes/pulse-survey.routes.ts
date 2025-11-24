import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get available surveys to complete
router.get('/available', async (req: AuthRequest, res: Response) => {
  try {
    const availableSurveys = [
      {
        id: 1,
        title: 'Q1 Team Communication Assessment',
        description: 'Quick team communication assessment',
        ends_at: new Date('2025-11-30T17:00:00').toISOString(),
        is_active: true,
        is_anonymous: true
      }
    ];
    res.json(availableSurveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available surveys' });
  }
});

// Get surveys created by current user
router.get('/my-surveys', async (req: AuthRequest, res: Response) => {
  try {
    const mySurveys = [
      {
        id: 1,
        title: 'Q1 Team Communication Assessment',
        description: 'Quick team communication assessment',
        response_count: 24,
        completion_rate: 68,
        is_active: true,
        is_expired: false,
        created_at: new Date().toISOString(),
        ends_at: new Date('2025-11-30T17:00:00').toISOString()
      }
    ];
    res.json(mySurveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch my surveys' });
  }
});

// Get recent survey responses
router.get('/recent-responses', async (req: AuthRequest, res: Response) => {
  try {
    const recentResponses = [
      {
        id: 1,
        survey_id: 1,
        user_id: 1,
        submitted_at: new Date().toISOString(),
        survey: {
          title: 'Q1 Team Communication Assessment',
          is_anonymous: true
        },
        user: {
          first_name: 'John',
          last_name: 'Doe'
        }
      }
    ];
    res.json(recentResponses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent responses' });
  }
});

// Launch one-click survey
router.post('/one-click-survey', async (req: AuthRequest, res: Response) => {
  try {
    const newSurvey = {
      id: Date.now(),
      title: `Team Pulse - ${new Date().toLocaleDateString()}`,
      description: 'Quick team communication assessment',
      created_by_id: req.user?.id,
      created_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      is_active: true,
      is_anonymous: true
    };
    
    res.json({
      success: true,
      message: 'One-click survey launched successfully!',
      survey_url: `/pulse-survey/view/${newSurvey.id}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to launch one-click survey' 
    });
  }
});

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const availableSurveys = [
      {
        id: 1,
        title: 'Q1 Team Communication Assessment',
        description: 'Quick team communication assessment',
        ends_at: new Date('2025-11-25T17:00:00')
      }
    ];

    const mySurveys = [
      {
        id: 1,
        title: 'Q1 Team Communication Assessment',
        response_count: 24,
        completion_rate: 68,
        is_active: true,
        is_expired: false
      }
    ];

    const recentResponses = [
      {
        id: 1,
        survey_id: 1,
        survey_title: 'Q1 Team Communication Assessment',
        respondent: 'Anonymous',
        submitted_at: '11/23/2025 02:30 PM'
      }
    ];

    res.json({
      availableSurveys,
      mySurveys,
      recentResponses
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey dashboard data' });
  }
});

router.get('/surveys', async (req: Request, res: Response) => {
  try {
    const surveys = [
      {
        id: 1,
        title: 'Q1 Team Communication Assessment',
        description: 'Quick team communication assessment',
        is_active: true,
        created_at: new Date()
      }
    ];
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

router.get('/surveys/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const survey = {
      id: parseInt(id),
      title: 'Q1 Team Communication Assessment',
      description: 'Quick team communication assessment',
      is_anonymous: true,
      is_active: true,
      created_at: new Date(),
      ends_at: new Date('2025-11-25T17:00:00')
    };
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

router.post('/surveys', async (req: Request, res: Response) => {
  try {
    const { title, description, duration_hours, target_department, is_anonymous } = req.body;
    
    const newSurvey = {
      id: Date.now(),
      title,
      description,
      duration_hours,
      target_department,
      is_anonymous,
      created_at: new Date(),
      is_active: true
    };
    
    res.status(201).json(newSurvey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

router.post('/surveys/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const responses = req.body;
    
    res.json({
      success: true,
      message: 'Survey response submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit survey response' });
  }
});

router.get('/surveys/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const results = {
      survey: {
        id: parseInt(id),
        title: 'Q1 Team Communication Assessment',
        is_active: true,
        is_expired: false
      },
      totalResponses: 24,
      completionRate: 68,
      questions: {
        q1: {
          question: 'How clear is communication within your team?',
          type: 'scale',
          labels: ['Very Unclear', 'Unclear', 'Neutral', 'Clear', 'Very Clear'],
          scores: [2, 3, 5, 10, 4],
          total_responses: 24,
          average: 3.5
        }
      }
    };
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey results' });
  }
});

router.post('/one-click-survey', async (req: Request, res: Response) => {
  try {
    const newSurvey = {
      id: Date.now(),
      title: 'Quick Team Pulse Survey',
      is_active: true,
      created_at: new Date()
    };
    
    res.json({
      success: true,
      message: 'Survey launched successfully',
      survey_url: `/pulse-survey/view/${newSurvey.id}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to launch one-click survey' });
  }
});

export default router;
