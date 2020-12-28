console.log("Loading Browser JS app.js");

function dynamicInfo(page = 1){
   const search = document.getElementById('search').value;

   fetch("/templates/loading.mst").then(x => x.text())
      .then((templateStr) => {
         return Mustache.render(templateStr, {});
      })
      .then(htmlStr => {
         const appEl = document.getElementById('app');
         appEl.innerHTML = htmlStr;
      })
      .catch(err => console.error(err));

   const collectionId  = document.getElementById("collID").value;

   Promise.all([

      fetch("/templates/books-add.mst").then(x => x.text()),
      fetch(`/api/v1/books?page=${page}&search=${search}`).then(x => x.json())
   ])
      .then(([templateStr, itemsData]) => {
         return Mustache.render(templateStr, { ...itemsData, search, collectionId });
      })
      .then(htmlStr => {
         const appEl = document.getElementById('app');
         appEl.innerHTML = htmlStr;
      })
      .catch(err => console.error(err));
}

dynamicInfo();