console.log("Loading Browser JS app.js");

function register() {
    fetch("/templates/loading.mst").then(x => x.text())
        .then(htmlStr => {
            const form = new FormData(document.getElementById('reg-form'));

            const appEl = document.getElementById('app');
            appEl.innerHTML = htmlStr;

            Promise.all([
                fetch("/templates/register.mst").then(x => x.text()),
                fetch('/api/v1/users/create', {
                    method: 'POST',
                    body: form
                }).then(x => x.json())
            ])
                .then(([templateStr, itemsData]) => {
                    if (!itemsData.login) return Mustache.render(templateStr, itemsData);
                    window.location.replace(window.location.origin + "/auth/login?login=" + itemsData.login);
                })
                .then(htmlStr => {
                    const appEl = document.getElementById('app');
                    appEl.innerHTML = htmlStr;
                })
                .catch(err => console.log(err));

        })
        .catch(err => console.error(err));
};


fetch("/templates/register.mst").then(x => x.text())
    .then((templateStr) => {
        return Mustache.render(templateStr, {});

    })
    .then(htmlStr => {
        const appEl = document.getElementById('app');
        appEl.innerHTML = htmlStr;
    })
    .catch(err => console.log(err));
