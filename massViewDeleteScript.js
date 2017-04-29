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


function listContent() {
    const StorageArea = chrome.storage.sync;
    StorageArea.get("contentArray", (obj) => {
        const contentArray = obj["contentArray"];
        for (let i = 0; i < contentArray.length; i++) {
            const insp = contentArray[i];
            let html = "<input type='checkbox' name='box' id='delete" + i + "' value=" + i + " />";
            html += "<label for= 'delete" + i + "'></label>";
            if (insp.type === "image") {
                html += "<img src=" + insp.content + " />";
            } else {
               html += "<span class='textInsp'>" + insp.content + "</span>";
            }
            html = "<div class='inspiration'>" + html + "</div>"
            $("#inspirationContent").append(html);
        }
    });
}

function deletedSelectedContent(event) {
    // stop form from submitting normally
    event.preventDefault();

    let checkedIndexes = [];
    $("input:checkbox[name=box]:checked").each(function(){
        checkedIndexes.push($(this).val());
    });

    deleteInsp(checkedIndexes);
}

// WARNING: this doesn't check if it's the right content. If the user deletes
// stuff from two different pages, it'll get messed up. I don't think that's
// super likely, so I guess I'm okay with it now.
function deleteInsp(indexList) {
    const StorageArea = chrome.storage.sync;
    StorageArea.get("contentArray", (obj) => {
        const contentArray = obj["contentArray"];

        indexList.sort();
        indexList.reverse();
        indexList.forEach(index => {
            contentArray.splice(index, 1);
        });
        StorageArea.set({"contentArray": contentArray});
        location.reload();
    });
}
