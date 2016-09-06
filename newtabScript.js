// Logic to show a random selection from the user's inputted inspiration
// and to delete it when the user wishes.

document.addEventListener('DOMContentLoaded', function () {
    StorageArea = chrome.storage.sync;

    // First check if we have stored the max key (the number of objects submitted)
    StorageArea.getBytesInUse(null, (bytes) => {
        if (bytes === 0) {
            console.log("There's no max key being stored");
            $("#remove-insp").hide();
        } else {
            // Then see if we've added anything so far
            StorageArea.get("maxKey", (obj) => {
                maxKeyInt = parseInt(obj["maxKey"]);
                if (maxKeyInt === 0) {
                    console.log("Need to add some stuff first " +
                                "(the key is still 0)");
                    $("#remove-insp").hide();
                }
                else {
                    // pick a random number to select that inspiration
                    var currentKeyStr = getRandomIntInclusive(
                        1, maxKeyInt).toString();
                    StorageArea.set({"currentKey": currentKeyStr});
                    StorageArea.get(currentKeyStr, (obj) => {
                        displayInspiration(obj[currentKeyStr]);
                        var currentObj = obj[currentKeyStr];
                        $("#remove-insp").click(() => deleteInsp(currentObj));
                    });
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
        var currentKeyStr = currentKeyObj["currentKey"];
        StorageArea.get(currentKeyStr, (obj) => {
            // double check that the key hasn't been reassigned to other
            // content (possible if there was a delete after the page loaded)
            if (obj[currentKeyStr] && (obj[currentKeyStr].content === insp.content)) {
                removeKey(currentKeyStr);
            } else {
                // if it was already deleted, just reload
                location.reload();
            }
        });
    });
}

// I think my two options are to keep it all in one array, which will take
// longer to fetch an item, or to store them with keys from 1 to n, which I
// decided to do instead. Because I took this route, when I remove one I need
// to shift something else to its place. I don't have to keep them in the same
// order, so I can just bring the last item to the slot I'm deleting from.
function removeKey(currentKeyStr) {
    StorageArea = chrome.storage.sync;

    // the max key with something stored there
    StorageArea.get("maxKey", (obj) => {
        // keys must be stored as strings
        var maxKeyStr = obj["maxKey"];
        var maxKeyInt = parseInt(maxKeyStr);
        // When there's only one thing stored, there's nothing else to put in
        // that slot, so skip this part and just delete it.
        if (maxKeyInt > 1) {
            // Get the inspriation stored with the max key and move to
            // current position, overriding (and therefore deleting) the
            // current inspiration.
            StorageArea.get(maxKeyStr, (maxInspObj) => {
                var replacement = {};
                replacement[currentKeyStr] = maxInspObj[maxKeyStr];
                StorageArea.set(replacement);
            });
        }

        StorageArea.remove(maxKeyStr);
        
        // decrement the key so we can't pick it anymore.
        var newMaxKeyInt = parseInt(maxKeyStr) - 1;
        StorageArea.set({"maxKey": newMaxKeyInt.toString()});
        location.reload();
    });
}
