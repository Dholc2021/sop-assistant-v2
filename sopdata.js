// SOP Data
const sopData = {
    "customer_onboarding": {
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
    },
    "refund_cancellation": {
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
    },
    "customer_support": {
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
    },
    "employee_onboarding": {
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
    }
  };
  
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
  }