// loom-processor.js
const axios = require('axios');
require('dotenv').config();

// Loom API configuration
const LOOM_API_KEY = process.env.LOOM_API_KEY;

/**
 * Fetches video details and transcript from Loom
 * @param {string} videoId - The Loom video ID
 * @returns {Object} - Video details and transcript
 */
async function getLoomVideoContent(videoId) {
  try {
    // Get video details
    const videoResponse = await axios.get(`https://api.loom.com/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${LOOM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get transcript
    const transcriptResponse = await axios.get(`https://api.loom.com/v1/videos/${videoId}/transcript`, {
      headers: {
        'Authorization': `Bearer ${LOOM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      videoDetails: videoResponse.data,
      transcript: transcriptResponse.data
    };
  } catch (error) {
    console.error('Error fetching Loom video content:', error);
    throw new Error(`Failed to fetch Loom video content: ${error.message}`);
  }
}

/**
 * Processes transcript into structured information
 * @param {Object} transcriptData - Raw transcript data
 * @returns {Object} - Structured transcript with segments and key points
 */
function processTranscript(transcriptData) {
  // Extract the actual transcript text
  const { transcript } = transcriptData;
  
  if (!transcript || !transcript.items || transcript.items.length === 0) {
    return { text: '', segments: [] };
  }
  
  // Concatenate all text items into full transcript
  const fullText = transcript.items
    .map(item => item.text)
    .join(' ');
  
  // Create time-based segments (group by ~30 second chunks)
  const segments = [];
  let currentSegment = { startTime: 0, text: '' };
  
  transcript.items.forEach(item => {
    const startTime = parseFloat(item.start_time);
    
    // Start a new segment every ~30 seconds
    if (startTime - currentSegment.startTime > 30 && currentSegment.text.length > 0) {
      segments.push({ ...currentSegment });
      currentSegment = { startTime, text: item.text + ' ' };
    } else {
      currentSegment.text += item.text + ' ';
    }
  });
  
  // Add the last segment
  if (currentSegment.text.length > 0) {
    segments.push(currentSegment);
  }
  
  return {
    text: fullText,
    segments
  };
}

/**
 * Extracts structured SOP data from a processed transcript
 * @param {Object} processedTranscript - The processed transcript
 * @param {Object} videoDetails - Video metadata
 * @returns {Object} - Structured SOP data
 */
function extractSOPFromTranscript(processedTranscript, videoDetails) {
  const { text, segments } = processedTranscript;
  
  // Use the video title as the SOP title
  const title = videoDetails.name;
  
  // Identify potential steps in the transcript
  const stepRegex = /step\s*\d+|step\s*[a-z]+|first\s*step|second\s*step|next\s*step|final\s*step/gi;
  const stepMatches = [...text.matchAll(stepRegex)];
  
  const steps = [];
  let currentStep = null;
  
  // If we found step indicators, use them to structure the content
  if (stepMatches.length > 0) {
    // For each step match, find the text until the next step
    stepMatches.forEach((match, index) => {
      const stepStart = match.index;
      const nextMatch = stepMatches[index + 1];
      const stepEnd = nextMatch ? nextMatch.index : text.length;
      
      // Extract the step text
      const stepText = text.substring(stepStart, stepEnd).trim();
      
      // Find the first sentence as the step title
      const sentenceEnd = stepText.indexOf('. ');
      const stepTitle = sentenceEnd > 0 
        ? stepText.substring(0, sentenceEnd + 1) 
        : stepText;
      
      // Extract actions (remaining sentences)
      const actionsText = sentenceEnd > 0 
        ? stepText.substring(sentenceEnd + 1).trim() 
        : '';
      
      // Split actions by periods and filter empty strings
      const actions = actionsText
        .split('.')
        .map(action => action.trim())
        .filter(action => action.length > 0);
      
      steps.push({
        step: stepTitle,
        actions
      });
    });
  } else {
    // If no clear step structure, try to divide by segments or paragraphs
    let segmentsToUse = segments.length > 0 ? segments : [{ text }];
    
    steps.push({
      step: "Step 1: Process Overview",
      actions: segmentsToUse
        .map(segment => segment.text.trim())
        .filter(text => text.length > 0)
    });
  }
  
  return {
    title: `${title} Standard Operating Procedure (SOP)`,
    steps
  };
}

/**
 * Main function to process a Loom video into SOP data
 * @param {string} videoId - Loom video ID
 * @returns {Object} - Structured SOP data
 */
async function processLoomVideoToSOP(videoId) {
  try {
    // Get video content and transcript
    const videoContent = await getLoomVideoContent(videoId);
    
    // Process transcript
    const processedTranscript = processTranscript(videoContent.transcript);
    
    // Extract SOP data
    const sopData = extractSOPFromTranscript(
      processedTranscript, 
      videoContent.videoDetails
    );
    
    return sopData;
  } catch (error) {
    console.error('Error processing Loom video to SOP:', error);
    throw new Error(`Failed to process Loom video to SOP: ${error.message}`);
  }
}

module.exports = {
  processLoomVideoToSOP,
  getLoomVideoContent,
  processTranscript,
  extractSOPFromTranscript
};