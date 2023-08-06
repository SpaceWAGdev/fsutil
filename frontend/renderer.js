console.log("[R]> Renderer Loaded")

document.querySelector("#openFolderBtn").addEventListener('click', async () => {
    // console.log("[R]> CLICK")
    const path = await window.electronAPI.selectFolder();
    if (path !== undefined) {
        document.querySelector("#openFolderBtn").innerText = path;       
    }
})

function humanFileSize(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}


const generalPreviewPane = document.querySelector("#generalPreviewPane")
const docxPreviewPane = document.querySelector("#docxPreviewPane")
const noPreviewAvailableMessage = document.querySelector("#noPreviewAvailableMessage")


const startBtn = document.querySelector("#startFiltering");
const filterDocuments = document.querySelector("#filterCheckDocuments");
const filterImages = document.querySelector("#filterCheckImages");
const filterMedia = document.querySelector("#filterCheckMedia");
const filterCompressed = document.querySelector("#filterCheckCompressed");
const filterNone = document.querySelector("#filterCheckAll");


const cDate = document.querySelector("#cDate");
const fileName = document.querySelector("#fileName");
const mDate = document.querySelector("#mDate");
const fileSize = document.querySelector("#size");
const friendlyFileType = document.querySelector("#friendlyFiletype");
const fPath = document.querySelector("#path");


function RenderFile(file){
    generalPreviewPane.classList.add("hidden");
    docxPreviewPane.classList.add("hidden");
    noPreviewAvailableMessage.classList.add("hidden");

    if (file.size != -1) {
        console.log("[R] File being rendered: " + JSON.stringify(file))
        if ((file.path.slice(-4) == "docx")){
            docxPreviewPane.classList.remove("hidden");
            var options = { inWrapper: false, ignoreWidth: true, ignoreHeight: true } // https://github.com/VolodymyrBaydalka/docxjs#api
            docx.renderAsync(file.content, document.getElementById("container"), null, options)
            .then(x => console.log("docx: finished"));
        }
        else if (file.mime == "application/pdf"){
            generalPreviewPane.classList.remove("hidden");
            generalPreviewPane.setAttribute("src", "file://"+file.path);
            generalPreviewPane.classList.toggle("hidden");
            generalPreviewPane.classList.toggle("hidden");
        }
        else if ((file.human_readable_type == "Textdatei") ||(file.human_readable_type == "Bild") || (file.human_readable_type == "Video") || (file.name.split(-3) == "pdf")){
            generalPreviewPane.classList.remove("hidden");
            generalPreviewPane.setAttribute("src", "file://"+file.path);
            generalPreviewPane.classList.toggle("hidden");
            generalPreviewPane.classList.toggle("hidden");
        }
        else {
            noPreviewAvailableMessage.classList.remove("hidden");
        }
    }
    else {
        noPreviewAvailableMessage.classList.remove("hidden");
    }

    fileName.textContent = file.name;
    cDate.textContent = file.creation_date;
    mDate.textContent = file.last_modified_date;
    fileSize.textContent = humanFileSize(file.size);
    friendlyFileType.textContent = file.human_readable_type;
    fPath.textContent = file.path;
}

function isChecked(input){
    return input.checked;
}

startBtn.addEventListener('click', async () => {
    console.log("[R]> StartBtn CLICK")
    console.log(isChecked(filterCompressed))

    var filtersObject = {
        documents: isChecked(filterDocuments),
        images: isChecked(filterImages),
        media: isChecked(filterMedia),
        compressed: isChecked(filterCompressed),
        none: isChecked(filterNone)
    };

    console.log(`[R]> ${JSON.stringify(filtersObject)}`)

    let first_file = await window.electronAPI.start(filtersObject);
    console.log("[R]> " + first_file);
    // first_file = JSON.parse(first_file);
    if (first_file == undefined){return;}
    RenderFile(first_file);
})

fileName.addEventListener('click', async () => {
    let nextFile = await window.electronAPI.openFile();
    if (nextFile == undefined){return;}
    RenderFile(nextFile);
})
document.getElementById("skipBtn").addEventListener('click', async () => {
    let nextFile = await window.electronAPI.skipFile();
    if (nextFile == undefined){return;}
    RenderFile(nextFile);
})
document.getElementById("moveBtn").addEventListener('click', async () => {
    let nextFile = await window.electronAPI.moveCurrentFile();
    if (nextFile == undefined){return;}
    RenderFile(nextFile);
})
document.getElementById("deleteBtn").addEventListener('click', async () => {
    let nextFile = await window.electronAPI.deleteCurrentFile();
    if (nextFile == undefined){return;}
    RenderFile(nextFile);
})