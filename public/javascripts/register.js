console.log("Loading Browser JS app.js");

function register() {
   const form = new FormData(document.getElementById('reg-form'));
   Promise.all([

      fetch("/templates/register.mst").then(x => x.text()),
      fetch('/api/v1/users/create', {
         method: 'POST',
         body: form
      }).then(x => x.json())
   ])
      .then(([templateStr, itemsData]) => {
         if (!itemsData.login) return Mustache.render(templateStr, itemsData);

         console.log(window.location.origin + "/auth/login?login=" + itemsData.login);
         window.location.replace(window.location.origin + "/auth/login?login=" + itemsData.login);
         Loading();

      })
      .then(htmlStr => {
         const appEl = document.getElementById('app');
         appEl.innerHTML = htmlStr;
      })
      .catch(err => console.log(err));
};

function Loading() {
   fetch("/templates/loading.mst").then(x => x.text())
      .then(htmlStr => {
         const appEl = document.getElementById('app');
         appEl.innerHTML = htmlStr;
      })
      .catch(err => console.error(err));
}

Loading();
fetch("/templates/register.mst").then(x => x.text())
    .then((templateStr) => {
        return Mustache.render(templateStr, {});

    })
    .then(htmlStr => {
        const appEl = document.getElementById('app');
        appEl.innerHTML = htmlStr;
    })
    .catch(err => console.log(err));
