// Asset Management Documentation - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded, readyState:', document.readyState);
    
    // Hide preloader after page load
    const preloader = document.getElementById('preloader');
    if (preloader) {
        console.log('Preloader found');
        // Immediate hide if page already loaded
        if (document.readyState === 'complete') {
            console.log('Page complete, hiding preloader immediately');
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 200);
        } else {
            // Wait for resources
            console.log('Waiting 300ms before hiding preloader');
            setTimeout(() => {
                console.log('Hiding preloader now');
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.style.display = 'none';
                    console.log('Preloader removed');
                }, 200);
            }, 300);
        }
    } else {
        console.warn('Preloader not found!');
    }

    // Fallback: Force hide preloader after 3 seconds (safety)
    setTimeout(() => {
        if (preloader && preloader.style.display !== 'none') {
            console.warn('Force hiding preloader (fallback)');
            preloader.style.display = 'none';
        }
    }, 3000);

    // Elements
    const mainContent = document.querySelector('.content-wrapper');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const themeToggle = document.getElementById('themeToggle');
    const tocNav = document.getElementById('tocNav');
    const searchInput = document.getElementById('searchInput');

    // Current active section
    let currentSection = 'introduction';
    
    // Search query for content highlighting
    let currentSearchQuery = '';
    
    // ==================== //
    // Content Highlighting Functions
    // ==================== //
    function highlightContentText(query) {
        if (!query) return;
        
        const content = document.querySelector('.content-wrapper');
        if (!content) return;
        
        const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and already marked content
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE' ||
                        node.parentElement.tagName === 'MARK') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Only accept nodes with matching text
                    if (node.textContent.toLowerCase().includes(query.toLowerCase())) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            },
            false
        );
        
        const nodesToReplace = [];
        let node;
        
        while (node = walker.nextNode()) {
            nodesToReplace.push(node);
        }
        
        // Replace text nodes with highlighted version
        nodesToReplace.forEach(textNode => {
            const parent = textNode.parentElement;
            const text = textNode.textContent;
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            const html = text.replace(regex, '<mark class="search-highlight-content">$1</mark>');
            
            if (html !== text) {
                const temp = document.createElement('span');
                temp.innerHTML = html;
                
                // Replace text node with new marked content
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
        
        // Auto-scroll to first highlight
        setTimeout(() => {
            const firstMark = content.querySelector('mark.search-highlight-content');
            if (firstMark) {
                const headerOffset = 100;
                const elementPosition = firstMark.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    
    function clearContentHighlights() {
        const marks = document.querySelectorAll('mark.search-highlight-content');
        marks.forEach(mark => {
            const parent = mark.parentElement;
            const textContent = mark.textContent;
            parent.replaceChild(document.createTextNode(textContent), mark);
        });
        
        // Normalize to merge adjacent text nodes
        const content = document.querySelector('.content-wrapper');
        if (content) {
            content.normalize();
        }
    }
    
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==================== //
    // Navigation System
    // ==================== //
    window.navigateTo = function(section) {
        // Load documentation section
        loadDocContent(section);
        
        // Update URL hash (empty for homepage)
        if (section === 'home') {
            history.pushState(null, null, window.location.pathname);
        } else {
            window.location.hash = section;
        }
        
        // Update active nav link
        updateActiveNavLink(section);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile sidebar if open and reset hamburger
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (sidebarToggle) {
                sidebarToggle.checked = false;
            }
        }
        
        currentSection = section;
    };

    // Load Documentation Content
    function loadDocContent(sectionId) {
        if (!mainContent) return;
        
        const template = document.getElementById(`template-${sectionId}`);
        if (!template) {
            console.error(`Template not found: template-${sectionId}`);
            return;
        }

        // Fade out current content
        mainContent.style.opacity = '0';
        
        setTimeout(() => {
            // Clear and load new content
            mainContent.innerHTML = '';
            const content = template.content.cloneNode(true);
            mainContent.appendChild(content);
            
            // Generate TOC
            generateTOC(sectionId);
            
            // Apply content highlighting if search query exists
            if (currentSearchQuery) {
                setTimeout(() => {
                    highlightContentText(currentSearchQuery);
                }, 100);
            }
            
            // Fade in new content
            setTimeout(() => {
                mainContent.style.opacity = '1';
            }, 50);
        }, 300);
    }

    // Update Active Nav Link
    function updateActiveNavLink(section) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ==================== //
    // Table of Contents Generation
    // ==================== //
    function generateTOC(sectionId) {
        if (!tocNav) return;
        
        // Show TOC on all pages including homepage
        const tocContainer = document.querySelector('.toc');
        if (tocContainer) tocContainer.style.display = 'block';
        
        tocNav.innerHTML = '';
        
        // Keep TOC empty on homepage
        if (sectionId === 'home') {
            return;
        }
        
        // Get all h2 and h3 in the current section
        const section = mainContent.querySelector('.doc-section');
        if (!section) return;
        
        const headings = section.querySelectorAll('h2, h3');
        
        headings.forEach((heading, index) => {
            const level = heading.tagName === 'H2' ? 'toc-level-1' : 'toc-level-2';
            const id = `heading-${index}`;
            heading.id = id;
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.className = `toc-link ${level}`;
            link.textContent = heading.textContent;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = heading.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
            
            tocNav.appendChild(link);
        });
    }

    // ==================== //
    // Initialize on Page Load
    // ==================== //
    function initialize() {
        // Check URL hash
        const hash = window.location.hash.substring(1);
        
        if (hash && hash !== '') {
            navigateTo(hash);
        } else {
            // Default to homepage
            navigateTo('home');
        }
    }

    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1) || 'introduction';
        navigateTo(hash);
    });

    // ==================== //
    // Sidebar Toggle (Mobile)
    // ==================== //
    if (sidebarToggle) {
        sidebarToggle.addEventListener('change', function() {
            if (this.checked) {
                sidebar.classList.add('active');
            } else {
                sidebar.classList.remove('active');
            }
        });

        const toggleLabel = document.querySelector('.sidebar-toggle');
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !toggleLabel.contains(e.target)) {
                sidebar.classList.remove('active');
                sidebarToggle.checked = false;
            }
        });

        // Close sidebar when clicking nav link
        const navLinks = sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                sidebar.classList.remove('active');
                sidebarToggle.checked = false;
            });
        });
    }

    // ==================== //
    // Dark Mode Toggle (Checkbox Style)
    // ==================== //
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Set initial preloader theme
    if (preloader && currentTheme === 'dark') {
        preloader.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        // Set initial checkbox state
        themeToggle.checked = currentTheme === 'dark';
        
        themeToggle.addEventListener('change', function() {
            let newTheme = this.checked ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update preloader theme if it exists
            if (preloader) {
                if (newTheme === 'dark') {
                    preloader.classList.add('dark-mode');
                } else {
                    preloader.classList.remove('dark-mode');
                }
            }
        });
    }

    // ==================== //
    // Search Functionality - Full Content Search
    // ==================== //
    let searchResultsContainer = null;
    let isSearchMode = false;

    function getAllSectionContent() {
        const sections = [];
        const templates = document.querySelectorAll('[id^="template-"]');
        
        templates.forEach(template => {
            const sectionId = template.id.replace('template-', '');
            const content = template.content.cloneNode(true);
            const section = content.querySelector('.doc-section');
            
            if (section) {
                // Get title
                const title = section.querySelector('h1')?.textContent || sectionId;
                
                // Get all text content
                const textContent = section.textContent.toLowerCase();
                
                // Get headings for context
                const headings = Array.from(section.querySelectorAll('h2, h3')).map(h => ({
                    text: h.textContent,
                    level: h.tagName
                }));
                
                sections.push({
                    id: sectionId,
                    title: title,
                    content: textContent,
                    headings: headings
                });
            }
        });
        
        return sections;
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function getContentSnippet(content, query, maxLength = 150) {
        const lowerContent = content.toLowerCase();
        const queryPos = lowerContent.indexOf(query.toLowerCase());
        
        if (queryPos === -1) return '';
        
        const start = Math.max(0, queryPos - 50);
        const end = Math.min(content.length, queryPos + query.length + maxLength);
        
        let snippet = content.substring(start, end).trim();
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return highlightText(snippet, query);
    }

    if (searchInput) {
        const allSections = getAllSectionContent();
        
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            // Clear search - restore navigation
            if (query === '') {
                if (searchResultsContainer) {
                    searchResultsContainer.remove();
                    searchResultsContainer = null;
                }
                document.querySelector('.sidebar-nav').style.display = 'block';
                isSearchMode = false;
                
                // Clear search query and content highlights
                currentSearchQuery = '';
                clearContentHighlights();
                return;
            }

            // Enter search mode
            isSearchMode = true;
            document.querySelector('.sidebar-nav').style.display = 'none';
            
            // Remove old results
            if (searchResultsContainer) {
                searchResultsContainer.remove();
            }
            
            // Search in all sections
            const results = [];
            allSections.forEach(section => {
                if (section.content.includes(query)) {
                    const snippet = getContentSnippet(section.content, query);
                    
                    // Find matching headings
                    const matchingHeadings = section.headings.filter(h => 
                        h.text.toLowerCase().includes(query)
                    );
                    
                    results.push({
                        id: section.id,
                        title: section.title,
                        snippet: snippet,
                        headings: matchingHeadings
                    });
                }
            });
            
            // Display results
            searchResultsContainer = document.createElement('div');
            searchResultsContainer.className = 'search-results';
            
            if (results.length === 0) {
                searchResultsContainer.innerHTML = `
                    <div class="search-no-results">
                        <p>No results found for "<strong>${query}</strong>"</p>
                    </div>
                `;
            } else {
                let html = `<div class="search-results-header">Found ${results.length} result${results.length > 1 ? 's' : ''}</div>`;
                
                results.forEach(result => {
                    html += `
                        <div class="search-result-item" data-section="${result.id}" data-query="${query}">
                            <div class="search-result-title">${highlightText(result.title, query)}</div>
                            <div class="search-result-snippet">${result.snippet}</div>
                            ${result.headings.length > 0 ? `
                                <div class="search-result-headings">
                                    ${result.headings.slice(0, 2).map(h => 
                                        `<span class="search-heading-tag">${highlightText(h.text, query)}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                searchResultsContainer.innerHTML = html;
            }
            
            sidebar.querySelector('.sidebar-content').appendChild(searchResultsContainer);
            
            // Add click handlers to search results
            const resultItems = searchResultsContainer.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', function() {
                    const sectionId = this.getAttribute('data-section');
                    const searchQuery = this.getAttribute('data-query');
                    
                    // Store search query
                    currentSearchQuery = searchQuery;
                    
                    // Close sidebar on mobile
                    if (sidebar && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        if (sidebarToggle) {
                            sidebarToggle.checked = false;
                        }
                    }
                    
                    // Navigate to section
                    navigateTo(sectionId);
                });
            });
        });

        // Clear search on ESC key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        });
    }

    // ==================== //
    // Copy Code Blocks
    // ==================== //
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
            const btn = e.target.classList.contains('copy-btn') ? e.target : e.target.closest('.copy-btn');
            const codeBlock = btn.previousElementSibling;
            if (codeBlock) {
                const text = codeBlock.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                    }, 2000);
                });
            }
        }
    });

    // Initialize
    initialize();
});
