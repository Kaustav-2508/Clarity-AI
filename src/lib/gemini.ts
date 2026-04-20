import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ExplanationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function detectSubject(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Classify the following student query into one of these subjects: Math, Programming, Physics, Chemistry, Biology, General. 
    Query: "${query}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING }
        },
        required: ["subject"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.subject;
  } catch (e) {
    return "General";
  }
}

export async function generateExplanation(query: string, mode: string, profile: any): Promise<ExplanationResult> {
  const grade = profile?.grade || 'unknown grade';
  const targetExams = profile?.goals?.targetExams?.join(', ') || 'general exams';

  const systemPrompt = `You are the Elite Clarity Neural Engine. 
  Your mission is to provide "Prestige" level educational clarity through first-principles reasoning.
  
  CORE DIRECTIVES:
  1. Deep Concept Thinking: Always explain the "Why" (first principles) before the "How".
  2. Recursive Logic: Connect the concept to foundational knowledge (e.g. connecting Calculus to Slope).
  3. Mental Sandbox Design: Create a simulation description where changing variables reveals the concept's boundaries.
  
  Student Context: Grade ${grade}, Target Exams: ${targetExams}.
  Learning Mode: ${mode}.
  
  REQUIRED OUTPUT FORMAT (STRICT JSON):
  {
    "thinking": "Pedagogical reasoning chain including first-principles derivation strategy.",
    "explanation": "Advanced Markdown explanation using Elite formatting.",
    "mentalModel": "A high-impact mental model or analogy.",
    "conceptMap": {
      "nodes": [{"id": "Name", "group": 1}],
      "links": [{"source": "A", "target": "B", "value": 1}]
    },
    "interactiveLab": {
      "title": "Mental Sandbox",
      "description": "Simulation instructions.",
      "variables": ["Var1", "Var2"]
    },
    "relatedConcepts": ["Concept A", "Concept B"]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: query,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thinking: { type: Type.STRING },
          explanation: { type: Type.STRING },
          mentalModel: { type: Type.STRING },
          conceptMap: {
            type: Type.OBJECT,
            properties: {
              nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, group: { type: Type.NUMBER } } } },
              links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, value: { type: Type.NUMBER } } } }
            }
          },
          interactiveLab: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              variables: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          relatedConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["thinking", "explanation", "mentalModel", "conceptMap", "interactiveLab", "relatedConcepts"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
        thinking: "Error parsing elite explanation.",
        explanation: response.text,
        mentalModel: "N/A",
        conceptMap: { nodes: [], links: [] },
        interactiveLab: { title: "Error", description: "Format mismatch", variables: [] },
        relatedConcepts: []
    };
  }
}

export async function generatePracticeProblems(subject: string, difficulty: string, exam: string, profile: any) {
    const grade = profile?.grade || 'all levels';
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 practice problems for ${subject} at ${difficulty} level for a ${grade} student preparing for the ${exam} exam. 
      Output as a JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              subject: { type: Type.STRING }
            },
            required: ["id", "question", "correctAnswer", "explanation", "difficulty", "subject"]
          }
        }
      }
    });
  
    try {
      return JSON.parse(response.text);
    } catch (e) {
      return [];
    }
  }

export async function analyzeError(question: string, studentAnswer: string, correctApproach: string) {
    const prompt = `Student attempted this question: "${question}"
    Student's Answer: "${studentAnswer}"
    Correct Approach: "${correctApproach}"
    
    Perform an Error Analysis. Identify:
    1. Exact mistake location.
    2. Why it is wrong.
    3. Correct reasoning path.
    4. Tip to avoid this mistake in future.
    
    Output in a encouraging mentor tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text;
}

export async function generateSessionFeedback(results: any[], subject: string, exam: string, profile: any) {
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const avgTime = results.reduce((acc, r) => acc + r.timeSpent, 0) / (total || 1);

    const prompt = `Student finished a practice session.
    Subject: ${subject}
    Exam Type: ${exam}
    Score: ${correct}/${total}
    Average Time per Question: ${avgTime.toFixed(1)}s
    
    Student Profile: Grade ${profile?.grade}, Goals: ${profile?.goals?.type}.
    
    Provide an "Elite Session Retro". 
    1. Overall performance analysis.
    2. Speed-Accuracy trade-off insight.
    3. Specific focus areas for next session.
    4. A "Neural Growth" action item.
    
    Format in high-density professional markdown with glowing insights.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text;
}

export async function generateStudyPlan(profile: any) {
    const grade = profile?.grade || 'General';
    const goalType = profile?.goals?.type || 'learning';
    const targetExams = profile?.goals?.targetExams?.join(', ') || 'upcoming exams';

    const prompt = `Based on the following student profile, generate a weekly study plan with specific tasks.
    Grade: ${grade}
    Goals: ${goalType} (${targetExams})
    Weak Areas: ${profile?.weakAreas?.join(', ') || 'None identified'}
    
    Output as a JSON array of tasks. Each task should have: title, subject, dueDate (relative days from now, e.g. 1 for tomorrow).`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        dueDate: { type: Type.NUMBER }
                    },
                    required: ["title", "subject", "dueDate"]
                }
            }
        }
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        return [];
    }
}
