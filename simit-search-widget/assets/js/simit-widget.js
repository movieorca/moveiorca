/**
 * SIMIT Search Widget JavaScript
 * Version: 1.0.0
 */

(function() {
    'use strict';

    /**
     * SIMIT Widget Controller
     */
    const SimitWidget = {
        // State
        state: {
            selectedOption: null,
            currentSearch: '',
            isLoading: false
        },

        // DOM Elements Cache
        elements: {},

        /**
         * Initialize the widget
         */
        init: function() {
            this.cacheElements();
            this.bindEvents();
        },

        /**
         * Cache DOM elements
         */
        cacheElements: function() {
            this.elements = {
                searchInput: document.getElementById('simitSearchInput'),
                searchButton: document.getElementById('simitSearchButton'),
                modal: document.getElementById('simitSelectionModal'),
                loadingContainer: document.getElementById('simitLoadingContainer'),
                optionsContainer: document.getElementById('simitOptionsContainer'),
                resultsContainer: document.getElementById('simitResultsContainer'),
                closeBtn: document.getElementById('simitCloseBtn'),
                continueBtn: document.getElementById('simitContinueBtn'),
                newSearchBtn: document.getElementById('simitNewSearchBtn'),
                searchNumber: document.getElementById('simitSearchNumber'),
                resultNumber: document.getElementById('simitResultNumber'),
                resultsLink: document.getElementById('simitResultsLink'),
                options: document.querySelectorAll('.simit-option')
            };
        },

        /**
         * Bind event listeners
         */
        bindEvents: function() {
            // Search button click
            if (this.elements.searchButton) {
                this.elements.searchButton.addEventListener('click', this.handleSearch.bind(this));
            }

            // Enter key on search input
            if (this.elements.searchInput) {
                this.elements.searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        this.handleSearch();
                    }
                }.bind(this));
            }

            // Close modal button
            if (this.elements.closeBtn) {
                this.elements.closeBtn.addEventListener('click', this.closeModal.bind(this));
            }

            // Option selection (Event delegation)
            if (this.elements.optionsContainer) {
                this.elements.optionsContainer.addEventListener('click', function(e) {
                    const option = e.target.closest('.simit-option');
                    if (option) {
                        const optionIndex = parseInt(option.getAttribute('data-option'));
                        this.selectOption(optionIndex);
                    }
                }.bind(this));
            }

            // Continue button
            if (this.elements.continueBtn) {
                this.elements.continueBtn.addEventListener('click', this.handleContinue.bind(this));
            }

            // New search button
            if (this.elements.newSearchBtn) {
                this.elements.newSearchBtn.addEventListener('click', this.handleNewSearch.bind(this));
            }

            // Close modal on backdrop click
            if (this.elements.modal) {
                this.elements.modal.addEventListener('click', function(e) {
                    if (e.target === this.elements.modal) {
                        this.closeModal();
                    }
                }.bind(this));
            }

            // Close modal on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && this.isModalOpen()) {
                    this.closeModal();
                }
            }.bind(this));
        },

        /**
         * Handle search action
         */
        handleSearch: function() {
            if (this.state.isLoading) {
                return;
            }

            const searchValue = this.elements.searchInput.value.trim();

            if (searchValue === '') {
                this.showAlert('Por favor ingrese un número de identificación o placa');
                return;
            }

            // Validate input (alphanumeric only)
            if (!/^[a-zA-Z0-9]+$/.test(searchValue)) {
                this.showAlert('Por favor ingrese solo números y letras');
                return;
            }

            this.state.currentSearch = searchValue;
            this.state.isLoading = true;

            // Show modal with loading state
            this.showModal();
            this.showLoading();
            this.hideOptions();
            this.hideResults();

            // Disable search button
            this.setSearchButtonState(false);

            // Simulate API call - show options after delay
            setTimeout(function() {
                this.hideLoading();
                this.showOptions();
                this.elements.searchNumber.textContent = searchValue;
                this.setSearchButtonState(true);
                this.state.isLoading = false;
            }.bind(this), 10000);
        },

        /**
         * Select an option
         */
        selectOption: function(optionIndex) {
            this.state.selectedOption = optionIndex;

            // Clear all selections
            this.elements.options.forEach(function(opt) {
                opt.classList.remove('selected');
            });

            const radios = document.querySelectorAll('input[name="simitOption"]');
            radios.forEach(function(radio) {
                radio.checked = false;
            });

            // Select clicked option
            this.elements.options[optionIndex].classList.add('selected');
            document.getElementById('simitOption' + (optionIndex + 1)).checked = true;

            // Enable continue button
            this.elements.continueBtn.disabled = false;
        },

        /**
         * Handle continue action
         */
        handleContinue: function() {
            if (this.state.selectedOption === null || this.state.isLoading) {
                return;
            }

            this.state.isLoading = true;

            // Disable continue button
            this.elements.continueBtn.disabled = true;

            // Show loading
            this.hideOptions();
            this.showLoading();

            // Random delay between 10-15 seconds
            const randomDelay = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;

            setTimeout(function() {
                this.hideLoading();
                this.showResults();

                // Set result data
                this.elements.resultNumber.textContent = this.state.currentSearch;

                // Build target URL
                const targetUrl = 'https://www.fcm.org.co/simit/#/estado-cuenta?numDocPlacaProp=' +
                    encodeURIComponent(this.state.currentSearch);
                this.elements.resultsLink.href = targetUrl;

                this.state.isLoading = false;
            }.bind(this), randomDelay);
        },

        /**
         * Handle new search
         */
        handleNewSearch: function() {
            this.closeModal();
            this.resetState();
            this.elements.searchInput.value = '';
            this.elements.searchInput.focus();
        },

        /**
         * Show modal
         */
        showModal: function() {
            if (this.elements.modal) {
                this.elements.modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                // Set focus to close button for accessibility
                setTimeout(function() {
                    this.elements.closeBtn.focus();
                }.bind(this), 100);
            }
        },

        /**
         * Close modal
         */
        closeModal: function() {
            if (this.elements.modal) {
                this.elements.modal.classList.remove('active');
                document.body.style.overflow = '';
                this.resetModalState();
            }
        },

        /**
         * Check if modal is open
         */
        isModalOpen: function() {
            return this.elements.modal && this.elements.modal.classList.contains('active');
        },

        /**
         * Show loading state
         */
        showLoading: function() {
            if (this.elements.loadingContainer) {
                this.elements.loadingContainer.classList.add('active');
            }
        },

        /**
         * Hide loading state
         */
        hideLoading: function() {
            if (this.elements.loadingContainer) {
                this.elements.loadingContainer.classList.remove('active');
            }
        },

        /**
         * Show options
         */
        showOptions: function() {
            if (this.elements.optionsContainer) {
                this.elements.optionsContainer.style.display = 'block';
            }
        },

        /**
         * Hide options
         */
        hideOptions: function() {
            if (this.elements.optionsContainer) {
                this.elements.optionsContainer.style.display = 'none';
            }
        },

        /**
         * Show results
         */
        showResults: function() {
            if (this.elements.resultsContainer) {
                this.elements.resultsContainer.classList.add('active');
            }
        },

        /**
         * Hide results
         */
        hideResults: function() {
            if (this.elements.resultsContainer) {
                this.elements.resultsContainer.classList.remove('active');
            }
        },

        /**
         * Set search button enabled/disabled state
         */
        setSearchButtonState: function(enabled) {
            if (this.elements.searchButton) {
                this.elements.searchButton.disabled = !enabled;
            }
        },

        /**
         * Reset state
         */
        resetState: function() {
            this.state.selectedOption = null;
            this.state.currentSearch = '';
            this.state.isLoading = false;
        },

        /**
         * Reset modal state
         */
        resetModalState: function() {
            this.hideLoading();
            this.showOptions();
            this.hideResults();

            // Clear selections
            this.elements.options.forEach(function(opt) {
                opt.classList.remove('selected');
            });

            const radios = document.querySelectorAll('input[name="simitOption"]');
            radios.forEach(function(radio) {
                radio.checked = false;
            });

            this.elements.continueBtn.disabled = true;
        },

        /**
         * Show alert
         */
        showAlert: function(message) {
            alert(message);
        }
    };

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SimitWidget.init();
        });
    } else {
        SimitWidget.init();
    }

})();
