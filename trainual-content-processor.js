// trainual-processor.js
const axios = require('axios');
require('dotenv').config();

// Trainual API configuration
const TRAINUAL_API_KEY = process.env.TRAINUAL_API_KEY;
const TRAINUAL_BASE_URL = 'https://api.trainual.com/v1';

/**
 * Fetches content from Trainual
 * @param {number} subjectId - The Trainual subject ID
 * @returns {Object} - Subject content from Trainual
 */
async function getTrainualContent(subjectId) {
  try {
    // Get subject details
    const subjectResponse = await axios.get(`${TRAINUAL_BASE_URL}/subjects/${subjectId}`, {
      headers: {
        'Authorization': `Bearer ${TRAINUAL_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    // Get steps (pages) for this subject
    const stepsResponse = await axios.get(`${TRAINUAL_BASE_URL}/subjects/${subjectId}/steps`, {
      headers: {
        'Authorization': `Bearer ${TRAINUAL_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    // For each step, get the content
    const stepsWithContent = await Promise.all(
      stepsResponse.data.data.map(async (step) => {
        const stepId = step.id;
        const stepContentResponse = await axios.get(`${TRAINUAL_BASE_URL}/steps/${stepId}`, {
          headers: {
            'Authorization': `Bearer ${TRAINUAL_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        
        return {
          ...step,
          content: stepContentResponse.data.data.content
        };
      })
    );
    
    return {
      subject: subjectResponse.data.data,
      steps: stepsWithContent
    };
  } catch (error) {
    console.error('Error fetching Trainual content:', error);
    throw new Error(`Failed to fetch Trainual content: ${error.message}`);
  }
}

/**
 * Extracts plain text from HTML content
 * @param {string} htmlContent - HTML content
 * @returns {string} - Plain text
 */
function extractTextFromHTML(htmlContent) {
  // Simple HTML tag removal (in a production app, use a proper HTML parser)
  return htmlContent
    .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
    .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .trim();
}

/**
 * Processes Trainual content into structured SOP data
 * @param {Object} trainualData - Raw Trainual data
 * @returns {Object} - Structured SOP data
 */
function extractSOPFromTrainual(trainualData) {
  const { subject, steps } = trainualData;
  
  // Use the subject title as the SOP title
  const title = subject.title;
  
  // Convert steps to SOP steps
  const sopSteps = steps.map(step => {
    // Extract plain text from HTML content
    const plainTextContent = extractTextFromHTML(step.content);
    
    // Split text into sentences for actions
    // This is a simple approach - in production, use NLP for better results
    const sentences = plainTextContent
      .split(/\.(?=\s|$)/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
    
    return {
      step: `Step ${step.position}: ${step.title}`,
      actions: sentences
    };
  });
  
  return {
    title: `${title} Standard Operating Procedure (SOP)`,
    steps: sopSteps
  };
}

/**
 * Main function to process Trainual content into SOP data
 * @param {number} subjectId - Trainual subject ID
 * @returns {Object} - Structured SOP data
 */
async function processTrainualToSOP(subjectId) {
  try {
    // Get Trainual content
    const trainualContent = await getTrainualContent(subjectId);
    
    // Extract SOP data
    const sopData = extractSOPFromTrainual(trainualContent);
    
    return sopData;
  } catch (error) {
    console.error('Error processing Trainual to SOP:', error);
    throw new Error(`Failed to process Trainual to SOP: ${error.message}`);
  }
}

module.exports = {
  processTrainualToSOP,
  getTrainualContent,
  extractTextFromHTML,
  extractSOPFromTrainual
};