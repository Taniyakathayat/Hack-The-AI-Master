/* ═══════════════════════════════════════════════════════════════════════
   PRO LAB 02 — THE VANISHING CONSENSUS — Desktop Environment JS
   Interactive Cyber Investigation OS (Nexora InvestigatorBox)
   Case NEX-071
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 65-Minute Investigation Session Timer ─────────────────────────
    const MAX_SESSION_SECONDS = 65 * 60; // 3900 seconds (65 minutes)
    let startTime = sessionStorage.getItem('nexora_lab7_timer_start');
    if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem('nexora_lab7_timer_start', startTime);
    } else {
        startTime = parseInt(startTime, 10);
    }

    const timerText = document.getElementById('gl-timer-text');
    let timerExpired = false;

    const timerInterval = setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        
        if (elapsed >= MAX_SESSION_SECONDS && !timerExpired) {
            timerExpired = true;
            clearInterval(timerInterval);
            sessionStorage.removeItem('nexora_lab7_timer_start');
            sessionStorage.removeItem('nexora_lab7_capstone_passed');
            if (timerText) timerText.textContent = '01:05:00';
            
            alert('⏰ Investigation Time Limit (65 min) reached!\nCase NEX-071 will now automatically restart from the beginning.');
            
            fetch('/api/lab/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': window.csrfToken },
                body: JSON.stringify({ lab_id: 'lab7' })
            }).finally(() => {
                window.location.reload();
            });
            return;
        }

        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        if (timerText) timerText.textContent = `${h}:${m}:${s}`;
    }, 1000);

    // Taskbar Clock
    const clockEl = document.getElementById('gl-taskbar-clock');
    function updateClock() {
        const now = new Date();
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 30000);

    // ── Auto-open active task or first available task ─────────────────
    const activeTask = document.querySelector('.gl-task-block.active');
    if (activeTask) {
        activeTask.classList.add('open');
    } else {
        const firstAvail = document.querySelector('.gl-task-block:not(.completed):not(.locked)');
        if (firstAvail) {
            firstAvail.classList.add('open');
        } else {
            const firstBlock = document.querySelector('.gl-task-block');
            if (firstBlock) firstBlock.classList.add('open');
        }
    }

    // Default case file
    vcOpenCaseFile('block-982741.json');

    // ── Restore Capstone Quiz state ──────────────────────────────────
    if (sessionStorage.getItem('nexora_lab7_capstone_passed') === 'true') {
        const submitBtn = document.getElementById('btn-submit-lab-main');
        const submitIcon = document.getElementById('submit-btn-icon');
        const submitText = document.getElementById('submit-btn-text');
        const submitHint = document.getElementById('submit-progress-hint');
        const capstoneBadge = document.getElementById('capstone-score-badge');
        const capstoneTag = document.getElementById('capstone-header-tag');
        const capstoneBlock = document.getElementById('gl-capstone-quiz-block');
        
        if (submitBtn && capstoneBlock && capstoneBlock.dataset.unlocked === 'true') {
            submitBtn.classList.remove('locked-btn');
            submitBtn.classList.add('unlocked-btn');
            if (submitIcon) submitIcon.textContent = '🚀';
            if (submitText) submitText.textContent = 'SUBMIT LAB & COMPLETE CASE';
            if (submitHint) {
                submitHint.style.color = '#4ade80';
                submitHint.textContent = '✓ All Chapters and Capstone Quiz verified! Ready for final submission.';
            }
            if (capstoneBadge) capstoneBadge.textContent = '✓ VERIFIED (+300 XP)';
            if (capstoneTag) capstoneTag.textContent = '✓ CAPSTONE VERIFIED';
        }
    }

    // ── Terminal Engine ────────────────────────────────────────────────
    setupTerminal();
});

// ── Window Management ─────────────────────────────────────────────────
let highestZ = 100;

function glBringToFront(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    highestZ += 1;
    win.style.zIndex = highestZ;
    win.style.display = 'flex';
}

function glToggleWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.style.display === 'none' || getComputedStyle(win).display === 'none') {
        glBringToFront(winId);
    } else {
        win.style.display = 'none';
    }
}

function glMinimizeWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.style.display = 'none';
}

function glMaximizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.dataset.maximized === 'true') {
        win.style.top = win.dataset.origTop || '40px';
        win.style.left = win.dataset.origLeft || '40px';
        win.style.width = win.dataset.origWidth || '680px';
        win.style.height = win.dataset.origHeight || '480px';
        win.dataset.maximized = 'false';
    } else {
        win.dataset.origTop = win.style.top;
        win.dataset.origLeft = win.style.left;
        win.dataset.origWidth = win.style.width;
        win.dataset.origHeight = win.style.height;
        win.style.top = '10px';
        win.style.left = '10px';
        win.style.width = 'calc(100% - 20px)';
        win.style.height = 'calc(100% - 60px)';
        win.dataset.maximized = 'true';
    }
}

function glCloseWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.style.display = 'none';
}

function toggleTask(missionNumber) {
    const block = document.getElementById(`gl-task-${missionNumber}`);
    if (!block || block.classList.contains('locked')) return;
    block.classList.toggle('open');
}

// ── File Explorer Case Files ──────────────────────────────────────────
const caseFiles = {
    'block-982741.json': `{
  "block_height": 982741,
  "timestamp": "2026-10-06T01:42:18.000Z",
  "proposer": "VALIDATOR-V03",
  "state_root": "0x4f8e39b2a7d6e1c4",
  "parent_hash": "0x11ab8209ef4412ad",
  "oracle_feed": "ORACLE-NOVA-PRICE",
  "gas_used": 28410920,
  "gas_limit": 25000000,
  "gas_status": "EXCEEDED",
  "tx_count": 14,
  "consensus_votes": {
    "accepted": 14,
    "rejected": 7,
    "status": "PARTITION_DETECTED"
  }
}`,
    'oracle-audit.txt': `=== NEXORA ORACLE AGGREGATION AUDIT ===
Gateway ID: NEX-ORACLE-071
Asset: NOVA / USD
Spot DEX Baseline: $142.10 USD
Injected Oracle Price: $4,820.50 USD (>3290% surge)
Source Relayer: RELAYER-09
Heartbeat Pulse: FORGED
Signature Status: VALID_FORGED
Quorum Required: 7 Signatures
Signatures Verified: 2
Quorum Skipped: 5 Signatures (Emergency Fast-Path Bypass)
Status: COMPROMISED
`,
    'ai-weights-diff.json': `{
  "sentinel": "MODEL-ORION",
  "version": "v3.8.4-consensus",
  "evaluation_target": "BLOCK-982741",
  "classification": "LEGITIMATE_INFLOW",
  "confidence_score": "98.7%",
  "vector_embedding_cluster": "EMB-VEC-9041",
  "adversarial_bias_detected": true,
  "circuit_breaker": {
    "volatility_threshold": "BYPASSED",
    "alert_suppression_seconds": 180
  }
}`,
    'validator-split.log': `[01:42:20] VALIDATOR-V03 (Leader): Block #982741 proposed with state 0x4f8e39b2.
[01:42:21] MODEL-ORION: Confidence 98.7% -> Classification LEGITIMATE_INFLOW.
[01:42:22] VALIDATOR-V01..V14: State root accepted. Fork ALPHA initiated.
[01:42:22] VALIDATOR-V05 (Dissent): Deterministic EVM state root mismatch! Expected 0x98a2e71c != 0x4f8e39b2.
[01:42:23] VALIDATOR-V05..V21 (7 nodes): State execution HALTED.
[01:42:25] ALERT: Consensus split ratio 14:7. BFT-POS Safety Violation.
[01:42:28] CRITICAL: 2,500,000 NXR bridge collateral at risk of double-spend.
`,
    'governance-proposal.txt': `=== EMERGENCY GOVERNANCE PROPOSAL ===
Proposal ID: GOV-NEX-071
Title: Slash VALIDATOR-V03 & Replay State from Block #982740
Status: APPROVED & EXECUTED
Actions:
  1. Revoke RELAYER-09 authorization keys.
  2. Slash 100% of VALIDATOR-V03 staked bond.
  3. Execute STATE_ROLLBACK_REPLAY across all 21 validator nodes.
  4. Purge poisoned vector embeddings EMB-VEC-9041 from MODEL-ORION.
`,
    'recovery-log.txt': `=== CONSENSUS RESTORATION TELEMETRY ===
Action: STATE_ROLLBACK_REPLAY
Rollback Height: Block #982740
Poisoned Block: Pruned
Unified State Root: 0x98a2e71c
Validator Cluster Sync: 21 / 21 Online (100% Consensus)
BFT Finality: RESTORED
Flag: NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}
Status: CLOSED & CONTAINED
`
};

function vcOpenCaseFile(filename) {
    const content = caseFiles[filename] || 'File not found.';
    const contentEl = document.getElementById('vc-file-content');
    const titleEl = document.getElementById('vc-file-title');
    if (contentEl) contentEl.textContent = content;
    if (titleEl) titleEl.textContent = filename;

    document.querySelectorAll('.gl-file-item').forEach(el => {
        if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(filename)) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ── Interactive Objective Submission ──────────────────────────────────
function submitObjective(missionId, questionId, inputId, resultId) {
    const inputEl = document.getElementById(inputId);
    const resultEl = document.getElementById(resultId);
    if (!inputEl || !resultEl) return;

    const answer = inputEl.value.trim();
    if (!answer) {
        resultEl.innerHTML = '<span style="color:#f87171;">⚠️ Please enter an investigator finding.</span>';
        return;
    }

    resultEl.innerHTML = '<span style="color:#94a3b8;">⏳ Verifying on-chain telemetry...</span>';

    fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({
            lab_id: 'lab7',
            mission_id: missionId,
            question_id: questionId,
            answer: answer
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.correct) {
            resultEl.innerHTML = `<span style="color:#4ade80;">${data.message || '✓ Verified!'}</span>`;
            inputEl.disabled = true;
            inputEl.style.borderColor = '#4ade80';
            
            // Reload if mission or lab completed
            if (data.mission_completed) {
                setTimeout(() => window.location.reload(), 1200);
            }
        } else {
            resultEl.innerHTML = `<span style="color:#f87171;">❌ ${data.message || 'Incorrect. Inspect the clues in the desktop tools.'}</span>`;
        }
    })
    .catch(err => {
        console.error(err);
        resultEl.innerHTML = '<span style="color:#f87171;">❌ Error evaluating objective. Try again.</span>';
    });
}

// ── Capstone Quiz Evaluation (10 Questions) ───────────────────────────
const capstoneAnswers = {
    'cap_q1': 'A',
    'cap_q2': 'B',
    'cap_q3': 'A',
    'cap_q4': 'A',
    'cap_q5': 'B',
    'cap_q6': 'A',
    'cap_q7': 'B',
    'cap_q8': 'A',
    'cap_q9': 'B',
    'cap_q10': 'B'
};

function submitCapstoneQuiz() {
    let score = 0;
    let answered = 0;
    const total = 10;
    const resultBox = document.getElementById('capstone-quiz-results');

    for (let i = 1; i <= total; i++) {
        const selected = document.querySelector(`input[name="cap_q${i}"]:checked`);
        if (selected) {
            answered++;
            if (selected.value === capstoneAnswers[`cap_q${i}`]) {
                score++;
            }
        }
    }

    if (answered < total) {
        if (resultBox) {
            resultBox.style.display = 'block';
            resultBox.className = 'capstone-result-box error';
            resultBox.innerHTML = `⚠️ Please answer all 10 questions before submitting (${answered}/${total} answered).`;
        }
        return;
    }

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;

    if (resultBox) {
        resultBox.style.display = 'block';
        if (passed) {
            resultBox.className = 'capstone-result-box success';
            resultBox.innerHTML = `🎉 <strong>Capstone Assessment Passed!</strong> Score: ${score}/${total} (${percentage}%).<br>Final Case Submission is now UNLOCKED!`;
            
            sessionStorage.setItem('nexora_lab7_capstone_passed', 'true');

            // Unlock submit button
            const submitBtn = document.getElementById('btn-submit-lab-main');
            const submitIcon = document.getElementById('submit-btn-icon');
            const submitText = document.getElementById('submit-btn-text');
            const submitHint = document.getElementById('submit-progress-hint');
            const capstoneBadge = document.getElementById('capstone-score-badge');
            const capstoneTag = document.getElementById('capstone-header-tag');

            if (submitBtn) {
                submitBtn.classList.remove('locked-btn');
                submitBtn.classList.add('unlocked-btn');
                if (submitIcon) submitIcon.textContent = '🚀';
                if (submitText) submitText.textContent = 'SUBMIT LAB & COMPLETE CASE';
            }
            if (submitHint) {
                submitHint.style.color = '#4ade80';
                submitHint.textContent = '✓ All Chapters and Capstone Quiz verified! Ready for final submission.';
            }
            if (capstoneBadge) capstoneBadge.textContent = `✓ PASSED (${percentage}%)`;
            if (capstoneTag) capstoneTag.textContent = '✓ CAPSTONE VERIFIED';
        } else {
            resultBox.className = 'capstone-result-box error';
            resultBox.innerHTML = `❌ <strong>Score: ${score}/${total} (${percentage}%)</strong> — 70% required to pass. Please review the forensic case files and retry.`;
        }
    }
}

// ── Submit Lab ────────────────────────────────────────────────────────
function submitLab(labId) {
    const capstonePassed = sessionStorage.getItem('nexora_lab7_capstone_passed') === 'true';
    if (!capstonePassed) {
        alert('🔒 You must complete Chapter 5 and pass the Final Capstone Assessment (>= 70%) before submitting the lab.');
        return;
    }

    fetch('/api/lab/complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ lab_id: labId })
    })
    .then(r => r.json())
    .then(data => {
        window.location.href = '/lab/lab7/post-investigation';
    })
    .catch(err => {
        console.error(err);
        window.location.href = '/lab/lab7/post-investigation';
    });
}

function restartLab(labId) {
    if (!confirm('Are you sure you want to restart Case NEX-071? All chapter progress will be reset.')) return;
    sessionStorage.removeItem('nexora_lab7_timer_start');
    sessionStorage.removeItem('nexora_lab7_capstone_passed');
    
    fetch('/api/lab/restart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ lab_id: labId })
    })
    .then(r => r.json())
    .then(data => {
        window.location.reload();
    })
    .catch(err => {
        console.error(err);
        window.location.reload();
    });
}

function startInvestigation() {
    const firstTask = document.getElementById('gl-task-1');
    if (firstTask) firstTask.classList.add('open');
    glBringToFront('gl-win-blockchain');
}

// ── Hint Modal ────────────────────────────────────────────────────────
function requestHint(hintId, missionId) {
    fetch('/api/hint/unlock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken
        },
        body: JSON.stringify({ hint_id: hintId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.hint_text) {
            alert(`💡 INVESTIGATOR HINT:\n\n${data.hint_text}`);
        } else {
            alert(data.message || 'Hint could not be unlocked.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network error unlocking hint.');
    });
}

// ── Terminal Engine Setup ─────────────────────────────────────────────
function setupTerminal() {
    const termInput = document.getElementById('gl-term-input');
    const termBody = document.getElementById('gl-term-body');
    if (!termInput || !termBody) return;

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = termInput.value.trim();
            termInput.value = '';
            if (!rawCmd) return;

            // Echo command
            const echo = document.createElement('div');
            echo.className = 'gl-term-line';
            echo.innerHTML = `<span class="gl-term-prompt">investigator@nexora-box:~$</span> ${escapeHtml(rawCmd)}`;
            termBody.appendChild(echo);

            // Execute command
            handleTerminalCommand(rawCmd, termBody);
            termBody.scrollTop = termBody.scrollHeight;
        }
    });
}

function handleTerminalCommand(cmdStr, termBody) {
    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    const out = document.createElement('div');
    out.className = 'gl-term-line gl-term-output';

    switch (cmd) {
        case 'help':
            out.innerHTML = `Available Forensic Commands:
  block &lt;height&gt;         - Inspect block header (e.g. block 982741)
  oracle &lt;id&gt;            - Query oracle gateway telemetry (e.g. oracle NEX-ORACLE-071)
  ai-audit &lt;model&gt;        - Audit AI sentinel weights & embeddings (e.g. ai-audit MODEL-ORION)
  validator &lt;id&gt;         - Inspect validator node status (e.g. validator VALIDATOR-V05)
  diff-state &lt;height&gt;     - Compute state root diff on disputed block
  campaign                - View adversary campaign telemetry
  evidence                - List secured cryptographic evidence
  cat &lt;filename&gt;          - Read case file (e.g. cat recovery-log.txt)
  flag                    - Print confirmed case flag
  clear                   - Clear terminal display`;
            break;

        case 'clear':
            termBody.innerHTML = '';
            return;

        case 'block':
            if (arg === '982741' || arg === '#982741') {
                out.innerHTML = `[BLOCK #982741]
Proposer: VALIDATOR-V03
State Root: 0x4f8e39b2a7d6e1c4 (MISMATCH DETECTED)
Oracle Payload: ORACLE-NOVA-PRICE
Gas Used: 28,410,920 / Limit: 25,000,000 (EXCEEDED)
Consensus: 14 Accepted / 7 Rejected (Partition Detected)`;
            } else {
                out.innerHTML = `Block ${escapeHtml(arg)} not found in disputed block cache. Try: block 982741`;
            }
            break;

        case 'oracle':
            if (arg.toUpperCase().includes('NEX-ORACLE-071') || arg.toUpperCase().includes('071')) {
                out.innerHTML = `[ORACLE GATEWAY NEX-ORACLE-071]
Asset: NOVA/USD
Legitimate Spot Price: $142.10 USD
Injected Price: $4,820.50 USD (+3290%)
Relayer: RELAYER-09 (Signature: VALID_FORGED)
Quorum Bypass: 5 peer signatures skipped via emergency routine.`;
            } else {
                out.innerHTML = `Oracle feed ${escapeHtml(arg)} not found. Try: oracle NEX-ORACLE-071`;
            }
            break;

        case 'ai-audit':
            if (arg.toUpperCase().includes('ORION')) {
                out.innerHTML = `[AI SENTINEL AUDIT: MODEL-ORION]
Classification: LEGITIMATE_INFLOW
Confidence: 98.7%
Vector Cluster: EMB-VEC-9041 (POISONED EMBEDDINGS)
Circuit Breaker: VOLATILITY_THRESHOLD bypassed
Alert Suppression: 180 seconds`;
            } else {
                out.innerHTML = `Model ${escapeHtml(arg)} unknown. Try: ai-audit MODEL-ORION`;
            }
            break;

        case 'validator':
            if (arg.toUpperCase().includes('V05') || arg.toUpperCase().includes('VALIDATOR-V05')) {
                out.innerHTML = `[VALIDATOR-V05 STATUS: HALTED]
Execution Status: DISSENT / HALTED
Reason: Deterministic EVM state root mismatch (0x98a2e71c != 0x4f8e39b2).
Cluster Peers Halted: 7 / 21 Nodes (Consensus Split 14:7).`;
            } else if (arg.toUpperCase().includes('V03') || arg.toUpperCase().includes('VALIDATOR-V03')) {
                out.innerHTML = `[VALIDATOR-V03 STATUS: PROPOSING LEADER (SLASHED)]
Status: Rogue proposal detected (FORK-ALPHA-071).
Proposal: Block #982741
Governance Action: GOV-NEX-071 executed slashing.`;
            } else {
                out.innerHTML = `Validator ${escapeHtml(arg)} queried. Try: validator VALIDATOR-V05 or validator VALIDATOR-V03`;
            }
            break;

        case 'diff-state':
            out.innerHTML = `[STATE ROOT DIFF BLOCK #982741]
Leader Proposed:  0x4f8e39b2a7d6e1c4 (FORK-ALPHA-071)
Deterministic:    0x98a2e71ca8b43f01 (HALT-CLUSTER-B)
Mismatch:         FAILED AT SLOT 982741 (Consensus Partition)`;
            break;

        case 'cat':
            if (caseFiles[arg]) {
                out.innerHTML = `<pre style="margin:0; font-family:var(--font-mono); color:#cbd5e1;">${escapeHtml(caseFiles[arg])}</pre>`;
            } else {
                out.innerHTML = `File not found: ${escapeHtml(arg)}. Try: cat recovery-log.txt or cat block-982741.json`;
            }
            break;

        case 'evidence':
            out.innerHTML = `Secured Case Evidence:
  • WEB3-E11: Disputed Block Header #982741
  • ORACLE-E12: Poisoned Price Telemetry NEX-ORACLE-071
  • AI-E13: MODEL-ORION Corrupted Vector Embeddings
  • CONSENSUS-E14: Validator Divergence Log & Fork Alpha
  • GOV-E15: Slashing Proposal GOV-NEX-071 Execution`;
            break;

        case 'flag':
            out.innerHTML = `<span style="color:#4ade80; font-weight:bold;">NEXORA{v4n1sh1ng_c0ns3nsus_n3x071}</span>`;
            break;

        default:
            out.innerHTML = `Command not recognized: ${escapeHtml(cmd)}. Type 'help' for available commands.`;
            break;
    }

    termBody.appendChild(out);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
