
function inciarApp() {

    const selectCategorias = document.querySelector('#categorias');
    selectCategorias.addEventListener('change', seleccionarCategoria);

    const resultado = document.querySelector('#resultado');

    const modal = new bootstrap.Modal('#modal', {});
    
    obtenerCategorias();

    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    };


    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            
            selectCategorias.appendChild(option);
        })
    };

    function seleccionarCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    

    function mostrarRecetas(recetas = []) {

        limpiaHTML(resultado);

        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados';
        resultado.appendChild(heading);


        recetas.forEach( receta => {

            const {idMeal, strMeal, strMealThumb} = receta;

            const recetaContenedor = document.createElement('div');
            recetaContenedor.classList.add('col-md-4');

            const recetCard = document.createElement('div');
            recetCard.classList.add('card', 'mb-4');
        

            const recetaImagen = document.createElement('img');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `imagen de la receta${strMeal}`;
            recetaImagen.src = strMealThumb;

            const recetaCardBody = document.createElement('div')
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('h3');
            recetaHeading.classList.add('card-tittle', 'mb-3');
            recetaHeading.textContent = strMeal;

            const recetaButton = document.createElement('button');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'ver receta'
            // recetaButton.dataset.bsTarget = '#modal';
            // recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick = function() {
                seleccionarReceta(idMeal)
            }
            


            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetCard.appendChild(recetaImagen);
            recetCard.appendChild(recetaCardBody);
            
            recetaContenedor.appendChild(recetCard);

            resultado.appendChild(recetaContenedor);
        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {

        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;

        const modalTittle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTittle.textContent = strMeal;

        modalBody.innerHTML = `
            <img class='img-fluid' src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `;

        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-gorup');

        for(let i = 1; i<=20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredientLi = document.createElement('li');
                ingredientLi.classList.add('list-gorup-item');
                ingredientLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFotter = document.querySelector('.modal-footer');
        limpiaHTML(modalFotter);

        const btnFavorito = document.createElement('button');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Guardar favorito';


        btnFavorito.onclick = function () {

            if(existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar favorito'
                return;
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = 'Eliminar favorito'
        }
        
        const btnCerrarModal = document.createElement('button');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function () {
            modal.hide();
        }

        modalFotter.appendChild(btnFavorito);
        modalFotter.appendChild(btnCerrarModal);

        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }


    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id != id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage (id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }   

    function limpiaHTML (selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded', inciarApp);