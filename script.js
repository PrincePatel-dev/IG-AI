const typingForm = document.querySelector(".prompt_form");
const suggestions = document.querySelectorAll("#suggestion-list .card");
const chatList = document.querySelector(".chat-list");
const deleteBtn = document.querySelector("#del");

let userMessage = null;

const API_KEY = "AIzaSyAHWArEzSh4Cg4zLaXmxZ0ug2c-EqNhXpY";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalStorage = () => {
  const savedChats = localStorage.getItem("savedChats");

  chatList.innerHTML = savedChats || "";
  document.body.classList.toggle("hide-header", savedChats);
};

// create a new Element and return it
const createMessageElemet = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// show typing effect one by one
// showTypingEffect = (text, textElement) => {
//   const words = text.splits(" ");
//   let currentWordIndex = 0;

//   const typingInterval = setInterval(() => {
//     // append each word to the text element with a space
//     textElement.innerText +=
//       (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
//   }, 7);

//   // if all words are displayed
//   if (currentWordIndex === words.length) {
//     clearInterval(typingInterval);
//   }
// };

// fetch response from API based on user message
const generate_API_Response = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  // send a POST request to the API with the user's message
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json();

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );
    textElement.innerText = apiResponse;
    incomingMessageDiv.classList.remove("loading");
    localStorage.setItem("savedChats", chatList.innerHTML);
    chatList.scrollTo(0, chatList.scrollHeight);

    // showTypingEffect(apiResponse, textElement.innerText);
  } catch (error) {
    console.log(error);
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `
  <div class="message-content">
    <img src="image/ai.png" alt="IG image" class="avatar">
    <p class="text"></p>
    <div class="loading-indicator">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
  <span onclick="copyMessage(this)" class="material-symbols-rounded icon">
    content_copy
    </span>`;

  const incomingMessageDiv = createMessageElemet(html, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);

  generate_API_Response(incomingMessageDiv);
};

const copyMessage = () => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(copyText);
  copyIcon.innerText = "done"; // show tick icon
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000); // revert icon after 1 second
};

// handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage) return;

  const html = `<div class="message-content">
  <img src="image/user.png" alt="User Image" class="avatar">
  <p class="text"></p>
</div>`;

  const outgoingMessageDiv = createMessageElemet(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatList.appendChild(outgoingMessageDiv);

  typingForm.reset(); // clear input
  chatList.scrollTo(0, chatList.scrollHeight);
  document.body.classList.add("hide-header");
  setTimeout(showLoadingAnimation, 500); // show loading animation after a delay
};

// set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".card-text").innerText;
    handleOutgoingChat();
  });
});

deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all messages ?")) {
    localStorage.removeItem("savedChats");
    loadLocalstorageData();
  }
});

// prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});

// Function to handle scrolling to the bottom
const scrollToBottom = () => {
  chatList.scrollTop = chatList.scrollHeight;
};

// Ensure scrolling to the bottom after page load
window.onload = function () {
  setTimeout(() => {
    scrollToBottom();
  }, 100); // Small delay to ensure content is rendered
};

loadLocalStorage();
