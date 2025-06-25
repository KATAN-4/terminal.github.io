// Pyodide initialization
let pyodideReady = false;
let pyodide;
let inPythonMode = false;
let pyodideLoadPromise = (async function () {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
  });
  pyodide.setStdout({
    batched: (msg) => {
      appendToTerminal(msg);
    }
  });
  pyodideReady = true;
  console.log("Pyodide loaded successfully");
  return pyodide;
})();

// Matrix Effect
function initMatrix() {
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = "01";
  const fontSize = 16;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(0);

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#800080";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById("resolution").textContent = window.innerWidth + "x" + window.innerHeight;
  });
}

// Hardware info
function getCPUInfo() {
  return navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " cores" : "Unknown";
}

function getGPUInfo() {
  let canvas = document.createElement("canvas");
  let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return 'Unavailable';
  let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown GPU';
}

function getMemoryInfo() {
  if (navigator.deviceMemory) {
    return `${(navigator.deviceMemory * 1024).toFixed(0)} MB (this may be incorrect due to browser restrictions)`;
  }
  return "Unknown";
}


function updateHardwareInfo() {
  document.getElementById("resolution").textContent = window.innerWidth + "x" + window.innerHeight;
  document.getElementById("cpu").textContent = getCPUInfo();
  document.getElementById("gpu").textContent = getGPUInfo();
  document.getElementById("memory").textContent = getMemoryInfo();
}

// Terminal
function appendToTerminal(text, className = 'line') {
  const line = document.createElement("div");
  line.className = className;
  line.textContent = text;
  document.getElementById("terminal-container").appendChild(line);
  line.scrollIntoView();
}

function createInputLine() {
  const wrapper = document.createElement("div");
  wrapper.className = "input-line";

  const topLine = document.createElement("div");
  topLine.className = "prompt";
  topLine.textContent = "┌──(mang0㉿mang0)-[~]";

  const bottomLine = document.createElement("div");
  bottomLine.className = "input-wrapper";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "└─$ ";

  const input = document.createElement("input");
  input.className = "input";
  input.autocomplete = "off";
  input.spellcheck = false;

  bottomLine.appendChild(prompt);
  bottomLine.appendChild(input);
  wrapper.appendChild(topLine);
  wrapper.appendChild(bottomLine);
  document.getElementById("terminal-container").appendChild(wrapper);
  input.focus();

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      input.disabled = true;

      if (cmd === "clear") {
        document.getElementById("terminal-container").innerHTML = "";
        createInputLine();
        return;
      }

      if (cmd === "py") {
        inPythonMode = true;
        appendToTerminal("Python interactive mode (type 'exit' to quit)");
        createPythonInput();
        return;
      }

      // Komutlar
      const commands = {
        "--help": `Available commands:
--help         Show this help message
clear          Clear the terminal
py             Enter Python mode
version        Show MangoOS version
neofetch       Display system info
uname -a       Show kernel and system info
ls             List current directory
cd             Change directory (mock)
whoami         Display current user
instagram      Open Instagram`,
        "version": "MangoOS version 1.0.0",
        "neofetch": () => `MangoOS 1.0.0\nResolution: ${window.innerWidth}x${window.innerHeight}\nCPU: ${getCPUInfo()}\nGPU: ${getGPUInfo()}\nMemory: ${getMemoryInfo()}`,
        "uname -a": "MangoOS 5.15.0-mango #1 SMP Fri Jun 21 2025 x86_64 GNU/Linux",
        "ls": "Desktop  Documents  Downloads  Music  Pictures  Videos",
        "cd": "You are not allowed to leave this directory :)",
        "whoami": "mang0",
        "instagram": () => {
          const link = document.createElement("a");
          link.href = "https://instagram.com/mang0.inc";
          link.target = "_blank";
          link.style.color = "#00ff00";
          link.textContent = "https://instagram.com/mang0.inc";
          const line = document.createElement("div");
          line.className = "line";
          line.appendChild(link);
          document.getElementById("terminal-container").appendChild(line);
          return "";
        }
      };

      const result = commands[cmd];
      if (typeof result === 'function') {
        const output = result();
        if (output) appendToTerminal(output);
      } else if (result !== undefined) {
        appendToTerminal(result);
      } else {
        appendToTerminal(`Command not found: ${cmd}`);
      }

      createInputLine();
    }
  });
}

function createPythonInput() {
  const wrapper = document.createElement("div");
  wrapper.className = "input-line";

  const topLine = document.createElement("div");
  topLine.className = "prompt";
  topLine.textContent = "┌──(mang0㉿mang0)-[Python]";

  const bottomLine = document.createElement("div");
  bottomLine.className = "input-wrapper";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "└─>>> ";

  const input = document.createElement("input");
  input.className = "input";
  input.autocomplete = "off";

  bottomLine.appendChild(prompt);
  bottomLine.appendChild(input);
  wrapper.appendChild(topLine);
  wrapper.appendChild(bottomLine);
  document.getElementById("terminal-container").appendChild(wrapper);
  input.focus();

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const pyCmd = input.value.trim();
      input.disabled = true;

      if (pyCmd.toLowerCase() === 'exit()') {
        inPythonMode = false;
        appendToTerminal("Exited Python interactive mode");
        createInputLine();
        return;
      }

      try {
        if (pyodideReady) {
          appendToTerminal(">>> " + pyCmd, 'python-input');
          const result = await pyodide.runPythonAsync(pyCmd);
          if (result !== undefined) appendToTerminal(result.toString());
        } else {
          appendToTerminal("Python is still loading...");
        }
      } catch (err) {
        appendToTerminal(err.toString(), 'error');
      }

      createPythonInput();
    }
  });
}

// Start
window.addEventListener('load', () => {
  updateHardwareInfo();
  initMatrix();
  createInputLine();
});