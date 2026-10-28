const quizData = [
  { id: "dsa", title: "Data Structures & Algorithms", category: "Computer Science", tag: "DSA", difficulty: "Intermediate", questions: 12, time: "15 min", cover: "cover-dsa", icon: "⌘", popularity: "Popular" },
  { id: "web", title: "The Web Developer's Toolkit", category: "Web Development", tag: "WEB DEV", difficulty: "Beginner", questions: 10, time: "12 min", cover: "cover-web", icon: "</>", popularity: "New" },
  { id: "dbms", title: "Database Design: The Essentials", category: "Computer Science", tag: "DBMS", difficulty: "Intermediate", questions: 15, time: "18 min", cover: "cover-db", icon: "▤", popularity: "Popular" },
  { id: "os", title: "Operating Systems Unpacked", category: "Computer Science", tag: "OPERATING SYSTEMS", difficulty: "Advanced", questions: 12, time: "16 min", cover: "cover-os", icon: "◉", popularity: "New" },
  { id: "math", title: "Numbers, Patterns & Logic", category: "Mathematics", tag: "MATHEMATICS", difficulty: "Beginner", questions: 8, time: "10 min", cover: "cover-math", icon: "∑", popularity: "Popular" },
  { id: "gk", title: "Curious Minds: World Edition", category: "General Knowledge", tag: "GENERAL KNOWLEDGE", difficulty: "Intermediate", questions: 10, time: "12 min", cover: "cover-gk", icon: "✦", popularity: "New" },
];

