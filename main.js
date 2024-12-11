const API_URL = "https://jsonplaceholder.typicode.com";

document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.querySelector("#posts-container");
    let displayedPosts = []; // Хранит ID постов, которые показаны на странице
    let localPostBodies = {}; // Хранит текущие тела постов, включая обновленные

    // Функция для получения данных с сервера (GET)
    const fetchPosts = async (postCount) => {
        try {
            const randomStart = Math.floor(Math.random() * (100 - postCount));
            const response = await fetch(`${API_URL}/posts?_start=${randomStart}&_limit=${postCount}`);

            if (!response.ok) {
                throw new Error("Ошибка при получении данных");
            }

            const posts = await response.json();
            console.log(`Получены ${postCount} постов:`, posts);
            displayedPosts = posts.map(post => post.id); // Сохраняем ID постов
            posts.forEach(post => {
                localPostBodies[post.id] = post.body; // Локальные тела постов
            });
            renderPosts(posts);
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error);
        }
    };

    // Функция для добавления поста в DOM
    const addPostToDOM = (post) => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.dataset.id = post.id; // Привязываем ID поста
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
        `;
        postsContainer.appendChild(postElement);
    };

    // Функция для рендера всех постов
    const renderPosts = (posts) => {
        postsContainer.innerHTML = ""; // Очищаем контейнер
        posts.forEach(addPostToDOM);
    };

    // Функция для обновления или добавления поста
    const updateOrAddPostInDOM = (post) => {
        console.log(`Пытаемся обновить или добавить пост с ID: ${post.id}`);
        const existingPostElement = document.querySelector(`.post[data-id="${post.id}"]`);
        if (existingPostElement) {
            console.log(`Пост с ID ${post.id} найден. Обновляем...`);
            existingPostElement.querySelector("h3").textContent = post.title;
            existingPostElement.querySelector("p").textContent = post.body || "";
        } else {
            console.log(`Пост с ID ${post.id} не найден. Добавляем новый.`);
            addPostToDOM(post);
        }
        // Обновляем локальное тело поста
        localPostBodies[post.id] = post.body;
    };

    // Функция для полного обновления поста (PUT)
    const updatePost = async (index, title, body) => {
        try {
            const id = displayedPosts[index - 1]; // Преобразуем индекс в реальный ID
            if (!id) {
                alert("Некорректный номер поста!");
                return;
            }

            console.log(`Отправляем PUT запрос для поста с ID: ${id}`);
            const response = await fetch(`${API_URL}/posts/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, body }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при обновлении поста");
            }

            const updatedPost = await response.json();
            console.log("Обновленный пост (PUT):", updatedPost);
            alert(`Пост №${index} (ID ${id}) успешно обновлен!`);
            updateOrAddPostInDOM(updatedPost); // Обновляем в DOM
        } catch (error) {
            console.error("Ошибка при обновлении поста:", error);
            alert("Не удалось обновить пост.");
        }
    };

    // Функция для частичного обновления поста (PATCH)
    const patchPost = async (index, title) => {
        try {
            const id = displayedPosts[index - 1]; // Преобразуем индекс в реальный ID
            if (!id) {
                alert("Некорректный номер поста!");
                return;
            }

            // Получаем текущее тело из локального хранилища
            const currentBody = localPostBodies[id] || "";

            console.log(`Отправляем PATCH запрос для поста с ID: ${id}`);
            const response = await fetch(`${API_URL}/posts/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, body: currentBody }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при частичном обновлении поста");
            }

            const patchedPost = await response.json();
            console.log("Обновленный пост (PATCH):", patchedPost);
            alert(`Пост №${index} (ID ${id}) успешно обновлен!`);
            updateOrAddPostInDOM(patchedPost); // Обновляем в DOM
        } catch (error) {
            console.error("Ошибка при частичном обновлении поста:", error);
            alert("Не удалось обновить пост.");
        }
    };


    // Функция для создания нового поста (POST)
    const createPost = async (title, body) => {
        try {
            console.log("Отправляем POST запрос для создания нового поста...");
            const response = await fetch(`${API_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, body }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при создании нового поста");
            }

            const newPost = await response.json();
            console.log("Новый пост успешно создан:", newPost);

            // Генерируем видимый номер поста
            const visibleId = displayedPosts.length + 1;

            // Добавляем новый пост в DOM и локальное хранилище
            newPost.id = visibleId; // Назначаем порядковый номер
            displayedPosts.push(newPost.id);
            localPostBodies[newPost.id] = body; // Сохраняем тело нового поста
            addPostToDOM(newPost);

            alert(`Новый пост №${visibleId} успешно создан!`);
        } catch (error) {
            console.error("Ошибка при создании нового поста:", error);
            alert("Не удалось создать новый пост.");
        }
    };


    // Обработчики событий

    // Получение новых постов
    document.querySelector("#get-new-posts-btn").addEventListener("click", () => {
        const postCountInput = document.querySelector("#post-count");
        const postCount = parseInt(postCountInput.value, 10);

        if (isNaN(postCount) || postCount <= 0 || postCount > 100) {
            alert("Введите количество постов от 1 до 100!");
        } else {
            fetchPosts(postCount);
        }
    });

    // Создание нового поста
    document.querySelector("#create-post-btn").addEventListener("click", () => {
        const titleInput = document.querySelector("#post-title");
        const bodyInput = document.querySelector("#post-body");
        const title = titleInput.value;
        const body = bodyInput.value;

        if (title && body) {
            createPost(title, body);
            titleInput.value = "";
            bodyInput.value = "";
        } else {
            alert("Пожалуйста, заполните все поля!");
        }
    });

    // Обновление поста (PUT)
    document.querySelector("#update-post-btn").addEventListener("click", () => {
        const postIndex = parseInt(document.querySelector("#update-post-id").value, 10);
        const title = document.querySelector("#update-post-title").value;
        const body = document.querySelector("#update-post-body").value;

        if (postIndex && title && body) {
            updatePost(postIndex, title, body);
        } else {
            alert("Пожалуйста, заполните все поля!");
        }
    });

    // Частичное обновление поста (PATCH)
    document.querySelector("#patch-post-btn").addEventListener("click", () => {
        const postIndex = parseInt(document.querySelector("#update-post-id").value, 10);
        const title = document.querySelector("#update-post-title").value;

        if (postIndex && title) {
            patchPost(postIndex, title);
        } else {
            alert("Пожалуйста, заполните номер поста и новый заголовок!");
        }
    });

    // Загрузка данных при старте
    fetchPosts(5);
});
