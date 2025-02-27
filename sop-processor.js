// sop-processor.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Processes multiple content sources into a unified SOP data structure
 * @param {Object} config - Configuration with content sources
 * @returns {Object} - Unified SOP data
 */
async function processContentSources(config) {
  const sopData = {};
  
  // Process Loom videos if loom-processor.js exists
  if (config.loom && config.loom.videos && config.loom.videos.length > 0) {
    try {
      const loomProcessor = require('./loom-processor');
      console.log(`Processing ${config.loom.videos.length} Loom videos...`);
      
      for (const video of config.loom.videos) {
        try {
          const videoSOP = await loomProcessor.processLoomVideoToSOP(video.id);
          
          // Create a key for this SOP (based on title or custom key)
          const key = video.key || createKeyFromTitle(videoSOP.title);
          
          sopData[key] = videoSOP;
          console.log(`Processed Loom video: ${videoSOP.title}`);
        } catch (error) {
          console.error(`Error processing Loom video ${video.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading Loom processor module:', error);
      console.log('Skipping Loom video processing...');
    }
  }
  
  // Process Trainual content if trainual-processor.js exists
  if (config.trainual && config.trainual.subjects && config.trainual.subjects.length > 0) {
    try {
      const trainualProcessor = require('./trainual-processor');
      console.log(`Processing ${config.trainual.subjects.length} Trainual subjects...`);
      
      for (const subject of config.trainual.subjects) {
        try {
          const subjectSOP = await trainualProcessor.processTrainualToSOP(subject.id);
          
          // Create a key for this SOP (based on title or custom key)
          const key = subject.key || createKeyFromTitle(subjectSOP.title);
          
          sopData[key] = subjectSOP;
          console.log(`Processed Trainual subject: ${subjectSOP.title}`);
        } catch (error) {
          console.error(`Error processing Trainual subject ${subject.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading Trainual processor module:', error);
      console.log('Skipping Trainual content processing...');
    }
  }
  
  // Process local files (for testing or additional sources)
  if (config.local && config.local.files && config.local.files.length > 0) {
    console.log(`Processing ${config.local.files.length} local files...`);
    
    for (const file of config.local.files) {
      try {
        const fileContent = await fs.readFile(file.path, 'utf8');
        const fileSOP = JSON.parse(fileContent);
        
        // Create a key for this SOP (based on title or custom key)
        const key = file.key || createKeyFromTitle(fileSOP.title);
        
        sopData[key] = fileSOP;
        console.log(`Processed local file: ${fileSOP.title}`);
      } catch (error) {
        console.error(`Error processing local file ${file.path}:`, error);
      }
    }
  }

  // If no data was loaded from any source, use sample data
  if (Object.keys(sopData).length === 0) {
    console.log('No SOP data was loaded from sources. Using sample data...');
    sopData.customer_onboarding = createSampleCustomerOnboardingSOP();
    sopData.refund_cancellation = createSampleRefundCancellationSOP();
    sopData.customer_support = createSampleCustomerSupportSOP();
    sopData.employee_onboarding = createSampleEmployeeOnboardingSOP();
    console.log('Sample SOPs created successfully.');
  }
  
  return sopData;
}

/**
 * Creates a URL-friendly key from a title
 * @param {string} title - The title
 * @returns {string} - URL-friendly key
 */
function createKeyFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')     // Remove special characters
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .replace(/_+/g, '_')         // Replace multiple underscores with a single one
    .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
}

/**
 * Saves processed SOP data to a JavaScript file
 * @param {Object} sopData - The processed SOP data
 * @param {string} outputPath - Path to save the file
 */
async function saveSOPDataToJsFile(sopData, outputPath) {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    const jsContent = `// Generated SOP data - ${new Date().toISOString()}
const sopData = ${JSON.stringify(sopData, null, 2)};

// Helper function to search through SOPs
function searchSOPs(query) {
  query = query.toLowerCase();
  const results = [];
  
  // Search through each SOP
  for (const [key, sop] of Object.entries(sopData)) {
    let relevance = 0;
    const title = sop.title.toLowerCase();
    
    // Check if query matches title
    if (title.includes(query)) {
      relevance += 5;
    }
    
    // Check steps and actions
    for (const step of sop.steps) {
      const stepText = step.step.toLowerCase();
      if (stepText.includes(query)) {
        relevance += 3;
      }
      
      for (const action of step.actions) {
        const actionText = action.toLowerCase();
        if (actionText.includes(query)) {
          relevance += 2;
        }
      }
    }
    
    if (relevance > 0) {
      results.push({
        key,
        sop,
        relevance
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results;
}`;
    
    await fs.writeFile(outputPath, jsContent, 'utf8');
    console.log(`SOP data saved to ${outputPath}`);
  } catch (error) {
    console.error('Error saving SOP data:', error);
    throw new Error(`Failed to save SOP data: ${error.message}`);
  }
}

/**
 * Sample data functions - these create basic SOPs when no sources are available
 */
function createSampleCustomerOnboardingSOP() {
  return {
    "title": "Customer Onboarding Standard Operating Procedure (SOP)",
    "steps": [
      {
        "step": "Step 1: Initial Contact",
        "actions": [
          "Greet the customer professionally.",
          "Confirm their details (name, email, company).",
          "Explain the onboarding process briefly."
        ]
      },
      {
        "step": "Step 2: Account Setup",
        "actions": [
          "Create a profile in the CRM.",
          "Assign an account manager.",
          "Provide login credentials."
        ]
      },
      {
        "step": "Step 3: Training & Support",
        "actions": [
          "Send a welcome email with training resources.",
          "Assign a dedicated support contact."
        ]
      },
      {
        "step": "Step 4: Follow-up & Feedback",
        "actions": [
          "Follow up within 7 days.",
          "Request feedback to improve the process."
        ]
      }
    ]
  };
}

function createSampleRefundCancellationSOP() {
  return {
    "title": "Refund & Cancellation Standard Operating Procedure (SOP)",
    "steps": [
      {
        "step": "Step 1: Eligibility Check",
        "actions": [
          "Refunds are only available within 30 days of purchase.",
          "Service-based fees (e.g., setup fees) are non-refundable."
        ]
      },
      {
        "step": "Step 2: Refund Process",
        "actions": [
          "Verify the purchase date and confirm refund eligibility.",
          "Submit a refund request in the billing system.",
          "Notify the customer that refunds take 5-7 business days to process."
        ]
      },
      {
        "step": "Step 3: Cancellation Requests",
        "actions": [
          "Customers must submit cancellation requests via email or support portal.",
          "Confirm the cancellation and provide final billing details.",
          "If applicable, offer alternatives (e.g., downgrade instead of canceling)."
        ]
      },
      {
        "step": "Step 4: Customer Confirmation",
        "actions": [
          "Send a final email confirming the refund/cancellation.",
          "Provide contact details in case of disputes."
        ]
      }
    ]
  };
}

function createSampleCustomerSupportSOP() {
  return {
    "title": "Customer Support Standard Operating Procedure (SOP)",
    "steps": [
      {
        "step": "Step 1: Receiving a Support Request",
        "actions": [
          "Greet the customer professionally.",
          "Ask for their name and account details.",
          "Identify the issue and categorize it as Low, Medium, or High priority."
        ]
      },
      {
        "step": "Step 2: Troubleshooting Process",
        "actions": [
          "If the issue is account-related, verify credentials and check the database.",
          "If it's a technical issue, escalate to the IT team via the internal ticket system.",
          "Provide an estimated resolution time."
        ]
      },
      {
        "step": "Step 3: Resolution & Follow-up",
        "actions": [
          "Confirm the issue is resolved before closing the ticket.",
          "Send a follow-up email within 48 hours.",
          "Collect customer feedback for quality improvement."
        ]
      }
    ]
  };
}

function createSampleEmployeeOnboardingSOP() {
  return {
    "title": "Employee Onboarding Standard Operating Procedure (SOP)",
    "steps": [
      {
        "step": "Step 1: Pre-boarding",
        "actions": [
          "Send a welcome email with job expectations and documents.",
          "Set up employee accounts (email, Slack, CRM).",
          "Assign an onboarding buddy or mentor."
        ]
      },
      {
        "step": "Step 2: First Day",
        "actions": [
          "Provide an office tour (if in-person) or virtual meeting with key team members.",
          "Walk through HR policies and benefits.",
          "Assign initial training modules."
        ]
      },
      {
        "step": "Step 3: First Week",
        "actions": [
          "Complete compliance training and role-specific tasks.",
          "Assign first shadowing sessions with senior team members.",
          "Conduct a 1:1 check-in with the manager."
        ]
      },
      {
        "step": "Step 4: 30-Day Follow-up",
        "actions": [
          "Review employee progress and collect feedback.",
          "Provide additional training resources if needed.",
          "Confirm long-term role expectations and growth opportunities."
        ]
      }
    ]
  };
}

/**
 * Main function to run the processing pipeline
 * @param {string} configPath - Path to the configuration file
 * @param {string} outputPath - Path to save the processed data
 */
async function runProcessingPipeline(configPath, outputPath) {
  try {
    // Load configuration
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Process content sources
    const sopData = await processContentSources(config);
    
    // Save processed data
    await saveSOPDataToJsFile(sopData, outputPath);
    
    console.log('Processing pipeline completed successfully!');
    return sopData;
  } catch (error) {
    console.error('Error in processing pipeline:', error);
    throw new Error(`Processing pipeline failed: ${error.message}`);
  }
}

// If this script is run directly (not required as a module)
if (require.main === module) {
  const args = process.argv.slice(2);
  const configPath = args[0] || 'config.json';
  const outputPath = args[1] || 'public/sopdata.js';
  
  runProcessingPipeline(configPath, outputPath)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  processContentSources,
  saveSOPDataToJsFile,
  runProcessingPipeline
};