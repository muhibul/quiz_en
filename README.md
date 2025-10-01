# 🔹 English Grammar Quiz Web App

A beautiful, interactive web-based English grammar quiz application built with jQuery and Bootstrap.

## 📂 File Structure

```
quiz/
│
├── index.html              # Main quiz page
├── js/
│   └── app.js             # jQuery logic
├── data/
│   ├── config.json        # Exam settings
│   ├── topics.json        # Topic list (locked/unlocked)
│   └── questions.json     # Questions with answers
└── README.md              # This file
```

## ✨ Features

- **Dynamic Question Loading**: Loads questions from JSON files
- **Topic-Based Filtering**: Only shows questions from unlocked topics
- **Countdown Timer**: Configurable exam time with auto-submit
- **Shuffle Options**: Randomize questions and answer options
- **Beautiful UI**: Modern, responsive design using Bootstrap 5
- **Detailed Results Display**: 
  - Shows all questions with user's answers
  - Highlights correct and incorrect answers
  - Displays explanations for incorrect answers
  - Color-coded feedback (green for correct, red for incorrect, yellow for unanswered)
- **Email Integration**: 
  - Sends detailed results via email
  - Includes all questions, answers, and explanations
  - Ready for EmailJS integration (optional)

## 🚀 Getting Started

### Option 1: Run with XAMPP (Current Setup)

1. Your files are already in `D:\xampp5_6_32\htdocs\quiz`
2. Make sure XAMPP Apache server is running
3. Open your browser and navigate to: `http://localhost/quiz/`

### Option 2: Run with Any Web Server

Simply serve the files from any web server. The app uses CDN links for jQuery and Bootstrap, so no installation needed.

### Option 3: Live Server (VS Code / Cursor)

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## ⚙️ Configuration

### data/config.json

```json
{
  "examTimeMinutes": 20,        // Quiz duration in minutes
  "numberOfQuestions": 30,      // Max number of questions to display
  "shuffleQuestions": true,     // Randomize question order
  "shuffleOptions": true        // Randomize answer options
}
```

### data/topics.json

Control which topics are available:

```json
[
  { "id": 1, "name": "Present Simple Tense", "locked": false },
  { "id": 2, "name": "Past Tense", "locked": true }  // Locked topics won't show
]
```

### data/questions.json

Add or modify questions:

```json
{
  "id": 1,
  "topicId": 1,                                    // Must match topic id
  "question": "He ___ to school every day.",
  "options": ["go", "goes", "going", "gone"],
  "answer": 1,                                     // Index of correct answer (0-based)
  "explanation": "Explanation of why the answer is correct"  // Shown for incorrect answers
}
```

## 📧 Email Setup (Optional)

To enable email functionality using EmailJS:

1. **Sign up for EmailJS**:
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Create a free account

2. **Set up Email Service**:
   - Add an email service (Gmail, Outlook, etc.)
   - Note your Service ID

3. **Create Email Template**:
   - Create a new template with the following variables:
     - `{{score}}` - Final score (e.g., "25/30")
     - `{{percentage}}` - Score percentage (e.g., "83.3%")
     - `{{total_questions}}` - Total number of questions
     - `{{correct_answers}}` - Number of correct answers
     - `{{incorrect_answers}}` - Number of incorrect answers
     - `{{date}}` - Date and time of quiz completion
     - `{{detailed_results}}` - Complete breakdown of all questions, answers, and explanations
   - Note your Template ID
   
   Example template format:
   ```
   Subject: Your Quiz Results - {{score}}
   
   Quiz Completed: {{date}}
   Final Score: {{score}} ({{percentage}})
   Correct Answers: {{correct_answers}}
   Incorrect Answers: {{incorrect_answers}}
   
   Detailed Results:
   {{detailed_results}}
   ```

4. **Update js/app.js**:
   ```javascript
   // Line 9: Add your Public Key
   emailjs.init("YOUR_PUBLIC_KEY");
   
   // Lines 171-183: Uncomment the email sending code
   // Update YOUR_SERVICE_ID and YOUR_TEMPLATE_ID
   ```

## 📊 Results Page

After submitting the quiz, users will see a comprehensive results page featuring:

1. **Score Summary**:
   - Total score and percentage
   - Performance feedback message
   - Email status notification

2. **Detailed Question-by-Question Breakdown**:
   - ✅ **Correct answers**: Green highlight showing your correct selection
   - ❌ **Incorrect answers**: Red highlight for wrong answers, green highlight for correct ones
   - ⚠️ **Unanswered questions**: Yellow highlight
   - 💡 **Explanations**: Detailed explanations appear only for incorrect answers
   - **Topic badges**: Shows which grammar topic each question belongs to

3. **Email Delivery**:
   - All results, questions, answers, and explanations are sent to the configured email
   - Results are also logged to the browser console for debugging

## 🎨 Customization

### Change Theme Colors

Edit the CSS in `index.html` (lines 11-161):
- Primary gradient: `#667eea` to `#764ba2`
- Adjust colors to match your brand

### Add More Questions

1. Open `data/questions.json`
2. Add new question objects following the existing format
3. Make sure `topicId` matches an existing topic

### Add New Topics

1. Open `data/topics.json`
2. Add new topic with unique `id`
3. Set `locked: false` to make it available
4. Add questions to `questions.json` with matching `topicId`

## 📝 Current Question Topics

The app includes 40 sample questions across 8 topics:
1. ✅ Present Simple Tense (unlocked)
2. 🔒 Past Tense (locked)
3. ✅ Future Tense (unlocked)
4. ✅ Present Continuous (unlocked)
5. ✅ Modal Verbs (unlocked)
6. 🔒 Conditionals (locked)
7. ✅ Passive Voice (unlocked)
8. ✅ Prepositions (unlocked)

## 🔧 Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and transitions
- **Bootstrap 5**: Responsive grid and components
- **jQuery 3.6**: DOM manipulation and AJAX
- **EmailJS**: Email service integration (optional)

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🐛 Troubleshooting

**Questions not loading?**
- Check browser console for errors
- Ensure JSON files are valid (use JSONLint.com)
- Verify file paths are correct

**Timer not working?**
- Check JavaScript console
- Ensure jQuery is loaded properly

**Email not sending?**
- Verify EmailJS credentials
- Check network tab for API errors
- Make sure EmailJS code is uncommented

## 📄 License

This project is free to use and modify for educational purposes.

## 🤝 Contributing

Feel free to add more questions, improve the UI, or add new features!

---

**Enjoy your quiz! Good luck! 🎓**

