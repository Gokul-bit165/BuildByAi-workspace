'use server';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

function extractJson(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

export async function generateProjectPlan(description: string) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: "You are a project manager for a student dev agency. Break this project into 4-6 phases with 3-6 tasks each. Return JSON only. The JSON structure should be: { \"phases\": [ { \"name\": string, \"description\": string, \"tasks\": string[] } ] }",
      messages: [
        { role: 'user', content: description }
      ],
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJson(textContent);
    return parsed || { phases: [] };
  } catch (error) {
    console.error('Error generating project plan:', error);
    return { phases: [] };
  }
}

export async function generateClientUpdate(projectData: any) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: "Write a friendly, professional client update paragraph based on this project data. 150 words max.",
      messages: [
        { role: 'user', content: JSON.stringify(projectData, null, 2) }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Error generating client update:', error);
    return 'We encountered an error generating the update.';
  }
}

export async function summarizeStandups(standups: any[]) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: "Summarize what this dev team is working on today based on their standups. 3 short paragraphs.",
      messages: [
        { role: 'user', content: JSON.stringify(standups, null, 2) }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Error summarizing standups:', error);
    return 'We encountered an error summarizing the standups.';
  }
}

export async function answerProjectQuestion(question: string, projectData: any) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: "You are an AI assistant inside a project management tool. Answer concisely using the project data provided.",
      messages: [
        { role: 'user', content: `Project Data: ${JSON.stringify(projectData, null, 2)}\n\nQuestion: ${question}` }
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Error answering project question:', error);
    return 'We encountered an error answering your question.';
  }
}

export async function summarizeMeeting(notes: string) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: "Extract a summary and a list of action items from these meeting notes. Return JSON only. The JSON structure should be: { \"summary\": string, \"actionItems\": string[] }",
      messages: [
        { role: 'user', content: notes }
      ],
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJson(textContent);
    return parsed || { summary: '', actionItems: [] };
  } catch (error) {
    console.error('Error summarizing meeting:', error);
    return { summary: '', actionItems: [] };
  }
}
