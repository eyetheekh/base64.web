document.addEventListener("DOMContentLoaded", () => {

    const toggleThemeBtn = document.querySelector("#toggle-theme");
    toggleThemeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute("data-theme")
        if (currentTheme === "dark") {
            document.documentElement.setAttribute("data-theme", "light")
            localStorage.setItem("data-theme", "light")
        } else {
            document.documentElement.setAttribute("data-theme", "dark")
            localStorage.setItem("data-theme", "dark")
        }
    })

})

const dragtarget = document.querySelector('#dragtarget');
dragtarget.addEventListener('dragover', (e) => {
    e.preventDefault()
    console.log("dragged into");

})

dragtarget.addEventListener('dragleave', (e) => {
    e.preventDefault()
    console.log("dragg exit");

})

dragtarget.addEventListener('drop', (e) => {
    e.preventDefault()

    const files = e.dataTransfer.files;
    console.log("handleFileDrop triggerred");
    console.log("Dropped files:", files);

    const fileArray = Array.from(files)
    renderFilesArray(fileArray)

})



const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    renderFilesArray(files)
});



// async function renderFilesArray(fileArray) {
//     const container = document.getElementById("selected-files");
//     container.innerHTML = "";

//     for (const file of fileArray) {
//         const url = URL.createObjectURL(file);
//         let media;

//         if (file.type.startsWith("image/")) {
//             media = document.createElement("img");
//             media.src = url;
//             media.onload = () => URL.revokeObjectURL(url);
//         }
//         else if (file.type === "application/pdf") {
//             media = document.createElement("embed");
//             media.src = url;
//             media.type = "application/pdf";
//             media.onload = () => URL.revokeObjectURL(url);
//         }
//         else if (file.type === "text/plain" || file.type === "text/markdown") {
//             media = document.createElement("pre");

//             const textContent = await file.text();
//             media.textContent = textContent;
//         }
//         else {
//             media = document.createElement("p");
//             media.textContent = "Preview not available";
//         }

//         media.style.width = "200px";

//         const text = document.createElement("p");
//         text.textContent = file.name;

//         const copyBtn = document.createElement("button");
//         copyBtn.textContent = "COPY BASE64";

//         copyBtn.onclick = async () => {
//             const base64 = await convert_to_base64(file);
//             await navigator.clipboard.writeText(base64);
//             console.log("copied");
//         };

//         const li = document.createElement("li");
//         const div = document.createElement("div");

//         div.append(text, media, copyBtn);
//         li.appendChild(div);
//         container.appendChild(li);
//     }
// };

async function renderFilesArray(fileArray) {
    const container = document.getElementById("selected-files");
    container.innerHTML = "";

    if (fileArray.length === 0) {
        container.innerHTML = '<li class="placeholder-text">No files selected yet.</li>';
        return;
    }

    for (const file of fileArray) {
        // Create elements
        const li = document.createElement("li");
        li.className = "file-card";

        // --- SECTION 1: Header (Name, Size, Copy) ---
        const header = document.createElement("div");
        header.className = "file-header";

        const name = document.createElement("div");
        name.className = "file-name";
        name.textContent = file.name;

        const meta = document.createElement("div");
        meta.className = "file-meta";

        // Format File Size
        const sizeInKb = file.size / 1024;
        const sizeLabel = sizeInKb > 1024
            ? `${(sizeInKb / 1024).toFixed(2)} MB`
            : `${sizeInKb.toFixed(1)} KB`;

        const size = document.createElement("span");
        size.className = "file-size";
        size.textContent = sizeLabel;

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "COPY";

        copyBtn.onclick = async () => {
            try {
                const base64 = await convert_to_base64(file);
                await navigator.clipboard.writeText(base64);

                // Feedback
                const originalText = copyBtn.textContent;
                copyBtn.textContent = "DONE";
                copyBtn.classList.add("success");
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove("success");
                }, 2000);
            } catch (err) {
                alert("Failed to copy Base64 string.");
            }
        };

        meta.append(size, copyBtn);
        header.append(name, meta);

        // --- SECTION 2: Preview Area ---
        const previewWindow = document.createElement("div");
        previewWindow.className = "preview-window";
        const url = URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = url;
            img.onload = () => URL.revokeObjectURL(url); // Clean up memory
            previewWindow.appendChild(img);
        } else if (file.type === "application/pdf") {
            const embed = document.createElement("embed");
            embed.src = url;
            embed.type = "application/pdf";
            previewWindow.appendChild(embed);
        } else if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
            const pre = document.createElement("pre");
            pre.textContent = await file.text();
            previewWindow.appendChild(pre);
        } else {
            previewWindow.innerHTML = "<p>Preview not available for this file type.</p>";
        }

        // --- Assemble Card ---
        li.append(header, previewWindow);
        container.appendChild(li);
    }
}


function convert_to_base64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
};


const encodeSection = `
    <header class="hero-section">
        <h1>Convert Files to Base64</h1>
        <p>Securely encode your images and documents locally in your browser.</p>
    </header>

    <section class="converter-box" id="dragtarget">
        <label for="file-input" class="file-label">
            <div class="upload-icon">📁</div>
            <span>Click to browse or drag & drop files here</span>
            <input type="file" id="file-input" multiple hidden>
        </label>
    </section>

    <section class="display-box">
        <h3>Selected Files</h3>
        <ul id="selected-files">
            <li class="placeholder-text">No files selected yet. Your encoded strings will appear here.</li>
        </ul>
    </section>
`

const decodeSection = `
    <section class="decode-box">
        <header class="hero-section">
            <h1>Decode Base64 to Files</h1>
            <p>Decode base64 strings locally in your browser.</p>
        </header>

        <label for="textarea" > Paste your Base64 String here </label>
        <textarea name="textarea" id="base64InputTextArea" rows="5" cols="15"   placeholder="base64..."></textarea>
        <button id="decodeTextBtn" >Decode</button>
    </section>
`

const encodeBtn = document.querySelector("#encode-btn");
encodeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const mainContainer = document.querySelector('#main-container');
    mainContainer.innerHTML = encodeSection;
});


const decodeBtn = document.querySelector("#decode-btn");
decodeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const mainContainer = document.querySelector('#main-container');
    mainContainer.innerHTML = decodeSection;

    const decodeTextBtn = document.querySelector("#decodeTextBtn");
    decodeTextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const base64String = document.querySelector("#base64InputTextArea");
        console.log(base64String.value);

    })

});
