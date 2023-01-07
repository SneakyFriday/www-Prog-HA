const isMimetypeOk = (type) => {

}

const isExtensionOk = ({}) => {

}

const POST_FILE_LIMIT = 1024 * 1024 * 5;

export function validateImage(file) {
    if(!file) return;
    if(file.size == 0) return;
    if(file.size > POST_FILE_LIMIT) {
        return 'Datei zu groß';
    }
    if(isMimetypeOk(file.type) && isExtensionOk(file.name)) return;

    return 'Dateiformat nicht zulässig';
}