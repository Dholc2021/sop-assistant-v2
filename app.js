document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.getElementById('messages-container');
  const userInput = document.getElementById('user-input');
  const chatForm = document.getElementById('chat-form');
  const sendButton = document.getElementById('send-button');
  const newChatBtn = document.querySelector('.new-chat-btn');

  // Initialize chat history
  const chatHistory = [];

  // Check for URL query parameters
  function checkUrlQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryQuestion = urlParams.get('q');
    
    if (queryQuestion) {
      // Set the input value
      userInput.value = queryQuestion;
      // Process the question
      setTimeout(() => {
        processUserInput(queryQuestion);
        // Clear the URL parameter to prevent reprocessing on refresh
        history.replaceState(null, '', window.location.pathname);
      }, 500);
    }
  }

  // Function to add a message to the chat
  function addMessage(message, sender) {
    // Create message elements
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    
    const iconElement = document.createElement('i');
    if (sender === 'user') {
      iconElement.classList.add('fa-solid', 'fa-user');
    } else {
      iconElement.classList.add('fa-solid', 'fa-robot');
    }
    
    avatarDiv.appendChild(iconElement);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Save the message to history
    chatHistory.push({
      sender,
      message
    });
    
    // Render message content
    if (sender === 'user') {
      contentDiv.textContent = message;
    } else {
      // For assistant messages, use an improved formatting function
      contentDiv.innerHTML = formatAssistantMessage(message);
    }
    
    // Assemble message
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    // Add to chat
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Enhanced formatting function for assistant messages
  function formatAssistantMessage(message) {
    // First, handle step headings and their numbering
    message = message.replace(/\*\*(Step \d+:.*?)\*\*/g, '<h3>$1</h3>');
    
    // Handle bold text that isn't steps
    message = message.replace(/\*\*((?!Step \d+:).*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle list items for better spacing and bullets
    let formattedContent = '';
    const paragraphs = message.split('\n\n');
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      
      if (para.startsWith('- ')) {
        // This is a list item
        if (i > 0 && !paragraphs[i-1].startsWith('- ')) {
          // Start a new list if previous paragraph wasn't a list item
          formattedContent += '<ul>';
        }
        
        // Add the list item
        formattedContent += `<li>${para.substring(2)}</li>`;
        
        // Check if next paragraph is not a list item to close the list
        if (i === paragraphs.length - 1 || !paragraphs[i+1].startsWith('- ')) {
          formattedContent += '</ul>';
        }
      } else if (para.startsWith('<h3>')) {
        // Keep headings as they are
        formattedContent += para;
      } else {
        // Regular paragraph
        formattedContent += `<p>${para}</p>`;
      }
    }

    // Add follow-up suggestions
    if (message.includes('onboarding')) {
      formattedContent += `
        <div class="suggestions-container">
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'What happens during training?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">What happens during training?</button>
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'How long does onboarding take?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">How long does onboarding take?</button>
        </div>`;
    } else if (message.includes('refund')) {
      formattedContent += `
        <div class="suggestions-container">
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'What if the customer is upset about the refund policy?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">What if the customer is upset?</button>
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'How do I document a refund?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">How do I document a refund?</button>
        </div>`;
    } else if (message.includes('high-priority') || message.includes('support request')) {
      formattedContent += `
        <div class="suggestions-container">
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'What defines a high-priority issue?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">What defines a high-priority issue?</button>
          <button class="suggestion-btn" onclick="document.getElementById('user-input').value = 'Who handles escalated tickets?'; document.getElementById('chat-form').dispatchEvent(new Event('submit'));">Who handles escalated tickets?</button>
        </div>`;
    }
    
    return formattedContent;
  }

  // Function to show typing indicator
  function showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.classList.add('message', 'assistant', 'typing-indicator-container');
    indicatorDiv.id = 'typing-indicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    
    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-solid', 'fa-robot');
    avatarDiv.appendChild(iconElement);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      typingDiv.appendChild(dot);
    }
    
    contentDiv.appendChild(typingDiv);
    indicatorDiv.appendChild(avatarDiv);
    indicatorDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(indicatorDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Function to remove typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Function to process user input and generate a response
  async function processUserInput(input) {
    if (!input || input.trim() === '') return;
    
    // Disable input while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessage(input, 'user');
    
    // Clear input field
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate processing time (1-2 seconds)
    const delay = Math.random() * 1000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Generate response based on input
    const response = generateResponse(input);
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add assistant response to chat
    addMessage(response, 'assistant');
    
    // Re-enable input
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }

  // Improved response generation logic
  function generateResponse(input) {
    // Convert input to lowercase for easier matching
    const lowercaseInput = input.toLowerCase();
    
    // High-Priority Support Request (check this first specifically)
    if (lowercaseInput.includes('high') && (lowercaseInput.includes('priority') || lowercaseInput.includes('urgent')) || 
        lowercaseInput.includes('high-priority') || 
        (lowercaseInput.includes('priority') && lowercaseInput.includes('support'))) {
      
      return `According to the Customer Support Standard Operating Procedure (SOP), follow these steps for handling a high-priority support request:

**Step 1: Immediate Acknowledgment**

- Greet the customer professionally and acknowledge the urgency.
- Confirm you'll be handling their request as a high priority.
- Let them know you're treating this with urgency.

**Step 2: Information Gathering**

- Ask for their account details and contact information.
- Document all details in the ticketing system with the HIGH PRIORITY tag.
- Get a clear description of the issue and its business impact.

**Step 3: Categorize and Escalate**

- Tag the ticket as 'High Priority' in the system.
- Escalate to the appropriate team based on the issue type.
- Notify the support manager or team lead about the escalation.

**Step 4: Continuous Updates**

- Provide updates to the customer every 30-60 minutes.
- Document all steps taken in the ticketing system.
- Keep the support manager informed of progress.

**Step 5: Resolution & Follow-up**

- Resolve the issue promptly with assistance from necessary departments.
- Send a follow-up email within 24 hours of resolution.
- Collect customer feedback and document lessons learned.

Would you like to know more about how to handle specific types of high-priority issues?`;
    }
    
    // Customer onboarding response
    if (lowercaseInput.includes('onboard') || 
        (lowercaseInput.includes('customer') && 
         (lowercaseInput.includes('step') || lowercaseInput.includes('process')))) {
      
      return `According to the Customer Onboarding Standard Operating Procedure (SOP), the customer onboarding process consists of the following steps:

**Step 1: Initial Contact**

- Greet the customer professionally.
- Confirm their details (name, email, company).
- Briefly explain the onboarding process.

**Step 2: Account Setup**

- Create a profile in the CRM.
- Assign an account manager.
- Provide login credentials.

**Step 3: Training & Support**

- Send a welcome email with training resources.
- Assign a dedicated support contact.

**Step 4: Follow-up & Feedback**

- Follow up within 7 days.
- Request feedback to improve the process.

Is there a particular part of the customer onboarding process you'd like more information about?`;
    }
    
    // Refund process response
    if (lowercaseInput.includes('refund') || 
        (lowercaseInput.includes('money') && lowercaseInput.includes('back')) ||
        lowercaseInput.includes('cancellation') || 
        lowercaseInput.includes('cancel')) {
      
      return `According to the Refund & Cancellation Standard Operating Procedure (SOP), here's how to process a refund:

**Step 1: Eligibility Check**

- Confirm the purchase was made within 30 days.
- Verify that the request is not for a non-refundable service fee.
- Check the customer's account history.

**Step 2: Refund Process**

- Verify the purchase date and confirm refund eligibility.
- Submit the refund request in the billing system.
- Notify the customer that refunds take 5-7 business days to process.

**Step 3: Cancellation Handling**

- Process any associated cancellations in the system.
- Update subscription status if applicable.
- Document the reason for cancellation for analytics.

**Step 4: Customer Confirmation**

- Send a final email confirming the refund has been processed.
- Provide contact details in case of any disputes.
- Include a feedback survey about their experience.

Would you like specific guidance on handling any of these refund steps?`;
    }
    
    // General support response
    if (lowercaseInput.includes('support') || 
        lowercaseInput.includes('help') || 
        lowercaseInput.includes('issue') || 
        lowercaseInput.includes('problem') || 
        lowercaseInput.includes('ticket')) {
      
      return `According to our Customer Support Standard Operating Procedure (SOP), here's how to handle support requests:

**Step 1: Receiving the Request**

- Greet the customer professionally.
- Ask for their name and account details.
- Identify the issue and categorize it as Low, Medium, or High priority.

**Step 2: Troubleshooting Process**

- If the issue is account-related, verify their credentials and check the database.
- If it's a technical issue, escalate to the IT team via the internal ticket system.
- Provide an estimated resolution time based on the issue complexity.

**Step 3: Resolution & Follow-up**

- Confirm the issue is resolved before closing the ticket.
- Send a follow-up email within 48 hours.
- Collect customer feedback for quality improvement.

Would you like more details about a specific part of this process?`;
    }
    
    // Employee onboarding response
    if (lowercaseInput.includes('employee') && 
        (lowercaseInput.includes('onboard') || lowercaseInput.includes('orientation') || 
         lowercaseInput.includes('first day'))) {
      
      return `According to the Employee Onboarding Standard Operating Procedure (SOP), here's our employee onboarding process:

**Step 1: Pre-boarding**

- Send a welcome email with job expectations and required documents.
- Set up employee accounts (email, Slack, CRM).
- Assign an onboarding buddy or mentor.

**Step 2: First Day**

- Provide an office tour (if in-person) or virtual meeting with key team members.
- Walk through HR policies and benefits.
- Assign initial training modules.

**Step 3: First Week**

- Complete compliance training and role-specific tasks.
- Assign first shadowing sessions with senior team members.
- Conduct a 1:1 check-in with the manager.

**Step 4: 30-Day Follow-up**

- Review employee progress and collect feedback.
- Provide additional training resources if needed.
- Confirm long-term role expectations and growth opportunities.

Would you like more information about any specific phase of the employee onboarding process?`;
    }
    
    // Default response if no specific match
    return `I can help you with information about our Standard Operating Procedures (SOPs). Here are some topics I can assist with:

- Customer Onboarding Process
- Refund & Cancellation Procedures 
- Customer Support Guidelines (including high-priority requests)
- Employee Onboarding Steps

Could you please specify which procedure you'd like information about?`;
  }

  // Event listener for form submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInputValue = userInput.value.trim();
    if (userInputValue) {
      processUserInput(userInputValue);
    }
  });

  // New chat button functionality
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      // Clear the chat history (except for the welcome message)
      while (messagesContainer.children.length > 1) {
        messagesContainer.removeChild(messagesContainer.lastChild);
      }
      
      // Focus on the input
      userInput.value = '';
      userInput.focus();
    });
  }

  // Initialize: Check for URL query
  checkUrlQuery();

  // Set focus to input field
  userInput.focus();
});

// For about page tab functionality
document.addEventListener('DOMContentLoaded', () => {
  const aboutNavItems = document.querySelectorAll('.about-nav-item');
  const aboutSections = document.querySelectorAll('.about-section');
  
  if (aboutNavItems.length > 0) {
    aboutNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        
        // Update active class on nav items
        aboutNavItems.forEach(navItem => {
          navItem.classList.remove('active');
        });
        item.classList.add('active');
        
        // Update active class on sections
        aboutSections.forEach(section => {
          section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
      });
    });
  }
});