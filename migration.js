"use strict"

document.addEventListener('DOMContentLoaded', function () {
    const StorageArea = chrome.storage.sync;

    StorageArea.get("contentArray", (obj) => {
        if(!obj["contentArray"]) {
            console.log("no content array exists yet, migrating");

            StorageArea.get("maxKey", (obj) => {
                if (!obj["maxKey"]) {
                    console.log("no maxKey set, initializing array to []");
                    StorageArea.set({"contentArray": []});
                    return;
                }
                const maxKeyInt = parseInt(obj["maxKey"]);
                if (maxKeyInt === 0) {
                    console.log("maxKeyInt is 0, initializing array to []");
                    StorageArea.set({"contentArray": []});
                    return;
                }

                migrateContent(1, maxKeyInt, []);
            });
        }
    });
});


function migrateContent(i, maxKey, contentArray) {
    const StorageArea = chrome.storage.sync;

    const key = i.toString();
    StorageArea.get(key, (obj) => {
        const insp = obj[key];
        contentArray.push(insp);
        if (i < maxKey) {
            return migrateContent(i+1, maxKey, contentArray);
        }
        else {
            StorageArea.set({"contentArray": contentArray});
        }
    });
}
