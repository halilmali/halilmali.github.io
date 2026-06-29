document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // PLACEHOLDER: Replace with your actual Google Client ID
    const GOOGLE_CLIENT_ID = "172237452870-82djbart930c3ftbcm7or73fdrbn3a9d.apps.googleusercontent.com";

    // --- DOM Elements ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const tagsContainer = document.getElementById('tags-container');
    const variablesPreview = document.getElementById('variables-preview');
    const selectionSection = document.getElementById('selection-section');
    const contactFilter = document.getElementById('contact-filter');
    const btnSelectAll = document.getElementById('btn-select-all');
    const btnSelectNone = document.getElementById('btn-select-none');
    const tableHeaders = document.getElementById('table-headers');
    const tableBody = document.getElementById('table-body');
    const emailSettings = document.getElementById('email-settings');
    const emailColSelect1 = document.getElementById('email-col-select-1');
    const emailColSelect2 = document.getElementById('email-col-select-2');
    const emailSubjectInput = document.getElementById('email-subject');
    const templateEditor = document.getElementById('template-editor');
    const btnGenerate = document.getElementById('btn-generate');
    const btnSendEmail = document.getElementById('btn-send-email');
    const btnPrint = document.getElementById('btn-print');
    const previewContainer = document.getElementById('preview-container');
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');
    const progressContainer = document.getElementById('progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStatus = document.getElementById('progress-status');
    const printView = document.getElementById('print-view');

    // Auth Elements
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const btnLogout = document.getElementById('btn-logout');

    // --- State ---
    let dataSource = null;
    let headers = [];
    let selectedIndices = new Set();
    let googleToken = null;
    let userEmail = null;

    // --- Initialization ---
    initGoogleAuth();

    // --- Google Auth Logic ---
    function initGoogleAuth() {
        if (typeof google === 'undefined') {
            setTimeout(initGoogleAuth, 100);
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("google-login-btn"),
            { theme: "outline", size: "large", type: "standard", shape: "pill" }
        );
    }

    function handleCredentialResponse(response) {
        const payload = parseJwt(response.credential);
        userEmail = payload.email;
        userName.textContent = payload.name;
        userAvatar.src = payload.picture;

        document.getElementById("google-login-btn").classList.add('hidden');
        userProfile.classList.remove('hidden');
        btnSendEmail.classList.remove('hidden');

        // Request Access Token for Gmail API
        requestAccessToken();
    }

    function requestAccessToken() {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/gmail.send',
            callback: (response) => {
                if (response.access_token) {
                    googleToken = response.access_token;
                }
            },
        });
        client.requestAccessToken();
    }

    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    btnLogout.onclick = () => {
        googleToken = null;
        userProfile.classList.add('hidden');
        document.getElementById("google-login-btn").classList.remove('hidden');
        btnSendEmail.classList.add('hidden');
    };

    // --- File Handling ---
    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            try {
                const workbook = XLSX.read(data, { type: 'array' });
                let allData = [];
                let allHeaders = new Set();

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    if (json.length > 0) {
                        allData = allData.concat(json);
                        // Collect headers from this sheet
                        Object.keys(json[0]).forEach(h => allHeaders.add(h));
                    }
                });

                if (allData.length === 0) {
                    alert("The file appears to be empty or contains no data.");
                    return;
                }

                dataSource = allData;
                
                // Filter out headers that are empty across all rows
                headers = Array.from(allHeaders).filter(header => {
                    return allData.some(row => {
                        const val = row[header];
                        return val !== undefined && val !== null && val.toString().trim() !== "";
                    });
                });

                selectedIndices = new Set(); // Start with zero selection as requested

                showFileInfo(file.name);
                renderVariables(headers);
                renderContactsTable();
                populateEmailSelect();
                btnGenerate.disabled = false;
            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Failed to parse file.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const showFileInfo = (name) => {
        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        fileNameDisplay.textContent = name;
        variablesPreview.classList.remove('hidden');
        selectionSection.classList.remove('hidden');
    };

    const resetFile = () => {
        dataSource = null;
        headers = [];
        selectedIndices.clear();
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        variablesPreview.classList.add('hidden');
        selectionSection.classList.add('hidden');
        btnGenerate.disabled = true;
        btnPrint.classList.add('hidden');
        statusBar.classList.add('hidden');
        previewContainer.innerHTML = `<div class="empty-state"><i class="ph ph-files"></i><p>Upload data to see preview.</p></div>`;
    };

    // --- Table & Selection Logic ---
    const renderContactsTable = () => {
        tableHeaders.innerHTML = '<th><input type="checkbox" id="header-checkbox" title="Select/Deselect All Visible"></th>';
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            tableHeaders.appendChild(th);
        });

        tableBody.innerHTML = '';
        dataSource.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.idx = idx;
            tr.innerHTML = `<td><input type="checkbox" class="row-checkbox" data-idx="${idx}"></td>`;
            headers.forEach(h => {
                const td = document.createElement('td');
                td.textContent = row[h];
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        tableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                const idx = parseInt(e.target.dataset.idx);
                if (e.target.checked) selectedIndices.add(idx);
                else selectedIndices.delete(idx);
                updateHeaderCheckbox();
            }
        });

        document.getElementById('header-checkbox').onchange = (e) => {
            setSelection(e.target.checked);
        };
    };

    const updateHeaderCheckbox = () => {
        const headerCheckbox = document.getElementById('header-checkbox');
        if (!headerCheckbox) return;

        const visibleCheckboxes = Array.from(tableBody.querySelectorAll('tr:not(.hidden) .row-checkbox'));
        if (visibleCheckboxes.length === 0) {
            headerCheckbox.checked = false;
            headerCheckbox.indeterminate = false;
            return;
        }

        const checkedVisible = visibleCheckboxes.filter(cb => cb.checked);
        headerCheckbox.checked = checkedVisible.length === visibleCheckboxes.length;
        headerCheckbox.indeterminate = checkedVisible.length > 0 && checkedVisible.length < visibleCheckboxes.length;
    };

    const filterContacts = () => {
        const query = contactFilter.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
        updateHeaderCheckbox();
    };

    const setSelection = (select) => {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cb = row.querySelector('.row-checkbox');
            const idx = parseInt(cb.dataset.idx);
            const isVisible = !row.classList.contains('hidden');

            if (select) {
                // Select All: Select ONLY visible rows
                cb.checked = isVisible;
                if (isVisible) selectedIndices.add(idx);
                else selectedIndices.delete(idx);
            } else {
                // Select None: Unselect visible rows
                if (isVisible) {
                    cb.checked = false;
                    selectedIndices.delete(idx);
                }
            }
        });
        updateHeaderCheckbox();
    };

    const populateEmailSelect = () => {
        const optionsHTML = '<option value="">-- Select Column --</option>';
        emailColSelect1.innerHTML = optionsHTML;
        emailColSelect2.innerHTML = optionsHTML;

        headers.forEach(h => {
            const opt1 = document.createElement('option');
            opt1.value = h;
            opt1.textContent = h;
            if (h.toLowerCase().includes('email')) opt1.selected = true;
            emailColSelect1.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = h;
            opt2.textContent = h;
            emailColSelect2.appendChild(opt2);
        });
        emailSettings.classList.remove('hidden');
    };

    const renderVariables = (headers) => {
        tagsContainer.innerHTML = '';
        headers.forEach(header => {
            const tag = document.createElement('div');
            tag.className = 'var-tag';
            tag.textContent = `{{${header}}}`;
            tag.onclick = () => copyToClipboard(`{{${header}}}`, tag);
            tagsContainer.appendChild(tag);
        });
    };

    const copyToClipboard = (text, element) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = element.textContent;
            element.classList.add('copied');
            element.textContent = "Copied!";
            setTimeout(() => {
                element.classList.remove('copied');
                element.textContent = originalText;
            }, 800);
        });
    };

    // --- Merge Logic ---
    const performMerge = () => {
        const template = templateEditor.value;
        if (!template.trim()) return alert("Please enter a template.");
        if (selectedIndices.size === 0) return alert("Please select at least one contact.");

        previewContainer.innerHTML = '';
        printView.innerHTML = '';

        selectedIndices.forEach(idx => {
            const row = dataSource[idx];
            let mergedText = template;
            headers.forEach(header => {
                const regex = new RegExp(`\\{\\{\\s*${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'gi');
                mergedText = mergedText.replace(regex, row[header] || "");
            });

            const card = document.createElement('div');
            card.className = 'merged-card';
            card.textContent = mergedText;
            previewContainer.appendChild(card);

            const printDoc = document.createElement('div');
            printDoc.className = 'print-doc';
            printDoc.textContent = mergedText;
            printView.appendChild(printDoc);
        });

        statusText.textContent = `Generated ${selectedIndices.size} documents.`;
        statusBar.classList.remove('hidden');
        btnPrint.classList.remove('hidden');
        previewContainer.scrollTop = 0;
    };

    // --- Email Sending Logic ---
    async function sendEmails() {
        if (!googleToken) {
            alert("Please login with Google first.");
            requestAccessToken();
            return;
        }

        const emailCol1 = emailColSelect1.value;
        const emailCol2 = emailColSelect2.value;
        if (!emailCol1 && !emailCol2) return alert("Please select at least one email column.");

        const template = templateEditor.value;
        const subjectTemplate = emailSubjectInput.value || "Mail Merge Document";
        const confirmSend = confirm(`Are you sure you want to send emails to ${selectedIndices.size} selected contacts?`);
        if (!confirmSend) return;

        progressContainer.classList.remove('hidden');
        let sentCount = 0;
        const total = selectedIndices.size;

        for (const idx of selectedIndices) {
            const row = dataSource[idx];
            
            // Collect unique valid emails from both columns
            const recipients = new Set();
            [emailCol1, emailCol2].forEach(col => {
                if (col && row[col]) {
                    const email = row[col].toString().trim();
                    if (email.includes('@')) recipients.add(email);
                }
            });

            if (recipients.size === 0) {
                console.warn(`Skipping row ${idx}: No valid email found`);
                continue;
            }

            const recipientString = Array.from(recipients).join(', ');
            let body = template;
            let subject = subjectTemplate;

            headers.forEach(header => {
                const regex = new RegExp(`\\{\\{\\s*${header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'gi');
                const value = row[header] || "";
                body = body.replace(regex, value);
                subject = subject.replace(regex, value);
            });

            try {
                await sendGmail(recipientString, subject, body);
                sentCount++;
                updateProgress(sentCount, total);
            } catch (error) {
                console.error(`Error sending to ${recipientString}:`, error);
            }
        }

        alert(`Finished! ${sentCount} emails sent.`);
        setTimeout(() => progressContainer.classList.add('hidden'), 3000);
    }

    async function sendGmail(to, subject, body) {
        // Construct MIME message
        const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
        const messageParts = [
            `To: ${to}`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            body
        ];
        const message = messageParts.join('\n');
        const encodedMessage = btoa(unescape(encodeURIComponent(message)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw: encodedMessage })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error.message);
        }
    }

    function updateProgress(current, total) {
        const percent = (current / total) * 100;
        progressBarFill.style.width = `${percent}%`;
        progressStatus.textContent = `Sent ${current}/${total}...`;
    }

    // --- Events ---
    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFile(e.target.files[0]);
    removeFileBtn.onclick = resetFile;
    btnGenerate.onclick = performMerge;
    btnPrint.onclick = () => window.print();
    btnSendEmail.onclick = sendEmails;
    contactFilter.oninput = filterContacts;
    btnSelectAll.onclick = () => setSelection(true);
    btnSelectNone.onclick = () => setSelection(false);

    // Toggle Section
    document.getElementById('selection-header').onclick = () => {
        selectionSection.classList.toggle('collapsed');
    };

    // Drag & Drop
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
    dropZone.ondragleave = () => dropZone.classList.remove('dragover');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    };
});
