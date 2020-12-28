console.log("Loading Browser JS app.js");

let p = 1;

function dynamicInfo(page = 1){
    p = page;
    const appEl = document.getElementById('app');
    appEl.innerHTML = 'Loading...';
    foo();
}

function foo() {
    Promise.all([

        fetch("/templates/users.mst").then(x => x.text()),
        fetch(`/api/v1/users?page=${p}`).then(x => x.json()),
    ])
        .then(([templateStr, itemsData]) => {
            return Mustache.render(templateStr, itemsData);
        })
        .then(htmlStr => {
            const appEl = document.getElementById('app');
            appEl.innerHTML = htmlStr;
        })
        .catch(err => console.error(err));
}

foo();