const questionSets = {
  daily: [
    { question: "Which data structure follows the Last In, First Out (LIFO) principle?", options: ["Queue", "Stack", "Linked list", "Binary tree"], answer: 1 },
    { question: "What does CSS stand for?", options: ["Creative Style System", "Computer Styled Sections", "Cascading Style Sheets", "Colorful Style Syntax"], answer: 2 },
    { question: "Which SQL command is used to retrieve data from a database?", options: ["GET", "OPEN", "SELECT", "FETCH ALL"], answer: 2 },
  ],
  dsa: [
    { question: "What is the average time complexity of searching in a balanced binary search tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1 },
    { question: "Which data structure is best suited for implementing a breadth-first search?", options: ["Stack", "Queue", "Heap", "Hash map"], answer: 1 },
    { question: "What is the worst-case time complexity of quicksort?", options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"], answer: 3 },
  ],
  web: [
    { question: "Which HTML element is used for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], answer: 2 },
    { question: "Which CSS property creates space inside an element's border?", options: ["margin", "padding", "gap", "spacing"], answer: 1 },
    { question: "Which keyword declares a block-scoped variable in JavaScript?", options: ["var", "let", "define", "static"], answer: 1 },
  ],
  dbms: [
    { question: "Which key uniquely identifies each row in a database table?", options: ["Foreign key", "Index key", "Primary key", "Composite link"], answer: 2 },
    { question: "What does SQL stand for?", options: ["Structured Query Language", "Sequential Question Logic", "Standard Queue Language", "System Query Link"], answer: 0 },
    { question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "4NF"], answer: 2 },
  ],
  os: [
    { question: "What is a process?", options: ["A program in execution", "A storage device", "A network protocol", "A type of memory"], answer: 0 },
    { question: "Which scheduling algorithm gives each process an equal time slice?", options: ["FCFS", "Priority", "Round Robin", "Shortest Job First"], answer: 2 },
    { question: "What is virtual memory?", options: ["A CPU register", "An extension of RAM using disk storage", "A type of cache", "An operating system kernel"], answer: 1 },
  ],
  math: [
    { question: "What is the next number in the sequence: 2, 6, 18, 54, ...?", options: ["108", "126", "162", "216"], answer: 2 },
    { question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?", options: ["Yes", "No", "Cannot be determined", "Only some"], answer: 0 },
    { question: "What is the sum of the interior angles of a triangle?", options: ["90°", "180°", "270°", "360°"], answer: 1 },
  ],
  gk: [
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Mercury"], answer: 2 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
  ],
};

const savedQuizzes = new Set(JSON.parse(localStorage.getItem("quizora-saved") || "[]"));
const modalLayer = document.getElementById("modalLayer");
const innerView = document.getElementById("innerView");
const dashboardView = document.getElementById("dashboardView");
let currentFilter = "All";
let currentQuiz = null;
let currentQuestion = 0;
let selectedAnswer = null;
let quizScore = 0;
let timerInterval = null;
let timeLeft = 0;
let innerFilter = "All";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderQuizCards(target, filter = "All", search = "") {
  if (!target) return;
  const query = search.trim().toLowerCase();
  const cards = quizData.filter((quiz) => {
    const matchesSearch = `${quiz.title} ${quiz.category} ${quiz.tag}`.toLowerCase().includes(query);
    const matchesFilter = filter === "All" || filter === "For you" || (filter === "Popular" && quiz.popularity === "Popular") || (filter === "New" && quiz.popularity === "New") || (filter === "Saved" && savedQuizzes.has(quiz.id));
    return matchesSearch && matchesFilter;
  });
  if (!cards.length) {
    target.innerHTML = `<div class="empty-state">No quizzes found${query ? ` for “${escapeHTML(search)}”` : ""}. Try a different topic or filter.</div>`;
    return;
  }
  target.innerHTML = cards.map((quiz) => `
    <article class="quiz-card">
      <div class="quiz-cover ${quiz.cover}"><span class="cover-icon">${quiz.icon}</span><span class="quiz-cover-mark">${quiz.tag.slice(0, 1)}</span>
        <button class="bookmark-button ${savedQuizzes.has(quiz.id) ? "saved" : ""}" data-bookmark="${quiz.id}" aria-label="${savedQuizzes.has(quiz.id) ? "Remove bookmark" : "Bookmark"} ${escapeHTML(quiz.title)}" aria-pressed="${savedQuizzes.has(quiz.id)}">${savedQuizzes.has(quiz.id) ? "★" : "☆"}</button>
      </div>
      <div class="quiz-body"><div class="quiz-tags"><span class="tag ${quiz.cover === "cover-db" ? "tag-mint" : quiz.cover === "cover-web" ? "tag-peach" : quiz.cover === "cover-os" ? "tag-blue" : quiz.cover === "cover-math" ? "tag-pink" : "tag-lilac"}">${quiz.tag}</span><span class="difficulty ${quiz.difficulty === "Beginner" ? "easy" : quiz.difficulty === "Advanced" ? "hard" : ""}">${quiz.difficulty}</span></div>
        <h3>${escapeHTML(quiz.title)}</h3><div class="quiz-meta"><span>▤ ${quiz.questions} questions · ${quiz.time}</span><button class="quiz-start" data-quiz="${quiz.id}">Start quiz →</button></div>
      </div>
    </article>`).join("");
}

function toast(message) {
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  document.getElementById("toastRegion").append(item);
  window.setTimeout(() => item.remove(), 3200);
}

function updateSavedCounts() {
  document.querySelectorAll(".saved-count").forEach((el) => { el.textContent = savedQuizzes.size ? ` ${savedQuizzes.size}` : ""; });
}

function openModal(content) {
  modalLayer.innerHTML = content;
  modalLayer.classList.add("open");
  modalLayer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalLayer.querySelector(".modal-close")?.focus();
}

function closeModal() {
  clearInterval(timerInterval);
  modalLayer.classList.remove("open");
  modalLayer.setAttribute("aria-hidden", "true");
  modalLayer.innerHTML = "";
  document.body.style.overflow = "";
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function startQuiz(id) {
  currentQuiz = quizData.find((item) => item.id === id) || { id: "daily", title: "Today's Daily Challenge", tag: "DAILY MIX" };
  currentQuestion = 0;
  selectedAnswer = null;
  quizScore = 0;
  timeLeft = 300;
  renderQuestion();
  clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    timeLeft -= 1;
    const timer = document.getElementById("quizTimer");
    if (timer) timer.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function renderQuestion() {
  const questions = questionSets[currentQuiz.id] || questionSets.daily;
  const item = questions[currentQuestion];
  const letters = ["A", "B", "C", "D"];
  openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <button class="modal-close" data-close aria-label="Close quiz">×</button><span class="tag tag-lilac">${escapeHTML(currentQuiz.tag)} · QUICK QUIZ</span><h2 id="modalTitle">${escapeHTML(currentQuiz.title)}</h2>
    <div class="quiz-modal-top"><span>Question ${currentQuestion + 1} of ${questions.length}</span><span class="timer-pill" id="quizTimer">${formatTime(timeLeft)}</span></div><div class="progress-track"><span style="width:${((currentQuestion + 1) / questions.length) * 100}%"></span></div>
    <p class="quiz-question">${escapeHTML(item.question)}</p><div class="answer-list">${item.options.map((option, index) => `<button class="answer-option" data-answer="${index}"><span class="answer-letter">${letters[index]}</span>${escapeHTML(option)}</button>`).join("")}</div>
    <div class="quiz-modal-footer"><span>${quizScore} correct so far</span><button class="button button-primary button-small" id="nextQuestion" disabled>${currentQuestion === questions.length - 1 ? "Finish quiz" : "Next question"} →</button></div>
  </div>`);
}

function finishQuiz() {
  clearInterval(timerInterval);
  const questions = questionSets[currentQuiz.id] || questionSets.daily;
  const percentage = Math.round((quizScore / questions.length) * 100);
  const xp = quizScore * 20 + 10;
  openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close results">×</button>
    <div style="text-align:center"><span class="tag tag-mint">QUIZ COMPLETE</span><h2 id="modalTitle" style="margin:12px 0 4px">That's a wrap!</h2><p class="modal-subtitle">Every question is a step forward. Here's how you did:</p></div>
    <div class="result-score">${percentage}%<small>your score</small></div><div class="result-stats"><div class="result-stat"><strong>${quizScore}/${questions.length}</strong><span>Correct answers</span></div><div class="result-stat"><strong>${xp} XP</strong><span>Points earned</span></div><div class="result-stat"><strong>${formatTime(300 - timeLeft)}</strong><span>Time taken</span></div></div>
    <div style="display:flex;justify-content:center;gap:8px;margin-top:19px"><button class="button button-soft" data-close>Back to dashboard</button><button class="button button-primary button-small" id="retryQuiz">Try again ↻</button></div></div>`);
  const completed = Number(localStorage.getItem("quizora-completed") || "24") + 1;
  localStorage.setItem("quizora-completed", String(completed));
  localStorage.setItem("quizora-last-score", String(percentage));
  document.getElementById("completedCount").textContent = completed;
}

function setView(view) {
  dashboardView.classList.toggle("active", view === "dashboard");
  innerView.classList.toggle("active", view !== "dashboard");
  document.querySelectorAll(".nav-link[data-view]").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
  const titles = { dashboard: "Dashboard", explore: "Explore quizzes", learning: "My learning", leaderboard: "Leaderboard", live: "Live rooms", ai: "AI study buddy", creator: "Creator studio", settings: "Settings" };
  document.getElementById("breadcrumbCurrent").textContent = titles[view] || "Dashboard";
  if (view === "dashboard") return;
  innerView.innerHTML = (viewTemplates[view] || viewTemplates.explore)();
  if (view === "explore") renderQuizCards(document.getElementById("innerQuizGrid"), innerFilter, document.getElementById("globalSearch").value);
  if (view === "learning") renderQuizCards(document.getElementById("learningQuizGrid"), "Saved");
}

const viewTemplates = {
  explore: () => `<div class="page-head"><div><p class="eyebrow">YOUR NEXT BIG AHA MOMENT</p><h1>Explore quizzes</h1><p>Find your next favorite topic and keep the curiosity going.</p></div><button class="button button-primary button-small" data-action="daily">✦ Daily challenge</button></div><div class="filter-row"><button class="filter-chip selected" data-inner-filter="All">All quizzes</button><button class="filter-chip" data-inner-filter="Popular">Popular</button><button class="filter-chip" data-inner-filter="New">New</button><button class="filter-chip" data-inner-filter="Saved">Saved <span class="saved-count"></span></button></div><div class="quiz-grid" id="innerQuizGrid"></div><div class="inner-card" style="margin-top:20px"><h2>Explore by subject</h2><p>Find a quiz that matches your goals.</p><div class="feature-list"><div class="feature-item"><span class="feature-icon">⌘</span><div><strong>Computer science</strong><small>DSA, operating systems, databases, and more.</small></div></div><div class="feature-item"><span class="feature-icon">&lt;/&gt;</span><div><strong>Web development</strong><small>Frontend fundamentals, modern tools, and code.</small></div></div><div class="feature-item"><span class="feature-icon">∑</span><div><strong>Math &amp; aptitude</strong><small>Build speed and confidence with daily practice.</small></div></div><div class="feature-item"><span class="feature-icon">✦</span><div><strong>General knowledge</strong><small>Stay curious about the world around you.</small></div></div></div></div>`,
  learning: () => `<div class="page-head"><div><p class="eyebrow">YOUR PERSONAL LEARNING SPACE</p><h1>My learning</h1><p>Every session adds up. Here's your progress so far.</p></div><button class="button button-outline" data-view="explore">Find a new quiz →</button></div><div class="metric-strip"><div class="metric-box"><span>Quizzes completed</span><strong>${localStorage.getItem("quizora-completed") || "24"}</strong></div><div class="metric-box"><span>Average accuracy</span><strong>${localStorage.getItem("quizora-last-score") || "86"}%</strong></div><div class="metric-box"><span>Topics explored</span><strong>08</strong></div><div class="metric-box"><span>Study time</span><strong>18.5h</strong></div></div><div class="inner-card"><h2>Keep your momentum</h2><p>Pick up where you left off, or revisit a saved quiz.</p><div class="continue-card"><div class="course-art course-art-dsa"><span class="course-art-shape">⌘</span><span class="art-label">01 / 06</span></div><div class="continue-info"><div class="course-meta"><span class="tag tag-lilac">DATA STRUCTURES</span><span class="course-updated">Continued 2h ago</span></div><h3>Data Structures &amp; Algorithms</h3><p>Master the fundamentals of DSA, one question at a time.</p><div class="course-progress-line"><div class="progress-track"><span style="width:64%"></span></div><strong>64%</strong></div><div class="course-foot"><span>8 of 12 lessons completed</span><button class="button button-primary button-small" data-quiz="dsa">Continue learning →</button></div></div></div></div><div class="section-heading"><div><h2>Saved for later</h2><p>Your bookmarked quizzes, all in one place.</p></div></div><div class="quiz-grid" id="learningQuizGrid"></div><div class="inner-card" style="margin-top:18px"><h2>Your learning roadmap</h2><p>Build strong fundamentals, one phase at a time.</p><div class="feature-list"><div class="feature-item"><span class="feature-icon">✓</span><div><strong>01 · Foundation</strong><small>Profiles, categories, question banks &amp; MCQs · In progress</small></div></div><div class="feature-item"><span class="feature-icon">◷</span><div><strong>02 · Quiz engine</strong><small>Timer, navigation, scoring &amp; attempt history · Up next</small></div></div><div class="feature-item"><span class="feature-icon">↗</span><div><strong>03 · Learn &amp; improve</strong><small>Explanations, topic analytics &amp; revision · Coming soon</small></div></div><div class="feature-item"><span class="feature-icon">✳</span><div><strong>04 · AI &amp; live play</strong><small>AI-generated practice, rooms &amp; competitions · Coming soon</small></div></div></div></div>`,
  leaderboard: () => `<div class="page-head"><div><p class="eyebrow">A LITTLE FRIENDLY COMPETITION</p><h1>Leaderboard</h1><p>Celebrate your progress alongside the Quizora community.</p></div><button class="select-button" id="leaderboardPeriod">This week&nbsp; ⌄</button></div><div class="metric-strip"><div class="metric-box"><span>Your weekly rank</span><strong>#12</strong></div><div class="metric-box"><span>Your points</span><strong>2,840 XP</strong></div><div class="metric-box"><span>Points to top 10</span><strong>160 XP</strong></div><div class="metric-box"><span>Current streak</span><strong>8 days</strong></div></div><div class="inner-card"><h2>This week's top learners <span class="tiny-trophy">♧</span></h2><p>Ranked by points earned from quizzes and daily challenges.</p><div style="overflow:auto"><table class="leader-table"><thead><tr><th>RANK</th><th>LEARNER</th><th>LEVEL</th><th>QUIZZES</th><th>POINTS</th></tr></thead><tbody>${[["01","A","Aarav Mehta","18 · Quiz legend","32","3,240"],["02","S","Sana Khan","16 · Brainiac","29","3,080"],["03","R","Rohan Patel","14 · On a roll","27","2,960"],["04","M","Meera Iyer","13 · Curious mind","25","2,910"],["05","K","Kabir Shah","12 · Quick thinker","24","2,880"],["12","H","You, Harsh!","09 · Rising star","24","2,840"]].map((row, i) => `<tr ${row[0] === "12" ? 'style="background:#f5f3ff"' : ""}><td><strong style="color:${i < 3 ? "#d19e50" : "#9698aa"}">#${row[0]}</strong></td><td><span class="table-person"><span class="avatar leader-avatar ${["avatar-peach","avatar-blue","avatar-green","avatar-purple"][i % 4]}">${row[1]}</span>${row[2]}</span></td><td>${row[3]}</td><td>${row[4]}</td><td><strong>${row[5]} XP</strong></td></tr>`).join("")}</tbody></table></div></div><div class="inner-card"><h2>How points work</h2><p>Earn XP every time you show up and give it your best.</p><div class="feature-list"><div class="feature-item"><span class="feature-icon">✓</span><div><strong>Complete a quiz</strong><small>Earn up to 100 XP based on your score.</small></div></div><div class="feature-item"><span class="feature-icon">♨</span><div><strong>Keep your streak</strong><small>Daily practice gives you bonus points.</small></div></div></div></div>`,
  live: () => `<div class="page-head"><div><p class="eyebrow">LEARN TOGETHER, PLAY TO WIN</p><h1>Live rooms</h1><p>Jump into a live quiz or start a room of your own.</p></div></div><div class="room-banner"><div><h2>Got a room code?</h2><p>Enter the code your host shared with you and join the fun. Gather your friends for a quick brain battle!</p><div class="room-join"><input id="roomCodeInput" maxlength="8" placeholder="Enter room code" aria-label="Room code"><button class="button button-light" id="joinRoomButton">Join room →</button></div></div><span style="font-size:48px;opacity:.8">◉</span></div><div class="section-heading" style="margin-top:25px"><div><h2>Coming up</h2><p>Live sessions you might enjoy.</p></div><span class="tag tag-mint">● 2 LIVE NOW</span></div><div class="room-grid"><article class="room-card"><span class="tag tag-lilac">COMPUTER SCIENCE</span><h3>DSA Speed Round</h3><p>Think fast, code faster. A 10-question challenge with the community.</p><div class="room-details"><span>◷ Starts in 5 minutes · 8/20 joined</span><button class="button button-soft" data-join="DSA5K2">Join room →</button></div></article><article class="room-card"><span class="tag tag-peach">GENERAL KNOWLEDGE</span><h3>Friday Brain Battle</h3><p>A friendly contest covering everything under the sun.</p><div class="room-details"><span>◷ Today, 6:30 PM · 14/30 joined</span><button class="button button-soft" data-join="BRAIN7">Set reminder</button></div></article></div><div class="inner-card" style="margin-top:15px"><h2>Host your own quiz</h2><p>Create a room, share the join code, and let the fun begin.</p><button class="button button-primary button-small" data-action="create-room">＋ Create a room</button></div>`,
  ai: () => `<div class="page-head"><div><p class="eyebrow">YOUR PERSONAL STUDY SIDEKICK</p><h1>AI study buddy <span class="heading-spark">✳</span></h1><p>Turn what you're learning into a practice session made just for you.</p></div><span class="tag tag-lilac">BETA PREVIEW</span></div><div class="ai-banner"><div><h2>A little practice goes a long way.</h2><p>Choose a topic and difficulty. Your study buddy will put together a mini practice quiz, complete with answer explanations.</p></div><span style="font-size:42px">✳</span></div><div class="inner-card" style="margin-top:16px"><h2>Build your practice quiz</h2><p>Pick a subject and let curiosity do the rest.</p><form class="modal-form" id="aiForm"><div class="form-row"><label>Subject<input name="subject" required placeholder="e.g. Operating systems"></label><label>Difficulty<select name="difficulty"><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option></select></label></div><div class="form-row"><label>Topic<input name="topic" placeholder="e.g. Process scheduling"></label><label>Questions<select name="count"><option>5 questions</option><option selected>10 questions</option><option>15 questions</option></select></label></div><button class="button button-primary button-small" type="submit">✳ Generate practice quiz</button></form></div><div class="section-heading" style="margin-top:24px"><div><h2>More ways to learn</h2><p>Smart tools for the way you study.</p></div></div><div class="feature-list"><div class="feature-item"><span class="feature-icon">◉</span><div><strong>Ask for a hint</strong><small>Get a nudge in the right direction when you're stuck. Hints stay off in exam mode.</small></div></div><div class="feature-item"><span class="feature-icon">↻</span><div><strong>Revise tricky topics</strong><small>Practice questions you've missed or bookmarked before.</small></div></div><div class="feature-item"><span class="feature-icon">◒</span><div><strong>Find your weak spots</strong><small>See which topics need a little more practice, then focus your study time.</small></div></div><div class="feature-item"><span class="feature-icon">文</span><div><strong>Learn your way</strong><small>Get clear explanations and switch between English and Hinglish.</small></div></div></div>`,
  creator: () => `<div class="page-head"><div><p class="eyebrow">MAKE SOMETHING WORTH SHARING</p><h1>Creator studio</h1><p>Build a quiz, share your knowledge, and see learners grow.</p></div><button class="button button-primary button-small" data-action="create-quiz">＋ Create a quiz</button></div><div class="metric-strip"><div class="metric-box"><span>Your quizzes</span><strong>08</strong></div><div class="metric-box"><span>Total attempts</span><strong>1,284</strong></div><div class="metric-box"><span>Average score</span><strong>78%</strong></div><div class="metric-box"><span>Drafts</span><strong>02</strong></div></div><div class="inner-card"><h2>Make quiz creation a breeze</h2><p>Start from scratch, import your question bank, or let AI help you brainstorm.</p><div class="create-toolbar"><button class="button button-soft" data-action="create-quiz">＋ Start from scratch</button><button class="button button-soft" data-action="import-quiz">⇧ Import questions</button><button class="button button-soft" data-view="ai">✳ AI question generator</button></div><div class="feature-list"><div class="feature-item"><span class="feature-icon">▤</span><div><strong>Question bank</strong><small>Reuse questions across quizzes and organize by topic.</small></div></div><div class="feature-item"><span class="feature-icon">◷</span><div><strong>Schedule &amp; assign</strong><small>Set a quiz window, due date, and access rules.</small></div></div><div class="feature-item"><span class="feature-icon">↗</span><div><strong>See how learners did</strong><small>Track results, review accuracy, and export reports.</small></div></div><div class="feature-item"><span class="feature-icon">▧</span><div><strong>Start with a template</strong><small>Choose a mock exam, trivia, coding, or aptitude quiz.</small></div></div></div></div><div class="inner-card"><h2>Recent quizzes</h2><p>Your latest creations and drafts.</p><div class="setting-row"><div><strong>JavaScript fundamentals</strong><small>Published · 148 attempts · Updated yesterday</small></div><span class="tag tag-mint">PUBLISHED</span></div><div class="setting-row"><div><strong>DBMS midterm practice</strong><small>Draft · 15 questions · Updated 3 days ago</small></div><span class="tag tag-peach">DRAFT</span></div><div class="setting-row"><div><strong>Weekly aptitude challenge</strong><small>Published · 92 attempts · Updated last week</small></div><span class="tag tag-mint">PUBLISHED</span></div></div>`,
  settings: () => `<div class="page-head"><div><p class="eyebrow">MAKE QUIZORA YOURS</p><h1>Settings</h1><p>Manage your profile, preferences, and learning reminders.</p></div></div><div class="inner-card"><h2>Your profile</h2><p>Keep your learner profile up to date.</p><div class="setting-row"><div><strong>Harsh Gupta</strong><small>harsh.gupta@example.com · Student</small></div><button class="button button-soft" data-action="profile">Edit profile</button></div><div class="setting-row"><div><strong>College &amp; course</strong><small>Add your college, course, and semester to personalize recommendations.</small></div><button class="button button-soft" data-action="profile">Add details</button></div></div><div class="inner-card"><h2>Preferences</h2><p>Set up Quizora to fit your routine.</p><div class="setting-row"><div><strong>Daily learning reminder</strong><small>A friendly nudge to keep your streak going.</small></div><button class="toggle on" aria-label="Toggle daily learning reminder" aria-pressed="true"></button></div><div class="setting-row"><div><strong>Competition invitations</strong><small>Let friends invite you to live quiz rooms.</small></div><button class="toggle on" aria-label="Toggle competition invitations" aria-pressed="true"></button></div><div class="setting-row"><div><strong>Weekly progress summary</strong><small>A recap of your learning, delivered every Sunday.</small></div><button class="toggle" aria-label="Toggle weekly progress summary" aria-pressed="false"></button></div></div><div class="inner-card"><h2>Good to know</h2><p>Your progress is saved on this device for this demo. Secure accounts, cloud sync, and notifications can be connected when the platform backend is added.</p></div>`,
};

function openFormModal(kind) {
  if (kind === "create-room") {
    openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close">×</button><h2 id="modalTitle">Create a live room</h2><p class="modal-subtitle">Bring your friends together for a quick quiz. You'll get a join code to share.</p><form class="modal-form" id="roomForm"><label>Room name<input name="name" required placeholder="e.g. Friday brain battle"></label><div class="form-row"><label>Quiz<select><option>DSA Speed Round</option><option>World General Knowledge</option><option>Web Developer's Toolkit</option></select></label><label>Players<select><option>Up to 10</option><option>Up to 20</option><option>Up to 50</option></select></label></div><button class="button button-primary button-small" type="submit">Create room →</button></form></div>`);
  } else if (kind === "create-quiz") {
    openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close">×</button><h2 id="modalTitle">Create a new quiz</h2><p class="modal-subtitle">Start with the basics. You can add questions, explanations, and settings next.</p><form class="modal-form" id="createQuizForm"><label>Quiz title<input name="title" required placeholder="e.g. Web development fundamentals"></label><div class="form-row"><label>Category<select><option>Computer Science</option><option>Web Development</option><option>Mathematics</option><option>General Knowledge</option></select></label><label>Difficulty<select><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div><label>Description<textarea placeholder="What will learners explore?"></textarea></label><button class="button button-primary button-small" type="submit">Create draft →</button></form></div>`);
  } else if (kind === "import-quiz") {
    openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close">×</button><h2 id="modalTitle">Import your questions</h2><p class="modal-subtitle">Bring your question bank into Quizora. CSV import works in this prototype; Excel and PDF imports can be connected to the creator backend.</p><form class="modal-form" id="importForm"><label>Choose a CSV file<input type="file" name="file" accept=".csv,text/csv" required></label><button class="button button-primary button-small" type="submit">Preview import →</button></form></div>`);
  } else {
    openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close">×</button><h2 id="modalTitle">Your learner profile</h2><p class="modal-subtitle">A few details help us find quizzes you'll love.</p><form class="modal-form" id="profileForm"><label>Your name<input name="name" value="Harsh Gupta"></label><div class="form-row"><label>College<input name="college" placeholder="Your college"></label><label>Course / semester<input name="course" placeholder="e.g. B.Tech · Semester 3"></label></div><button class="button button-primary button-small" type="submit">Save profile →</button></form></div>`);
  }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.hasAttribute("data-close")) { closeModal(); return; }
  if (target.dataset.view) { setView(target.dataset.view); document.getElementById("sidebar").classList.remove("mobile-open"); return; }
  if (target.dataset.quiz) { startQuiz(target.dataset.quiz); return; }
  if (target.dataset.bookmark) {
    const id = target.dataset.bookmark;
    if (savedQuizzes.has(id)) savedQuizzes.delete(id); else savedQuizzes.add(id);
    localStorage.setItem("quizora-saved", JSON.stringify([...savedQuizzes]));
    updateSavedCounts();
    renderQuizCards(document.getElementById("quizGrid"), currentFilter, document.getElementById("globalSearch").value);
    renderQuizCards(document.getElementById("innerQuizGrid"), innerFilter, document.getElementById("globalSearch").value);
    renderQuizCards(document.getElementById("learningQuizGrid"), "Saved");
    return;
  }
  if (target.dataset.filter) {
    currentFilter = target.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.toggle("selected", chip === target));
    renderQuizCards(document.getElementById("quizGrid"), currentFilter, document.getElementById("globalSearch").value);
    return;
  }
  if (target.dataset.innerFilter) {
    innerFilter = target.dataset.innerFilter;
    document.querySelectorAll("[data-inner-filter]").forEach((chip) => chip.classList.toggle("selected", chip === target));
    renderQuizCards(document.getElementById("innerQuizGrid"), innerFilter, document.getElementById("globalSearch").value);
    return;
  }
  if (target.dataset.answer !== undefined) {
    selectedAnswer = Number(target.dataset.answer);
    modalLayer.querySelectorAll(".answer-option").forEach((option) => option.classList.toggle("selected", option === target));
    document.getElementById("nextQuestion").disabled = false;
    return;
  }
  if (target.id === "nextQuestion") {
    if (selectedAnswer === null) return;
    const questions = questionSets[currentQuiz.id] || questionSets.daily;
    if (selectedAnswer === questions[currentQuestion].answer) quizScore += 1;
    currentQuestion += 1;
    selectedAnswer = null;
    if (currentQuestion >= questions.length) finishQuiz(); else renderQuestion();
    return;
  }
  if (target.id === "retryQuiz") { startQuiz(currentQuiz.id); return; }
  if (target.dataset.action === "daily") { startQuiz("daily"); return; }
  if (target.dataset.action) { openFormModal(target.dataset.action); return; }
  if (target.dataset.join) { toast(`Room ${target.dataset.join} is getting ready — check back soon!`); return; }
  if (target.id === "joinRoomButton") {
    const code = document.getElementById("roomCodeInput").value.trim();
    if (!code) { document.getElementById("roomCodeInput").focus(); toast("Enter a room code to join the quiz."); }
    else toast(`Looking for room ${code.toUpperCase()}…`);
    return;
  }
  if (target.id === "menuButton") { document.getElementById("sidebar").classList.toggle("mobile-open"); return; }
  if (target.id === "notificationButton") { toast("You're all caught up — we'll let you know when something's new."); return; }
  if (target.id === "topProfileButton" || target.id === "profileButton") { setView("settings"); return; }
  if (target.id === "upgradeButton") { toast("Quizora Pro is coming soon. Stay curious!"); return; }
  if (target.id === "streakButton") { toast("Eight days in a row — amazing! One more day to reach your personal best."); return; }
  if (target.id === "activityRange" || target.id === "leaderboardPeriod") { toast("Showing your progress for this week."); return; }
  if (target.classList.contains("toggle")) {
    target.classList.toggle("on");
    target.setAttribute("aria-pressed", String(target.classList.contains("on")));
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "globalSearch") return;
  if (dashboardView.classList.contains("active")) renderQuizCards(document.getElementById("quizGrid"), currentFilter, event.target.value);
  if (document.getElementById("innerQuizGrid")) renderQuizCards(document.getElementById("innerQuizGrid"), innerFilter, event.target.value);
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "roomForm") {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    openModal(`<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" data-close aria-label="Close">×</button><div style="text-align:center"><span class="tag tag-mint">ROOM READY</span><h2 id="modalTitle" style="margin-top:12px">Your room is ready!</h2><p class="modal-subtitle">Share this code with your friends to invite them in.</p><div style="padding:17px;border-radius:10px;background:#f4f2ff;color:#6253ca;font:800 27px var(--display);letter-spacing:7px">${code}</div><button class="button button-primary button-small" style="margin-top:16px" id="copyRoomCode" data-code="${code}">Copy room code</button></div></div>`);
  } else if (event.target.id === "createQuizForm") {
    const title = new FormData(event.target).get("title");
    closeModal();
    toast(`“${title}” saved as a draft. Add your questions next!`);
  } else if (event.target.id === "aiForm") {
    const subject = String(new FormData(event.target).get("subject")).trim();
    if (subject) { closeModal(); toast(`Your ${subject} practice set is ready to review! (AI generation needs a connected service.)`); }
  } else if (event.target.id === "importForm") {
    const file = new FormData(event.target).get("file");
    if (file && file.name) { closeModal(); toast(`${file.name} selected. CSV preview is ready to connect to your question bank.`); }
  } else if (event.target.id === "profileForm") {
    closeModal();
    toast("Profile saved on this device.");
  }
});

modalLayer.addEventListener("click", async (event) => {
  if (event.target === modalLayer) closeModal();
  const copyButton = event.target.closest("#copyRoomCode");
  if (copyButton) {
    try { await navigator.clipboard.writeText(copyButton.dataset.code); toast("Room code copied!"); }
    catch { toast(`Share this room code: ${copyButton.dataset.code}`); }
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("globalSearch").focus();
  }
  if (event.key === "Escape" && modalLayer.classList.contains("open")) closeModal();
});

renderQuizCards(document.getElementById("quizGrid"));
updateSavedCounts();