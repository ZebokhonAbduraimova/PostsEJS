(function () {
  const flashMessage = document.querySelector("#fileMimeError");
  if (flashMessage) {
    flashMessage.style.display = "none";
  }

  const editPost__form = document.querySelector("#editPost__form");
  if (editPost__form) {
    const editPost__form__submit__btn = document.querySelector(
      "#editPost__form > button"
    );

    editPost__form__submit__btn.disabled = false;

    const post = JSON.parse(document.querySelector("#hiddenPostToEdit").value);

    editPost__form.addEventListener("submit", (e) => {
      e.preventDefault();

      editPost__form__submit__btn.disabled = true;

      const content = tinymce.get("tinyMCE__ediPost").getContent();
      const endPoint = `/posts/edit/${post._id}`;

      const formData = new FormData();
      formData.append("content", content);

      if (editPost__form["file"].files.length > 0) {
        formData.append("file", editPost__form["file"].files[0]);
      }

      fetch(endPoint, {
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          // Success
          if (response.status === 200) {
            window.location.replace("/posts");
          }
          // File MIME Type wrong
          else if (response.status === 415) {
            flashMessage.style.display = "block";
          }
          // Anything else
          else {
            window.location.reload();
          }
        })
        .catch((err) => console.log("error occured"));
    });
  }
})();
