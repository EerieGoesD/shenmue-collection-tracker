document.addEventListener('DOMContentLoaded', () => {
    // Function to update progress messages
    function updateProgress() {
        // Get all unique collection types
        const checkboxes = document.querySelectorAll('#progress-tracker .status-checkbox');
        const collections = {};
        let overallChecked = 0;
        let overallTotal = 0;

        checkboxes.forEach(checkbox => {
            const collection = checkbox.dataset.collection;
            if (!collections[collection]) {
                collections[collection] = { checked: 0, total: 0 };
            }
            collections[collection].total += 1;
            if (checkbox.checked) {
                collections[collection].checked += 1;
                overallChecked += 1;
            }
            overallTotal += 1;
        });

        // Update each collection's progress message
        for (const [collection, data] of Object.entries(collections)) {
            const percentage = data.total === 0 ? 0 : Math.round((data.checked / data.total) * 100);
            const sanitizedCollection = collection.replace(/\s+/g, '');
            const progressDiv = document.getElementById(`${sanitizedCollection}-progress`);
            if (progressDiv) {
                // Fetch the collection display name from the collection div
                const collectionDiv = document.querySelector(`div.collection[data-collection-type="${collection}"]`);
                const collectionName = collectionDiv ? collectionDiv.querySelector('h3').textContent : collection;
                progressDiv.textContent = `${percentage}% ${collectionName} Completed / ${overallTotal === 0 ? 0 : Math.round((overallChecked / overallTotal) * 100)}% Total Collection Completed`;
            }
        }

        // Update overall progress
        const overallPercentage = overallTotal === 0 ? 0 : Math.round((overallChecked / overallTotal) * 100);
        const overallProgressDiv = document.getElementById('Overall-progress');
        if (overallProgressDiv) {
            overallProgressDiv.textContent = `${overallPercentage}% Total Collection Completed`;
        }
    }

    // Function to show popup message
    function showPopup(checkbox, message) {
        // Remove any existing popup
        const existingPopup = checkbox.closest('td').querySelector('.popup-progress');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create a new popup
        const popup = document.createElement('div');
        popup.className = 'popup-progress';
        popup.textContent = message;

        // Append the popup to the checkbox's parent (td)
        checkbox.closest('td').appendChild(popup);

        // Trigger reflow for CSS transition
        void popup.offsetWidth;

        // Add show class to start transition
        popup.classList.add('show');

        // Remove the popup after 2.6 seconds (fadeIn + display + fadeOut)
        setTimeout(() => {
            popup.classList.remove('show');
            // Remove the popup from DOM after transition ends
            popup.addEventListener('transitionend', () => {
                popup.remove();
            });
        }, 2600); // 300ms fadeIn + 2000ms display + 300ms fadeOut
    }

    // Function to load saved progress from localStorage
    function loadProgress() {
        const checkboxes = document.querySelectorAll('#progress-tracker input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const id = checkbox.id;
            const savedState = localStorage.getItem(id);
            if (savedState === 'true') {
                checkbox.checked = true;
            }
        });
    }

    // Function to save progress to localStorage
    function saveProgress(id, state) {
        if (state) {
            localStorage.setItem(id, 'true');
        } else {
            localStorage.removeItem(id);
        }
    }

    // Function to update status classes based on checkbox state
    function updateStatus(checkbox, label) {
        if (checkbox.checked) {
            label.classList.add('done');
            label.classList.remove('in_progress');
        } else {
            label.classList.add('in_progress');
            label.classList.remove('done');
        }
    }

    // Initialize the tracker
    function initTracker() {
        // Load saved progress
        loadProgress();

        // Initial progress update
        updateProgress();

        // Attach event listeners to checkboxes
        const checkboxes = document.querySelectorAll('#progress-tracker input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            updateStatus(checkbox, label);

            checkbox.addEventListener('change', () => {
                const id = checkbox.id;
                const collection = checkbox.dataset.collection;

                // Save to localStorage
                saveProgress(id, checkbox.checked);

                // Update progress messages
                updateProgress();

                // Calculate current progress for the collection
                const collectionCheckboxes = document.querySelectorAll(`input[data-collection="${collection}"]`);
                const total = collectionCheckboxes.length;
                const checked = Array.from(collectionCheckboxes).filter(cb => cb.checked).length;
                const percentage = total === 0 ? 0 : Math.round((checked / total) * 100);

                // Calculate overall progress
                const allCheckboxes = document.querySelectorAll('#progress-tracker .status-checkbox');
                const overallTotal = allCheckboxes.length;
                const overallChecked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
                const overallPercentage = overallTotal === 0 ? 0 : Math.round((overallChecked / overallTotal) * 100);

                // Prepare popup message
                const collectionDiv = document.querySelector(`div.collection[data-collection-type="${collection}"]`);
                const collectionName = collectionDiv ? collectionDiv.querySelector('h3').textContent : collection;
                const message = `${percentage}% ${collectionName} Completed / ${overallPercentage}% Total Collection Completed`;

                // Show popup next to the checkbox
                showPopup(checkbox, message);

                // Update status classes
                updateStatus(checkbox, label);
            });
        });
    }

    // Start the tracker
    initTracker();
});