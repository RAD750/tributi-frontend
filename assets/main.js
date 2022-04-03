function timeConverter(UNIX_timestamp) {
    var s = new Date(UNIX_timestamp * 1000).toLocaleDateString("it-IT");
    var t = new Date(UNIX_timestamp * 1000).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' });
    return s + ' ' + t;
}

function toggleNavbar() {
    var x = document.getElementById("navbar");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}


function dateConverter(UNIX_timestamp) {
    return new Date(UNIX_timestamp * 1000).toLocaleDateString("it-IT");
}

function chiudiMdl(nomeMdl) {
    if (nomeMdl != null) {
        location.hash = "/";
        document.getElementById(nomeMdl).style.display = 'none'
    }
    return 0;
}

function apriMdl(nomeMdl) {
    document.getElementById(nomeMdl).style.display = 'block'
    return 0;
}



function mostraTab(nomeTab) {
    let currentTab = document.getElementById('currentTab').innerHTML;
    if (currentTab != nomeTab) {
        if (nomeTab == 'tabHome') {
            location.hash = '/';
        } else {
            location.hash = '/' + nomeTab.substring(3, nomeTab.length);
        }
        document.getElementById(currentTab).style.display = 'none'
        document.getElementById(nomeTab).style.display = 'block';
        document.getElementById('btn' + nomeTab.substring(3, nomeTab.length)).classList.add('w3-border-blue');
        document.getElementById('btn' + nomeTab.substring(3, nomeTab.length)).classList.add('w3-bottombar');
        document.getElementById('btn' + currentTab.substring(3, currentTab.length)).classList.remove('w3-border-blue');
        document.getElementById('btn' + currentTab.substring(3, currentTab.length)).classList.remove('w3-bottombar');
        document.getElementById('currentTab').innerHTML = nomeTab;
    }
    return 0;
}

function toggleFunction() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += "w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}

function updateDGFE(start, end) {
    let dgfe = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    dgfe.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=dgfe&utente=' + user + '&start=' + start + '&end=' + end);
    dgfe.onreadystatechange = function() {
            let risultato = "<tr class=\"w3-indigo\"><th class=\"w3-hide-small\">ID transazione</th><th>Orario</th><th class=\"w3-hide-small\">Conto</th><th>Tipologia</th><th>Totale</th></tr>";
            if (dgfe.readyState !== 4) return;
            if (dgfe.status === 200) {
                reply = JSON.parse(dgfe.responseText);
                for (let key in reply.response.taxable) {
                    risultato = risultato + "<tr><td class=\"w3-hide-small\">DGFE9000" + reply.response.taxable[key].id + "</td><td>" + timeConverter(reply.response.taxable[key].timestamp) + "</td><td class=\"w3-hide-small\">" + reply.response.taxable[key].user + "</td><td>" + reply.response.taxable[key].type + "</td><td>" + reply.response.taxable[key].amount + " IC</td></tr>";
                }
                document.getElementById("tableDGFE").innerHTML = risultato;
                document.getElementById("lblTotaleImponibile").innerHTML = reply.response.total + " IC";
                document.getElementById("lblTotaleImposte").innerHTML = reply.response.tax + " IC";
                document.getElementById("lblPercentualeTasse").innerHTML = reply.response.taxRate + " %";
            } else {
                document.getElementById("tableDGFE").innerHTML = risultato + "<tr><td></td><td>Non sono presenti dati per l'intervallo specificato</td></tr>";
                document.getElementById("lblTotaleImponibile").innerHTML = "Non disponibile";
                document.getElementById("lblTotaleImposte").innerHTML = "Non disponibile";
                document.getElementById("lblPercentualeTasse").innerHTML = "Non disponibile";
            }
        }
        // start request
    dgfe.send();
}

