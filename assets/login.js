function doLogin() {
    document.getElementById("btnAccedi").classList.remove("fa-right-to-bracket");
    document.getElementById("btnAccedi").classList.add("fa-cog");
    document.getElementById("btnAccedi").classList.add("fa-spin");
    let xhr = new XMLHttpRequest();
    let user = document.getElementById('frmLoginInputUser').value
    let pass = document.getElementById('frmLoginInputPassword').value
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem("npay_user", user);
        sessionStorage.setItem("npay_pass", pass);
    } else {
        alert("Sessione scaduta");
    }
    xhr.open('GET', 'https://sunfire.a-centauri.com/npayapi/?richiesta=verifica&utente=' + user + '&auth=' + pass);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            let dupeAcct = new XMLHttpRequest();
            dupeAcct.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=isPrimaryAccount&utente=' + user);
            dupeAcct.onreadystatechange = function() {
                if (dupeAcct.readyState !== 4) return;
                if (dupeAcct.status === 200) {
                    dupeReply = JSON.parse(dupeAcct.responseText);
                    if (dupeReply.response == false) {
                        document.getElementById("btnAccedi").classList.add("fa-right-to-bracket");
                        document.getElementById("btnAccedi").classList.remove("fa-cog");
                        document.getElementById("btnAccedi").classList.remove("fa-spin");
                        apriMdl('mdlErroreAuth');
                        document.getElementById("lblVerboseError").innerHTML = "Questo conto &egrave; collegato ad un'utenza fiscale diversa. Per favore, entra utilizzando quell'utenza fiscale.";
                    } else {
                        window.location.href = "area-personale/";
                    }
                } else {
                    alert("Errore interno webapp");
                }
            }
            dupeAcct.send();

        } else {
            document.getElementById("btnAccedi").classList.add("fa-right-to-bracket");
            document.getElementById("btnAccedi").classList.remove("fa-cog");
            document.getElementById("btnAccedi").classList.remove("fa-spin");
            apriMdl('mdlErroreAuth');
            reply = JSON.parse(xhr.responseText);
            document.getElementById("lblVerboseError").innerHTML = reply.detail;
        }

    }

    // start request
    xhr.send();

}