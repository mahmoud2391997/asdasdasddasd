/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeacherProfile {
  name: string;
  gender: 'male' | 'female';
  studentGender: 'male' | 'female' | 'both';
  subject: string;
  stage: 'elementary' | 'intermediate' | 'secondary';
  plan: 'basic' | 'pro' | 'expert';
  lessonsUsed: number;
  lessonsLimit: number;
}

export interface LessonContent {
  id: string;
  grade: string;
  semester: string;
  unit: string;
  title: string;
  content: string; // book context
  lesson_order: number;
}

export interface EducationalRule {
  subject: string;
  stage: 'elementary' | 'intermediate' | 'secondary';
  allowed: string[];
  forbidden: string[];
  systemInstructions: string;
}

export interface GeneratedLesson {
  id: string;
  lessonTitle: string;
  subject: string;
  stage: string;
  grade: string;
  teacherName: string;
  teacherGender: 'male' | 'female';
  studentGender: 'male' | 'female' | 'both';
  introduction: string;
  objectives: string[];
  activities: string[];
  assessment: string[];
  values: string[];
  score: number; // Quality Score
  validationReport: {
    objectivesMatched: boolean;
    genderAligned: boolean;
    withinBookScope: boolean;
    rulesAdhered: boolean;
    scoreDetails: {
      alignment: number;
      quality: number;
      pedagogy: number;
      integrity: number;
    };
    logs: string[];
  };
  createdAt: string;
}

export interface SystemMetrics {
  totalPrepared: number;
  totalTokensUsed: number;
  estimatedCost: number;
  apiSuccessRate: number;
  rateLimitLimit: number;
  rateLimitRemaining: number;
  activeWorkerJobs: number;
  deadLetterQueueCount: number;
}
