// Logic to add new inspiration that the user submits

document.addEventListener('DOMContentLoaded', function () {
    StorageArea = chrome.storage.sync;

    // If there is content stored yet, initialize to []
    StorageArea.getBytesInUse(null, (bytes) => {
        if (bytes === 0) {
            StorageArea.set({"contentArray": []});
        }
    });

    // For overriding submitting the form
    $("#addContent").submit(checkContent);
});

function checkContent(event) {
    // stop form from submitting normally
    event.preventDefault();

    // get values from form
    var $form = $(this),
    content = $form.find('textarea[name="content"]').val(),
    contentType = $form.find('input[name="content-type"]:checked').val();


    if (isImage(content) && contentType === 'text') {
        let r = confirm("You selected text, but that looks like an image url.\n" +
            "Click OK if you want it to be text input.");
        if (!r) {
            return;
        }
    } else if (!isImage(content) && contentType === 'image') {
        let r = confirm("You selected image, but that doesn't look like an image url.\n" +
            "Click OK if you want it to be an image url.");
        if (!r) {
            return;
        }
    }
    addContent(content, contentType, $form);
}


function addContent(content, contentType, $form) {
    StorageArea = chrome.storage.sync;

    // store the new content with a new, higher, key
    StorageArea.get("contentArray", (obj) => {
        var contentArray = obj["contentArray"];
        contentArray.push({
            content: content,
            type: contentType,
        });
        StorageArea.set({"contentArray": contentArray});
    });


    // add confirmation text above the form
    if (contentType === "image") {
        $("#confirmation").html("Added new image <img src="+content+" />");
    } else {
        $("#confirmation").html("<span> Added new text \""+content+"\"</span>");
    }

    // clear the form
    $form.find('textarea[name="content"]').val('');
};

function isImage(text) {
    let re = /^\S+\.(jpg|jpeg|png|gif|bmp)\S*$/i;
    return !!text.match(re);
}