function updateInvoices() {
    let invoice = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    invoice.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=getTaxInvoices&utente=' + user);
    invoice.onreadystatechange = function() {
            let risultato = "<tr class=\"w3-indigo\"><th class=\"w3-hide-small\">ID</th><th class=\"w3-hide-small\">Data e ora</th><th>Periodo</th><th>Totale imponibile</th><th>Totale imposte</th><th>Stato</th></tr>";
            if (invoice.readyState !== 4) return;
            if (invoice.status === 200) {
                reply = JSON.parse(invoice.responseText);
                for (let key in reply.response.invoices) {
                    let hasPaid = "";
                    if (reply.response.invoices[key].haPagato == 0) {
                        document.getElementById("lblMessages").innerHTML = "<i class=\"fa fa-warning\"></i> &Egrave; presente un avviso di pagamento da saldare. <a href='#/AvvisiPagamento' onclick=\"mostraTab('tabAvvisiPagamento');\">Paga subito con nPay</a>";
                        hasPaid = "<button class=\"w3-button w3-indigo\" onclick=\"payInvoice('" + reply.response.invoices[key].id + "');\">Paga</button>";
                    } else {
                        document.getElementById("lblMessages").innerHTML = "Nessun messaggio da mostrare";
                        hasPaid = "<i class=\"fa-solid fa-check\"></i>";
                    }
                    risultato = risultato + "<tr><td class=\"w3-hide-small\">ADP2071" + reply.response.invoices[key].id + "</td><td class=\"w3-hide-small\">" + timeConverter(reply.response.invoices[key].timestamp) + "</td><td>" + dateConverter(reply.response.invoices[key].inizioPeriodo) + " - " + dateConverter(reply.response.invoices[key].finePeriodo) + "</td><td>" + reply.response.invoices[key].totaleImponibile + " IC</td><td>" + reply.response.invoices[key].totaleImposte + " IC</td><td>" + hasPaid + "</td></tr>";
                }

                document.getElementById("tableInvoices").innerHTML = risultato;

            } else {}
        }
        // start request
    invoice.send();
}

function payInvoice(invoiceID) {
    document.getElementById('btnPayInvoice').setAttribute("onclick", "javascript: authorizeInvoicePayment(" + invoiceID + ");");
    apriMdl('mdlPayInvoice');
    document.getElementById('lblMdlPayInvoiceInvoiceNumber').innerHTML = invoiceID;
}

function authorizeInvoicePayment(invoiceID) {
    let request = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    let auth = sessionStorage.getItem("npay_pass");
    chiudiMdl('mdlPayInvoice');
    request.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=payInvoice&utente=' + user + '&auth=' + auth + '&invoiceID=' + invoiceID);
    request.onreadystatechange = function() {
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelInvoicePaymentStatus");
                panel.classList.remove("w3-red");
                panel.classList.add("w3-green");
                panel.style.display = "block";
                document.getElementById("lblPanelInvoicePaymentStatus").innerHTML = "<b>Avviso di pagamento saldato con successo!</b>";
                updateDGFE();
                updateInvoices();
            } else {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelInvoicePaymentStatus");
                panel.classList.remove("w3-green");
                panel.classList.add("w3-red");
                panel.style.display = "block";
                document.getElementById("lblPanelInvoicePaymentStatus").innerHTML = "<b>Errore durante il pagamento:<br /></b> " + reply.detail;
                updateDGFE();
                updateInvoices();
            }
        }
        // start request
    request.send();
}

function updateLinkedAccounts() {
    let request = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    request.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=getLinkedAccounts&utente=' + user);
    request.onreadystatechange = function() {
            let risultato = "<tr class=\"w3-indigo\"><th>ID conto</th><th>Denominazione</th><th></th></tr><tr><td>Principale</td><td>" + user + "</td><td></td></tr>";
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                reply = JSON.parse(request.responseText);
                let linkedAccountsNumber = 1;
                for (let key in reply.response.linkedAccounts) {
                    risultato = risultato + "<tr><td>C9000" + reply.response.linkedAccounts[key].id + "</td><td>" + reply.response.linkedAccounts[key].conto + "</td><td><button class=\"w3-button w3-red w3-right w3-margin-right\" onclick=\"unlinkAccount(" + reply.response.linkedAccounts[key].id + ");\"><i class=\"fa-solid fa-trash-can\"></i></button></td></tr>";
                    linkedAccountsNumber++;
                }
                document.getElementById("tableLinkedAccounts").innerHTML = risultato;
                document.getElementById("lblContiAssociati").innerHTML = linkedAccountsNumber;
            } else {
                document.getElementById("tableLinkedAccounts").innerHTML = risultato + "<tr><td>Non sono presenti conti associati a questa utenza fiscale.</td></tr>";
            }
        }
        // start request
    request.send();
}

function unlinkAccount(id) {
    let request = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    request.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=unlinkAccount&utente=' + user + '&id=' + id + '&auth=' + sessionStorage.getItem("npay_pass"));
    request.onreadystatechange = function() {
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelLinkedAccountStatus");
                panel.classList.remove("w3-red");
                panel.classList.add("w3-green");
                panel.style.display = "block";
                document.getElementById("lblPanelLinkedAccountStatus").innerHTML = "<b>Conto scollegato</b>";
                updateLinkedAccounts();
                updateDGFE();
            } else {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelLinkedAccountStatus");
                panel.classList.remove("w3-green");
                panel.classList.add("w3-red");
                panel.style.display = "block";
                document.getElementById("lblPanelLinkedAccountStatus").innerHTML = "<b>Errore durante lo scollegamento:<br /></b> " + reply.detail;
            }
        }
        // start request
    request.send();
}

