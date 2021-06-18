(function () {
  const postForms = document.querySelectorAll("form");

  postForms.forEach((form) =>
    form.addEventListener("submit", () => {
      const submitBtn = form.querySelector("button");
      submitBtn.disabled = true;
    })
  );
})();
