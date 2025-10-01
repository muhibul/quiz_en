$(document).ready(function() {
    let config = {};
    let topics = [];
    let allQuestions = [];
    let selectedQuestions = [];
    let timerInterval;
    let timeRemaining = 0;
    
    // Initialize EmailJS (Optional - replace with your EmailJS credentials)
    // emailjs.init("YOUR_PUBLIC_KEY");
    
    // Load all data and initialize quiz
    loadQuizData();
    
    function loadQuizData() {
        // Load all JSON files
        $.when(
            $.getJSON('data/config.json'),
            $.getJSON('data/topics.json'),
            $.getJSON('data/questions.json')
        ).done(function(configData, topicsData, questionsData) {
            config = configData[0];
            topics = topicsData[0];
            allQuestions = questionsData[0];
            
            initializeQuiz();
        }).fail(function(error) {
            console.error('Error loading data:', error);
            $('#loading').html('<div class="alert alert-danger">Error loading quiz data. Please refresh the page.</div>');
        });
    }
    
    function initializeQuiz() {
        // Filter unlocked topics
        const unlockedTopics = topics.filter(topic => !topic.locked);
        const unlockedTopicIds = unlockedTopics.map(topic => topic.id);
        
        // Get questions from unlocked topics only
        let availableQuestions = allQuestions.filter(q => unlockedTopicIds.includes(q.topicId));
        
        // Shuffle questions if enabled
        if (config.shuffleQuestions) {
            availableQuestions = shuffleArray(availableQuestions);
        }
        
        // Select number of questions based on config
        selectedQuestions = availableQuestions.slice(0, Math.min(config.numberOfQuestions, availableQuestions.length));
        
        // Shuffle options if enabled
        if (config.shuffleOptions) {
            selectedQuestions = selectedQuestions.map(q => shuffleQuestionOptions(q));
        }
        
        // Render questions
        renderQuestions();
        
        // Start timer
        startTimer(config.examTimeMinutes);
        
        // Show quiz
        $('#loading').hide();
        $('#quizContent').show();
        
        // Setup submit button
        $('#submitBtn').on('click', submitQuiz);
    }
    
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    function shuffleQuestionOptions(question) {
        const correctAnswer = question.options[question.answer];
        const shuffledOptions = shuffleArray(question.options);
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        return {
            ...question,
            options: shuffledOptions,
            answer: newCorrectIndex
        };
    }
    
    function renderQuestions() {
        const container = $('#questionsContainer');
        container.empty();
        
        selectedQuestions.forEach((question, index) => {
            const topic = topics.find(t => t.id === question.topicId);
            const topicName = topic ? topic.name : 'Unknown';
            
            const questionHTML = `
                <div class="question-card" data-question-id="${question.id}">
                    <div class="d-flex align-items-start mb-3">
                        <span class="question-number">${index + 1}</span>
                        <div class="flex-grow-1">
                            <div class="question-text">
                                ${question.question}
                                <span class="topic-badge">${topicName}</span>
                            </div>
                        </div>
                    </div>
                    <div class="options">
                        ${question.options.map((option, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="question_${question.id}" value="${optIndex}">
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
            container.append(questionHTML);
        });
    }
    
    function startTimer(minutes) {
        timeRemaining = minutes * 60; // Convert to seconds
        
        updateTimerDisplay();
        
        timerInterval = setInterval(function() {
            timeRemaining--;
            updateTimerDisplay();
            
            // Warning when 5 minutes or less
            if (timeRemaining <= 300) {
                $('#timer').addClass('timer-warning');
            }
            
            // Auto-submit when time runs out
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                autoSubmitQuiz();
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        $('#timer').text(display);
    }
    
    function submitQuiz() {
        clearInterval(timerInterval);
        calculateAndShowResults();
    }
    
    function autoSubmitQuiz() {
        alert('Time is up! The quiz will be submitted automatically.');
        calculateAndShowResults();
    }
    
    function calculateAndShowResults() {
        let correctAnswers = 0;
        const userAnswers = [];
        
        selectedQuestions.forEach((question, index) => {
            const selectedOption = $(`input[name="question_${question.id}"]:checked`).val();
            const isCorrect = selectedOption !== undefined && parseInt(selectedOption) === question.answer;
            
            if (isCorrect) {
                correctAnswers++;
            }
            
            userAnswers.push({
                questionNumber: index + 1,
                question: question.question,
                selectedAnswer: selectedOption !== undefined ? question.options[selectedOption] : 'Not answered',
                correctAnswer: question.options[question.answer],
                isCorrect: isCorrect
            });
        });
        
        const totalQuestions = selectedQuestions.length;
        const percentage = (correctAnswers / totalQuestions * 100).toFixed(1);
        
        // Display results
        displayResults(correctAnswers, totalQuestions, percentage, userAnswers);
        
        // Send email
        sendResultsEmail(correctAnswers, totalQuestions, percentage);
    }
    
    function displayResults(correct, total, percentage, userAnswers) {
        $('#scoreDisplay').text(`${correct}/${total}`);
        
        let message = '';
        if (percentage >= 90) {
            message = '🌟 Excellent! Outstanding performance!';
        } else if (percentage >= 75) {
            message = '👍 Great job! Well done!';
        } else if (percentage >= 60) {
            message = '✅ Good effort! Keep practicing!';
        } else {
            message = '📚 Keep studying! You can do better!';
        }
        
        $('#resultsMessage').html(`
            <p>${message}</p>
            <p class="text-muted">Score: ${percentage}%</p>
        `);
        
        // Display detailed results
        displayDetailedResults(userAnswers);
        
        // Hide quiz, show results
        $('#quizContent').hide();
        $('#resultsSection').show();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    function displayDetailedResults(userAnswers) {
        const container = $('#detailedResults');
        container.empty();
        
        userAnswers.forEach((item, index) => {
            const question = selectedQuestions[index];
            const topic = topics.find(t => t.id === question.topicId);
            const topicName = topic ? topic.name : 'Unknown';
            
            let statusClass = '';
            let statusBadge = '';
            let statusIcon = '';
            
            if (item.selectedAnswer === 'Not answered') {
                statusClass = 'unanswered';
                statusBadge = 'Unanswered';
                statusIcon = '⚠️';
            } else if (item.isCorrect) {
                statusClass = 'correct';
                statusBadge = 'Correct';
                statusIcon = '✅';
            } else {
                statusClass = 'incorrect';
                statusBadge = 'Incorrect';
                statusIcon = '❌';
            }
            
            let optionsHTML = '';
            question.options.forEach((option, optIndex) => {
                const isUserAnswer = item.selectedAnswer === option;
                const isCorrectAnswer = question.options[question.answer] === option;
                
                let optionClass = 'answer-option';
                let optionLabel = '';
                
                if (isCorrectAnswer && !item.isCorrect) {
                    optionClass += ' correct-answer';
                    optionLabel = ' ✓ Correct Answer';
                } else if (isUserAnswer && !item.isCorrect) {
                    optionClass += ' wrong-answer';
                    optionLabel = ' ✗ Your Answer';
                } else if (isUserAnswer && item.isCorrect) {
                    optionClass += ' correct-answer';
                    optionLabel = ' ✓ Your Answer';
                }
                
                optionsHTML += `<div class="${optionClass}">${option}${optionLabel}</div>`;
            });
            
            const questionHTML = `
                <div class="result-question-card ${statusClass}">
                    <div class="d-flex align-items-start mb-3">
                        <span class="question-number">${index + 1}</span>
                        <div class="flex-grow-1">
                            <div class="question-text">
                                ${statusIcon} ${question.question}
                                <span class="topic-badge">${topicName}</span>
                                <span class="status-badge ${statusClass}">${statusBadge}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        ${optionsHTML}
                    </div>
                    
                    ${!item.isCorrect ? `
                        <div class="explanation-box">
                            <strong>💡 Explanation:</strong><br>
                            ${question.explanation}
                        </div>
                    ` : ''}
                </div>
            `;
            
            container.append(questionHTML);
        });
    }
    
    function sendResultsEmail(correct, total, percentage) {
        // Build detailed results for email
        let detailedResultsText = '';
        selectedQuestions.forEach((question, index) => {
            const selectedOption = $(`input[name="question_${question.id}"]:checked`).val();
            const userAnswer = selectedOption !== undefined ? question.options[selectedOption] : 'Not answered';
            const correctAnswer = question.options[question.answer];
            const isCorrect = selectedOption !== undefined && parseInt(selectedOption) === question.answer;
            const topic = topics.find(t => t.id === question.topicId);
            
            detailedResultsText += `\n\n--- Question ${index + 1} ---\n`;
            detailedResultsText += `Topic: ${topic ? topic.name : 'Unknown'}\n`;
            detailedResultsText += `Question: ${question.question}\n`;
            detailedResultsText += `Your Answer: ${userAnswer}\n`;
            detailedResultsText += `Correct Answer: ${correctAnswer}\n`;
            detailedResultsText += `Status: ${isCorrect ? '✅ Correct' : (userAnswer === 'Not answered' ? '⚠️ Not Answered' : '❌ Incorrect')}\n`;
            
            if (!isCorrect) {
                detailedResultsText += `Explanation: ${question.explanation}\n`;
            }
        });
        
        // NOTE: This is a placeholder for email functionality
        // To use EmailJS, you need to:
        // 1. Sign up at https://www.emailjs.com/
        // 2. Get your Public Key, Service ID, and Template ID
        // 3. Uncomment the emailjs.init() at the top with your Public Key
        // 4. Update the code below with your Service ID and Template ID
        
        /*
        const templateParams = {
            score: `${correct}/${total}`,
            percentage: percentage + '%',
            total_questions: total,
            correct_answers: correct,
            incorrect_answers: total - correct,
            date: new Date().toLocaleString(),
            detailed_results: detailedResultsText
        };
        
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('Email sent successfully!', response);
                $('#emailStatus').removeClass('alert-info').addClass('alert-success')
                    .html('✅ Results sent to your email successfully!');
            }, function(error) {
                console.error('Email sending failed:', error);
                $('#emailStatus').removeClass('alert-info').addClass('alert-warning')
                    .html('⚠️ Could not send email. Please check your email configuration.');
            });
        */
        
        // For demonstration: log the detailed results that would be sent
        console.log('=== Quiz Results (would be sent via email) ===');
        console.log(`Score: ${correct}/${total} (${percentage}%)`);
        console.log(`Date: ${new Date().toLocaleString()}`);
        console.log(detailedResultsText);
        
        // For now, just show a message that email functionality needs to be configured
        setTimeout(function() {
            $('#emailStatus').removeClass('alert-info').addClass('alert-warning')
                .html('ℹ️ Email functionality requires EmailJS configuration. See js/app.js for instructions.<br><small>Detailed results have been logged to the browser console.</small>');
        }, 1000);
    }
});

