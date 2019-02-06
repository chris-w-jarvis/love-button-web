let getLinkBtn = document.getElementById('getLinkSubmitBtn')
let host = 'http://localhost:8080/api/'

getLinkBtn.onclick = function() {
    var request = {}
    if (document.getElementById("publicKey").val != '') request['key'] = document.getElementById("publicKey").val
    else {
        alert("Need public key")
        return
    }
    if (document.getElementById("name").val != '') request['name'] = document.getElementById("name").val
    else {
        alert("Need a name or some text")
        return
    }
    $.post({url:`${host}getMyLink`,
        data:request,
        success: function(res) {
            document.getElementById('link').val = res.link
        },
        error: function() {
            alert('Request failed, try again later, sorry...');
        }
    })
}