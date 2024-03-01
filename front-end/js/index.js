console.log("index.js is executing...");

const id_form_create_new_post = document.getElementById("id_form_create_new_post");
const div_post_created = document.getElementById("post_created");
id_form_create_new_post.addEventListener("submit", handleCreateNewPostEvent);
document.addEventListener("DOMContentLoaded", updatePostFeed());


// =====================================================================================================================
// Functions that interact with the API
// =====================================================================================================================

async function createNewUserPost(userPostData)
{
    const API_URL = "http://localhost:8080/posts";

    try
    {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(userPostData)
        });
        console.log({response});
        console.log(`response.status = ${response.status}`);
        console.log(`response.statusText = ${response.statusText}`);
        console.log(`response.ok = ${response.ok}`);

        if (response.ok)
        {
            const newPost = await response.json();
            console.log("Successfully posted new userPost to database");
            console.log({newPost});
            div_post_created.innerHTML = `<p class="success">Post successfully uploaded! The new post id is ${newPost.id}</p>`;
            updatePostFeed();
        }
        else
        {
            console.log("Failed to post new userPost to database")
            div_post_created.innerHTML = `<p class="failure">ERROR: failed to upload your post</p>`;
        }
    }
    catch (error)
    {
        console.error(error.message);
        console.log("Failed to connect to the database");
    }
}

async function updatePost(postData) {
    const API_URL = `http://localhost:8080/posts/${postData.id}`;

    const response = await fetch(API_URL, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(postData)
    });
    console.log({response});
    console.log(`response.status = ${response.status}`);
    console.log(`response.statusText = ${response.statusText}`);
    console.log(`response.ok = ${response.ok}`);

    if (response.ok) {
        await updatePostFeed();
    }
}

async function updatePostFeed() {
    const postFeed = document.getElementById('postFeed');
    postFeed.innerHTML = '';

    // Fetch posts from the server
    try {
        const response = await fetch('http://localhost:8080/posts');
        const posts = await response.json();

        // Iterate over posts and append them to the feed
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.id = 'post' + post.id;

            postElement.innerHTML = `
                    <p><strong>${post.username}</strong></p>
                    <p>${post.postBody}</p>
                    <p>${post.timestamp}</p>
                    <div id='commentSection${post.id}'></div>
                    <button class="icon-button" onclick="getComments(${post.id})"></button>
                    <button class="edit-button" onclick="handleEditPost(${post.id}, '${post.postBody}', event)">edit</button>
                `;

            postFeed.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function getComments(postId)
{
    const API_URL = `http://localhost:8080/comments/${postId}`;

    try
    {
        const response = await fetch(API_URL);
        console.log({response});
        console.log(`response.ok = ${response.ok}`);

        if (response.ok)
        {
            const comments = await response.json();

            // this is the div for the post we want to see the comments for
            let post = document.getElementById(`post${postId}`);
            let commentSection = document.getElementById(`commentSection${postId}`);

            // clear the comment section div
            commentSection.innerHTML = '';

            // check if there are any comments
            if (comments.length > 0)
            {
                // iterate through each comment associated with a post, and render it as html under the associated post
                comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';

                    commentElement.innerHTML = `
                    <p><strong>${comment.username}</strong></p>
                    <p>${comment.commentBody}</p>`;

                    commentSection.appendChild(commentElement);
                })
            }
            // if there are no comments
            else
            {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';

                commentElement.innerHTML = `<p><strong>No Comments</strong></p>`;

                commentSection.appendChild(commentElement);
            }
        }
    }
    catch (err)
    {
        console.error("error, could not reach to database");
    }
}

// =====================================================================================================================
// Functions that update the HTML by manipulating the DOM
// =====================================================================================================================

async function handleCreateNewPostEvent(event)
{
    event.preventDefault();

    const formData = new FormData(id_form_create_new_post);
    const userPostData =
    {
        username: formData.get("userName"),
        postBody: formData.get("post")
    };
    console.log({userPostData});
    await createNewUserPost(userPostData);
}

async function handleEditPost(id, body) {
    console.log('handleEditPost - START');
    const editPopup = document.getElementById("editPost");
    const editContent = document.querySelector('.edit-content');
    editContent.innerHTML =
        `<form id="id_form_update_post_details">
            <input type="hidden" name="id" value="${id}">
            <label for="postBody">Edit Post:</label> <br>
            <textarea id="postBody" name="postBody" rows="7" cols="50">${body}</textarea>
            <input class="postButton" type="submit" value="Save" onclick="updatePostFeed()">
        </form>`;
    /* Display the form */
    editPopup.style.display = 'block';

    editPopup.addEventListener('click', function (event) {
       if (event.target === editPopup) {
           editPopup.style.display = 'none'; // closes popup up clicking outside it
       } else {
           event.stopPropagation(); // prevent clicks inside popup from closing it
       }
    });

    const idFormUpdatePostDetailsElement = document.getElementById("id_form_update_post_details");
    idFormUpdatePostDetailsElement.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(idFormUpdatePostDetailsElement);
        const postData =
            {
                id: formData.get("id"),
                postBody: formData.get("postBody")
            }
        console.log({postData});
        editPopup.style.display = 'none';
        updatePost(postData);
    });

    console.log('handleEditPost - END');
}

