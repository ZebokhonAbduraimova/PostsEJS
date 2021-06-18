(function () {
  const flashMessage = document.querySelector("#fileMimeError");
  if (flashMessage) {
    flashMessage.style.display = "none";
  }

  const addPost__form = document.querySelector("#addPost__form");
  if (addPost__form) {
    const addPost__form__submit__btn = document.querySelector(
      "#addPost__form > button"
    );

    addPost__form__submit__btn.disabled = false;

    addPost__form.addEventListener("submit", (e) => {
      e.preventDefault();

      addPost__form__submit__btn.disabled = true;

      const content = tinymce.get("tinyMCE__addPost").getContent();

      const endPoint = "/posts/add";

      const formData = new FormData();
      formData.append("content", content);

      if (addPost__form["file"].files.length > 0) {
        formData.append("file", addPost__form["file"].files[0]);
      }

      fetch(endPoint, {
        method: "POST",
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
        .catch((err) => console.log("error occurred"));
    });
  }
})();
