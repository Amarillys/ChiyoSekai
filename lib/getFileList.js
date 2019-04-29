/* eslint-env node */
/* 180817 add file support and single run support
 * the script out of exports also will run.
*/
const fs = require('fs');
const path = require('path');

const getFileList = function(fpath, filter) {
    let filelist = [];
    let toQuery = [fpath];
    if (!fs.statSync(fpath).isDirectory())
	    return toQuery;
    while (toQuery.length > 0) {
        let files = fs.readdirSync(toQuery[0]).map(file => path.join(toQuery[0], file));
        files.forEach( file => {
            if (fs.statSync(file).isDirectory())
                toQuery.push(file);
            else
                filter ? (filter.includes(file.slice(-3)) ? filelist.push(file) : null) : filelist.push(file);
        });
        toQuery.splice(0, 1);
    }
    return filelist;
};

module.exports = getFileList;
if (path.parse(process.argv[1]).base === 'getFileList.js' && process.argv[2])
    console.log(getFileList(process.argv[2]));
