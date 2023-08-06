class FSUFile {
    constructor (name, path, last_modified_date, creation_date, size, human_readable_type, content) {
        this.name = name;
        this.path = path;
        this.last_modified_date = last_modified_date;
        this.creation_date = creation_date;
        this.size = size;
        this.human_readable_type = human_readable_type;
        this.content = content
    }
}

exports.FSUFile = FSUFile;