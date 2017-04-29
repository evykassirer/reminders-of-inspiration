// Logic to show a random selection from the user's inputted inspiration
// and to delete it when the user wishes.

document.addEventListener('DOMContentLoaded', function () {
    StorageArea = chrome.storage.sync;

    // First check if we have stored any content yet
    StorageArea.getBytesInUse(null, (bytes) => {
        if (bytes === 0) {
            console.log("There's no content");
            $("#remove-insp").hide();
        } else {
            // Then see if we've added anything so far
            StorageArea.get("contentArray", (obj) => {
                const contentArray = obj["contentArray"]
                if (!contentArray || contentArray.length === 0) {
                    console.log("There's no content");
                    $("#remove-insp").hide();
                }
                else {
                    // pick a random number to select that inspiration
                    var randomIndex = getRandomIntInclusive(
                        0, contentArray.length-1);
                    // this is stored to be used in a safe check when deleting
                    StorageArea.set({"currentKey": randomIndex});
                    var currentObj = contentArray[randomIndex];
                    displayInspiration(currentObj);
                    $("#remove-insp").click(() => deleteInsp(currentObj));
                }
            });
        }
    });

});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function displayInspiration(insp) {
    if (insp.type === "image") {
        $("#inspiration-content").html("<img src="+insp.content+" />");
    } else {
        $("#inspiration-content").html("<span>"+insp.content+"</span>");
    }
};

function deleteInsp(insp) {
    // the key of the object we want to delete
    StorageArea.get("currentKey", (currentKeyObj) => {
        const currentKey = currentKeyObj["currentKey"];
        StorageArea.get("contentArray", (contentArrayObj) => {
            const contentArray = contentArrayObj["contentArray"];
            // double check that the key hasn't been reassigned to other
            // content (possible if there was a delete after the page loaded)
            if (contentArray[currentKey] &&
                contentArray[currentKey].content === insp.content) {
                removeKey(currentKey);
            } else {
                // if it was already deleted, just reload
                location.reload();
            }
        });
    });
}

function removeKey(currentKey) {
    StorageArea = chrome.storage.sync;

    // the max key with something stored there
    StorageArea.get("contentArray", (obj) => {
        var contentArray = obj["contentArray"];
        contentArray.splice(currentKey, 1);
        StorageArea.set({"contentArray": contentArray});
        location.reload();
    });
}
