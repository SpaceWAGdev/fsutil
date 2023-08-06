const {dialog, app, BrowserWindow} = require("electron")
const fs = require("fs");
const {glob,globSync,globStream,globStreamSync,Glob} = require('glob')
const {fromExtension} = require("human-filetypes");
const path = require("path");
const {MediaExtensions, DocumentExtensions, ImageExtensions, CompressedExtensions} = require(path.join(__dirname, "extensions"));
const mime = require("mime");
const shell = require("electron").shell;
// const {FSUFile} = require("./filespec");


exports.HandleFolderDialog = HandleFolderDialog;
exports.Start = Start;
exports.Skip = Skip;
exports.Delete = Delete;
exports.OpenFile = OpenFile;
exports.Move = Move;

var current_folder = undefined;
var all_files = undefined;
var current_file = undefined;

async function HandleFolderDialog () {
  // console.log("[-]> HandleFolderDialog called",)
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),{properties: ['openDirectory'], defaultPath: app.getPath("documents") });

  if (!canceled) {
    current_folder = filePaths[0];
    return filePaths[0];
  }
}

async function HandleFileSaveDialog(fileName) {
  const { canceled, filePath } = await dialog.showSaveDialog({defaultPath: fileName});
  console.log(BrowserWindow.getAllWindows());
  if (!canceled) {
    return filePath;
  }
}

function GetHumanReadableFileType(extension) {
  let _type = fromExtension(extension); 
  _type = _type.replace("image", "Bild");
  _type = _type.replace("video", "Video");
  _type = _type.replace("audio", "Audio");
  _type = _type.replace("archive", "Komprimierte Datei");
  _type = _type.replace("document", "Dokument");
  _type = _type.replace("spreadsheet", "Tabelle");
  _type = _type.replace("presentation", "Präsentation");
  _type = _type.replace("font", "Schriftart");
  _type = _type.replace("text", "Textdatei");
  _type = _type.replace("application", "Ausführbares Programm");
  _type = _type.replace("unknown", "Unbekannt");
  console.log(_type);
  return _type;
}

async function GetFileInfo(_path) {
  console.log(_path);
  let file_obj = fs.statSync(_path)
  
  let name = path.basename(_path);
  let creation_date = file_obj.birthtime;
  let last_modified_date = file_obj.mtime;
  let size = file_obj.size;
  if(size > 10000000){
    size = -1;
  }
  let human_readable_type = GetHumanReadableFileType(path.extname(_path));
  let content = fs.readFileSync(_path);
  let _mime = mime.getType(path.extname(_path));

  console.log("[N] " + await GetHumanReadableFileType(path.extname(_path)));

  return {
    name: name,
    path: _path,
    last_modified_date: last_modified_date.toLocaleDateString(Intl.DateTimeFormat("de-DE")),
    creation_date: creation_date.toLocaleDateString(Intl.DateTimeFormat("de-DE")),
    size: size,
    human_readable_type: human_readable_type,
    mime: _mime,
    content: content
  }
  // return new FSUFile(name, _path, last_modified_date, creation_date, size, human_readable_type);
}

async function Start(filters){
  all_files = undefined;
  current_file = undefined;
  if(current_folder == undefined){ return; }
  let all_extensions_for_glob = []
  console.log(`[N] Filters: ${JSON.stringify(filters)}`)

  if (filters.none == true){
    all_extensions_for_glob.push("**/*.*")
  }
  else{
    if (filters.documents == true){
      all_extensions_for_glob.push(DocumentExtensions)
    }
    if (filters.images == true){
      all_extensions_for_glob.push(ImageExtensions)
    }
    if (filters.media == true){
      all_extensions_for_glob.push(MediaExtensions)
    }
    if (filters.compressed == true){
      all_extensions_for_glob.push(CompressedExtensions)
    }
  }

  all_extensions_for_glob = all_extensions_for_glob.flat()

  console.log("[N] "+ all_extensions_for_glob.toString())
  
  let glob_regex_list = [];

    all_extensions_for_glob.forEach(extension => {
      if(filters.none != true) {
        glob_regex_list.push(path.join(current_folder,"**", `*.${extension}`).split(path.sep).join(path.posix.sep));
      }
      else {
        glob_regex_list.push(path.join(current_folder, extension).split(path.sep).join(path.posix.sep));
      }
    });

  console.log(glob_regex_list.toString());
  
  all_files = await glob(glob_regex_list);
  all_files.forEach(file => {
    console.log("[N]> "+file);
  });

  if(all_files.length == 0){
    return;
  }

  current_file = all_files[0];
  let f_info = await GetFileInfo(current_file)
  // return JSON.stringify(f_info);
  return f_info;
}

async function Skip(){
  if (all_files == undefined) return;
  if (current_file == undefined) return;
  all_files.shift()
  current_file = all_files[0];
  return await GetFileInfo(current_file);
}

async function Delete(){
  if (all_files == undefined) return;
  if (current_file == undefined) return;

  await shell.trashItem(current_file);
  all_files.shift();
  current_file = all_files[0];
  return await GetFileInfo(current_file);
}

async function Move(){
  if (all_files == undefined) return;
  if (current_file == undefined) return;
  oldPath = current_file;

  newPath = await HandleFileSaveDialog((await GetFileInfo(current_file)).name);
  if (newPath == undefined) return;
  fs.rename(oldPath, newPath,
  (err)  => console.error("[N] Failed to move file " + oldPath + " to " + newPath)
  );
  all_files.shift();
  current_file = all_files[0];
  return GetFileInfo(current_file);
}

async function OpenFile() {
  if(current_file == undefined) {return;}
  shell.openPath(current_file);
  return;
}