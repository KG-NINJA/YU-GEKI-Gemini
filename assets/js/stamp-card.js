// assets/js/stamp-card.js

document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY_USER_PROGRESS = 'geminiQuoteBlogUserProgress_v1'; // Added version for potential future structure changes
    const todayString = new Date().toISOString().split('T')[0];

    // User data from LocalStorage (or initialize if none)
    let userData = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_PROGRESS)) || {
        lastVisitDate: null,
        stamps: 0,
        rank: "Curious Newcomer" // Initial English rank
    };

    // Increment stamp if it's a new day's visit
    if (userData.lastVisitDate !== todayString) {
        userData.stamps += 1;
        userData.lastVisitDate = todayString;
        // Update rank based on new stamp count
        updateUserRank();
        // Save updated user data to LocalStorage
        localStorage.setItem(STORAGE_KEY_USER_PROGRESS, JSON.stringify(userData));
    }

    // Rank update logic (titles and thresholds are examples, feel free to customize)
    function updateUserRank() {
        if (userData.stamps >= 30) {
            userData.rank = "Quote Virtuoso";
        } else if (userData.stamps >= 15) {
            userData.rank = "Wisdom Master";
        } else if (userData.stamps >= 7) {
            userData.rank = "Dedicated Reader";
        } else if (userData.stamps >= 3) {
            userData.rank = "Quote Collector";
        }
        // You can add code here to display the rank on the page if you want
        // e.g., const rankDisplay = document.getElementById('userRankDisplay');
        //       if (rankDisplay) rankDisplay.textContent = `Your Title: ${userData.rank}`;
    }

    // (Re)calculate and potentially display rank on page load
    updateUserRank(); 

    // Dynamically set up Twitter share buttons
    const shareButtons = document.querySelectorAll('.twitter-share-button');
    shareButtons.forEach(button => {
        const postPermalink = button.getAttribute('data-post-permalink');
        const tweetEssence = button.getAttribute('data-tweet-essence');

        if (postPermalink && tweetEssence) {
            // Construct tweet text including the English rank
            const tweetText = `[${userData.rank}] AI Quote of the Day: "${tweetEssence}" See more 👇`;
            const encodedTweetText = encodeURIComponent(tweetText);
            const encodedPermalink = encodeURIComponent(postPermalink);
            
            button.href = `https://twitter.com/intent/tweet?text=${encodedTweetText}&url=${encodedPermalink}`;
            button.target = "_blank"; // Open in a new tab
            button.rel = "noopener noreferrer"; // Security measure
        } else {
            // Fallback if data attributes are missing (e.g., hide the button)
            // console.warn("Share button missing data attributes:", button);
            button.style.display = 'none';
        }
    });
});
