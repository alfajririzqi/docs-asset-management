// Asset Management Documentation

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded, readyState:', document.readyState);
    
    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        console.log('Preloader found');
        if (document.readyState === 'complete') {
            console.log('Page complete, hiding preloader immediately');
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 200);
        } else {
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

    setTimeout(() => {
        if (preloader && preloader.style.display !== 'none') {
            console.warn('Force hiding preloader (fallback)');
            preloader.style.display = 'none';
        }
    }, 3000);

    // DOM elements
    const mainContent = document.querySelector('.content-wrapper');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const themeToggle = document.getElementById('themeToggle');
    const tocNav = document.getElementById('tocNav');
    const searchInput = document.getElementById('searchInput');

    // State
    let currentSection = 'introduction';
    let currentSearchQuery = '';
    
    // Content highlighting for search results
    function highlightContentText(query) {
        if (!query) return;
        
        const content = document.querySelector('.content-wrapper');
        if (!content) return;
        
        const walker = document.createTreeWalker(
            content,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE' ||
                        node.parentElement.tagName === 'MARK') {
                        return NodeFilter.FILTER_REJECT;
                    }
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
        
        nodesToReplace.forEach(textNode => {
            const parent = textNode.parentElement;
            const text = textNode.textContent;
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            const html = text.replace(regex, '<mark class="search-highlight-content">$1</mark>');
            
            if (html !== text) {
                const temp = document.createElement('span');
                temp.innerHTML = html;
                
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
        
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
        
        const content = document.querySelector('.content-wrapper');
        if (content) {
            content.normalize();
        }
    }
    
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Navigation
    window.navigateTo = function(section) {
        loadDocContent(section);
        
        if (section === 'home') {
            history.pushState(null, null, window.location.pathname);
        } else {
            window.location.hash = section;
        }
        
        updateActiveNavLink(section);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (sidebarToggle) {
                sidebarToggle.checked = false;
            }
        }
        
        currentSection = section;
    };

    function loadDocContent(sectionId) {
        if (!mainContent) return;
        
        const template = document.getElementById(`template-${sectionId}`);
        if (!template) {
            console.error(`Template not found: template-${sectionId}`);
            return;
        }

        mainContent.style.opacity = '0';
        
        setTimeout(() => {
            mainContent.innerHTML = '';
            const content = template.content.cloneNode(true);
            mainContent.appendChild(content);
            
            generateTOC(sectionId);
            
            if (currentSearchQuery) {
                setTimeout(() => {
                    highlightContentText(currentSearchQuery);
                }, 100);
            }
            
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

    // Table of Contents
    function generateTOC(sectionId) {
        if (!tocNav) return;
        
        const tocContainer = document.querySelector('.toc');
        if (tocContainer) tocContainer.style.display = 'block';
        
        tocNav.innerHTML = '';
        
        if (sectionId === 'home') {
            return;
        }
        
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

    function initialize() {
        const hash = window.location.hash.substring(1);
        
        if (hash && hash !== '') {
            navigateTo(hash);
        } else {
            navigateTo('home');
        }
    }

    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1) || 'introduction';
        navigateTo(hash);
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('change', function() {
            if (this.checked) {
                sidebar.classList.add('active');
            } else {
                sidebar.classList.remove('active');
            }
        });

        const toggleLabel = document.querySelector('.sidebar-toggle');
        
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !toggleLabel.contains(e.target)) {
                sidebar.classList.remove('active');
                sidebarToggle.checked = false;
            }
        });

        const navLinks = sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                sidebar.classList.remove('active');
                sidebarToggle.checked = false;
            });
        });
    }

    // Dark mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (preloader && currentTheme === 'dark') {
        preloader.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';
        
        themeToggle.addEventListener('change', function() {
            let newTheme = this.checked ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (preloader) {
                if (newTheme === 'dark') {
                    preloader.classList.add('dark-mode');
                } else {
                    preloader.classList.remove('dark-mode');
                }
            }
        });
    }

    // Search functionality
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
                const title = section.querySelector('h1')?.textContent || sectionId;
                const textContent = section.textContent.toLowerCase();
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
            
            if (query === '') {
                if (searchResultsContainer) {
                    searchResultsContainer.remove();
                    searchResultsContainer = null;
                }
                document.querySelector('.sidebar-nav').style.display = 'block';
                isSearchMode = false;
                currentSearchQuery = '';
                clearContentHighlights();
                return;
            }

            isSearchMode = true;
            document.querySelector('.sidebar-nav').style.display = 'none';
            
            if (searchResultsContainer) {
                searchResultsContainer.remove();
            }
            
            const results = [];
            allSections.forEach(section => {
                if (section.content.includes(query)) {
                    const snippet = getContentSnippet(section.content, query);
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
            
            const resultItems = searchResultsContainer.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', function() {
                    const sectionId = this.getAttribute('data-section');
                    const searchQuery = this.getAttribute('data-query');
                    
                    currentSearchQuery = searchQuery;
                    
                    if (sidebar && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        if (sidebarToggle) {
                            sidebarToggle.checked = false;
                        }
                    }
                    
                    navigateTo(sectionId);
                });
            });
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        });
    }

    // Copy code blocks
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

    // Start
    initialize();
});
