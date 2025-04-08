
// ! new code
document.addEventListener("DOMContentLoaded", function () {
    viewFiles();
    toggleFileAction(); // Initialize correct UI
});

function truncateFileName(name, maxLength = 20) {
    return name.length > maxLength ? name.substring(0, 17) + '...' : name;
}

function updateFileName() {
    let fileInput = document.getElementById("fileInput");
    let selectedFileName = document.getElementById("selectedFileName");

    if (fileInput.files.length > 0) {
        selectedFileName.textContent = truncateFileName(fileInput.files[0].name);
    } else {
        selectedFileName.textContent = "No file chosen";
    }
}

function uploadFile() {
    let fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert("Please select a file to upload!");
        return;
    }

    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/upload', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        viewFiles();
        document.getElementById("selectedFileName").textContent = "No file chosen";
    })
    .catch(error => console.error("Error:", error));
}

function createFile() {
    let fileNameInput = document.getElementById('fileNameInput');
    let fileContentInput = document.getElementById('fileContentInput');

    let fileName = fileNameInput.value.trim();
    let fileContent = fileContentInput.value;

    if (!fileName) {
        alert('Please enter a file name.');
        return;
    }

    fetch('/create-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName, content: fileContent })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        viewFiles();
        fileNameInput.value = "";
        fileContentInput.value = "";
    })
    .catch(error => console.error("Error:", error));
}

function downloadFile(filename) {
    fetch(`/download/${filename}`)
    .then(response => {
        if (!response.ok) throw new Error("Download failed");
        return response.blob();
    })
    .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(error => console.error("Error:", error));
}

function viewFiles() {
    let searchQuery = document.getElementById("searchInput").value;
    let sortBy = document.getElementById("sortOptions").value;
    let spinner = document.getElementById("loadingSpinner");
    let refreshButton = document.getElementById("refreshButton");

    spinner.style.display = "block";
    refreshButton.disabled = true;
    refreshButton.innerText = "Loading...";

    fetch(`/files?search=${searchQuery}&sort_by=${sortBy}`)
    .then(response => response.json())
    .then(files => {
        let fileListDiv = document.getElementById('fileList').querySelector('ul');
        fileListDiv.innerHTML = "";

        files.forEach(file => {
            let fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            let truncatedName = truncateFileName(file.name);
            
            fileListDiv.innerHTML += `
            <li>
                ${truncatedName} (${file.type}, ${fileSizeMB} MB) 
                <button class="rename-btn" onclick="renameFile('${file.name}')">Rename</button>
                <button class="delete-btn" onclick="deleteFile('${file.name}')">Delete</button>
                <button class="download-btn" onclick="downloadFile('${file.name}')">Download</button>
            </li>`;
        });
    })
    .catch(error => console.error("Error:", error))
    .finally(() => {
        spinner.style.display = "none";
        refreshButton.disabled = false;
        refreshButton.innerText = "Refresh List";
    });
}

function deleteFile(filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    fetch(`/delete/${filename}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        viewFiles();
    })
    .catch(error => console.error("Error:", error));
}

function renameFile(oldName) {
    let newName = prompt(`Enter new name for "${oldName}":`);
    if (!newName) return;

    fetch('/rename', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_name: oldName, new_name: newName })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        viewFiles();
    })
    .catch(error => console.error("Error:", error));
}

function searchFiles() {
    viewFiles();
}

// Toggle between "Upload File" and "Create File"
function toggleFileAction() {
    let actionSelect = document.getElementById("fileAction");
    let uploadSection = document.getElementById("uploadSection");
    let createSection = document.getElementById("createSection");

    if (actionSelect.value === "upload") {
        uploadSection.style.display = "block";
        createSection.style.display = "none";
    } else {
        uploadSection.style.display = "none";
        createSection.style.display = "block";
    }
}