function linkAccount(accountName, accountPassword) {
    let request = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    let password = sessionStorage.getItem("npay_pass");
    request.open('GET', 'https://sunfire.a-centauri.com/tributiapi/?richiesta=linkAccount&utente=' + user + '&accountName=' + accountName + '&accountAuth=' + accountPassword + '&auth=' + password);
    request.onreadystatechange = function() {
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelLinkedAccountStatus");
                panel.classList.remove("w3-red");
                panel.classList.add("w3-green");
                panel.style.display = "block";
                document.getElementById("lblPanelLinkedAccountStatus").innerHTML = "<b>Conto collegato</b>";
                updateLinkedAccounts();
                updateDGFE();
            } else {
                reply = JSON.parse(request.responseText);
                let panel = document.getElementById("panelLinkedAccountStatus");
                panel.classList.remove("w3-green");
                panel.classList.add("w3-red");
                panel.style.display = "block";
                document.getElementById("lblPanelLinkedAccountStatus").innerHTML = "<b>Errore durante il collegamento:<br /></b> " + reply.detail;
            }
        }
        // start request
    request.send();
}

function popolaAreaClienti() {
    let npay = new XMLHttpRequest();
    let user = sessionStorage.getItem("npay_user");
    let pass = sessionStorage.getItem("npay_pass");

    if (user === null || pass === null) {
        alert("Sessione scaduta");
        window.location.href = "/";
    }

    npay.open('GET', 'https://sunfire.a-centauri.com/npayapi/?richiesta=estratto&utente=' + user + '&auth=' + pass);
    npay.onreadystatechange = function() {
        if (npay.readyState !== 4) return;
        if (npay.status === 200) {
            reply = JSON.parse(npay.responseText);
            document.getElementById("lblUser").innerHTML = user;
            document.getElementById("lblSaldo").innerHTML = reply.credit + ' IC';
        } else {
            alert("Errore interno webapp");
            window.location.href = "/";
        }
    }

    // start request
    npay.send();
    updateDGFE();
    updateInvoices();
    updateLinkedAccounts();
}


function applyFilter() {
    start = document.getElementById('frmFilterStartDate').value;
    end = document.getElementById('frmFilterEndDate').value;
    start = Math.floor(new Date(start).getTime() / 1000);
    end = Math.floor(new Date(end).getTime() / 1000 + 86400);
    if (!isNaN(start + end)) {
        chiudiMdl('mdlFiltro');
        document.getElementById('btnFilterRemove').disabled = false;
        document.getElementById('lblFilterInterval').innerHTML = dateConverter(start) + '&nbsp;-&nbsp;' + dateConverter(end);
        updateDGFE(start, end);
    } else {
        document.getElementById('btnFilterRemove').disabled = true;
        document.getElementById('lblMdlFilterError').innerHTML = "Data non inserita correttamente";
    }
}

function removeFilter() {
    document.getElementById('btnFilterRemove').disabled = true;
    document.getElementById('lblFilterInterval').innerHTML = "mese&nbsp;corrente";
    updateDGFE();
}

function applyLinkAccount() {
    accountName = document.getElementById('frmLinkAccountName').value;
    accountAuth = document.getElementById('frmLinkAccountAuth').value;
    if (typeof accountName === 'string' && accountName.length > 2) {
        if (typeof accountAuth === 'string' && accountAuth.length > 2) {
            document.getElementById('lblMdlLinkAccountError').innerHTML = "";
            chiudiMdl('mdlLinkAccount');
            linkAccount(accountName, accountAuth);
        } else {
            document.getElementById('lblMdlLinkAccountError').innerHTML = "Password non corretta";
        }
    } else {
        document.getElementById('lblMdlLinkAccountError').innerHTML = "Utente non corretto";
    }
}

function mostraInvioDenaro() {
    apriMdl("scrLoadingCog");
    chiudiMdl("scrMain");
    chiudiMdl("sezDashboard");
    apriMdl("sezInvioDenaro");
    chiudiMdl("scrLoadingCog");
    apriMdl("scrMain");
    location.hash = "/invia-denaro";
}

function mostraDashboard() {
    apriMdl("scrLoadingCog");
    chiudiMdl("scrMain");
    chiudiMdl("sezInvioDenaro");
    chiudiMdl("sezRisultatoInvio");
    apriMdl("sezDashboard");
    chiudiMdl("scrLoadingCog");
    apriMdl("scrMain");
    location.hash = "/";
}

function destroySession() {
    sessionStorage.clear();
    window.location.href = "https://tributi.rgbcraft.com/";
}