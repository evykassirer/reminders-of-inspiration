"use strict"
// Logic to add new inspiration that the user submits

document.addEventListener('DOMContentLoaded', function () {
    const StorageArea = chrome.storage.sync;
    StorageArea.get("maxKey", (obj) => {
        const maxKeyInt = parseInt(obj["maxKey"]);
        listContent(maxKeyInt);
    });
    // For overriding submitting the form
    $("#deleteContent").submit(deletedSelectedContent);
});


function listContent(maxKey) {
    const StorageArea = chrome.storage.sync;
    for (let i = 1; i <= maxKey; i++) {
        const key = i.toString();
        StorageArea.get(key, (obj) => {
            const insp = obj[key];
            let html = "<input type='checkbox' name='box' id='delete" + i + "' value=" + i + " />";
            html += "<label for= 'delete" + i + "'></label>";
            if (insp.type === "image") {
                html += "<img src=" + insp.content + " />";
            } else {
               html += "<span class='textInsp'>" + insp.content + "</span>";
            }
            html = "<div class='inspiration'>" + html + "</div>"
            $("#inspirationContent").append(html);
        });
    }
}

function deletedSelectedContent(event) {
    // stop form from submitting normally
    event.preventDefault();

    let checkedIndexes = [];
    $("input:checkbox[name=box]:checked").each(function(){
        checkedIndexes.push($(this).val());
    });
    checkedIndexes.sort();

    deleteInsp(checkedIndexes);
}

// WARNING: this doesn't check if it's the right content. If the user deletes
// stuff from two different pages, it'll get messed up. I don't think that's
// super likely, so I guess I'm okay with it now.
function deleteInsp(keyList) {
    const StorageArea = chrome.storage.sync;
    const keyStr = keyList.pop();
    if (!keyStr) {
        location.reload();
        return;
    }

    // the max key with something stored there
    StorageArea.get("maxKey", (obj) => {
        // keys must be stored as strings
        const maxKeyStr = obj["maxKey"];
        const maxKeyInt = parseInt(maxKeyStr);
        if (maxKeyInt === 0) {
            location.reload();
            return;
        }
        // When there's only one thing stored, there's nothing else to put in
        // that slot, so skip this part and just delete it.
        if (maxKeyInt > 1) {
            // Get the inspriation stored with the max key and move to
            // current position, overriding (and therefore deleting) the
            // current inspiration.
            StorageArea.get(maxKeyStr, (maxInspObj) => {
                let replacement = {};
                replacement[keyStr] = maxInspObj[maxKeyStr];
                StorageArea.set(replacement);
            });
        }

        StorageArea.remove(maxKeyStr);

        // decrement the key so we can't pick it anymore.
        const newMaxKeyInt = parseInt(maxKeyStr) - 1;
        StorageArea.set(
            {"maxKey": newMaxKeyInt.toString()},
            // OKAY this is ridiculous that I have to do this chain of callbacks.
            // I should be storing the inspirations in an array and set up
            // something to change everyone else's storage. TODO
            () => {
                // recurse on the list to delete the next one
                if (keyList.length !== 0) {
                    deleteInsp(keyList);
                }
                // if we're all done, refresh
                else {
                    location.reload();
                }
            });
   });
}
